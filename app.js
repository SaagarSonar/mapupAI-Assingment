//we Import necessary libraries and modules as express module as function to call express module,turf and uuid for authorization of our data
const express = require('express');
//express to create an instance of express apllication
const bodyParser = require('body-parser');
//body parser is used as middleware to parse JSON bodies in request
const turf = require('@turf/turf');
//turf is a library for spatial calculations
const { v4: uuidv4 } = require('uuid');
//uuid is used to generate a unique token

// we created a function to call our api or is a instance of Express app
const app = express();

// this is a Middleware for parsing JSON bodies that we we sending to test the data
app.use(bodyParser.json());

// it is the array of 50 randomly spread lines
const lines = [
    { id: 'L01', start: [1, 1], end: [2, 2] },
    // Add the rest of the lines...
];

// Helper function to check if a line intersects with a linestring
function checkIntersection(line, linestring)
//above is a helper function
{
    const lineStringCoords = [line.start, line.end];
    const lineString = turf.lineString(lineStringCoords);
    const intersection = turf.lineIntersect(linestring, lineString);

    if (intersection.features.length > 0) {
        // If there is an intersection, return the line id and point of intersection
        const intersectingLine = intersection.features[0];
        return { id: line.id, intersectPoint: intersectingLine.geometry.coordinates };
    }

    return null; // No intersection
}

// we Generate authentication token using this which uses uuid library
const authToken = uuidv4();

//we have bunch of method all this method corresponds to http,to handle http post request we use post method we also have get,put and delete requests methods.
// it is route for the intersections API, //as / it route of function with have two argument as request and response,it have bunch request property.
// we created  the POST endpoint for the intersections API
app.post('/intersections', (req, res) => {
    // Check if the request has a valid authorization header
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${authToken}`) {
        // we are generilizing a authentication token if auth header is missing or invalid, return a 401 error
        console.error('Invalid authorization token');
        return res.status(401).json({ error: 'Invalid authorization token' });
    }

    // it is a Check for the request body has a valid GeoJSON linestring or not.
    const linestring = req.body;
    if (!linestring || linestring.type !== 'Feature' || linestring.geometry.type !== 'LineString') {
        // if linestring is missing or invalid, return a 400 error
        console.error('Invalid linestring');
        return res.status(400).json({ error: 'Invalid linestring' });
    }

    // Log the incoming request
    console.log('Received request:', req.body);

    // Check for intersections with each line
    const intersections = [];
    lines.forEach((line) => {
        const intersection = checkIntersection(line, linestring);
        if (intersection) {
            intersections.push(intersection);
        }
    });

    // Return the intersections or an empty array
    return res.json(intersections);
});

// Start the server
// as app.listen it is function to list on sever with port number as 3000 
app.listen(3000, () => {
    console.log('Intersections API server started on port 3000');
    //for giving Authentication token
    console.log('Authentication token:', authToken);
});
