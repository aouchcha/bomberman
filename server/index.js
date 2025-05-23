
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/login', (req, res) => {
     
    res.send('Got a POST request')
})


app.listen(port, () => {
    // console.log(`Example app listening on port ${port}`)
    console.log(`Server running at http://localhost:${port}`);
})


// // Import the 'express' library which is used to create the server
// const express = require('express');
// const WebSocket = require('ws');  // Import the 'ws' library for WebSocket functionality

// // Import 'path' module to work with file and directory paths
// const path = require('path');
// // Create an instance of an Express application (this will allow us to handle routes and middleware)
// const app = express();

// // Define the port on which the server will listen for incoming requests (3000 is a common default port)
// const port = 3000;

// // Middleware
// // The following line adds middleware to automatically parse incoming requests with JSON payloads.
// // This means we can easily access JSON data sent to our server in the request body using `req.body`.
// app.use(express.json());

// // The next middleware serves static files like HTML, CSS, and JS files from the 'public' folder.
// // 'path.join(__dirname, 'public')' helps us build an absolute path to the 'public' directory.
// app.use(express.static(path.join(__dirname, '../game-room')));

// // Define the route that listens for POST requests at the endpoint '/submit'
// // When the form is submitted from the front-end, this route will be triggered
// app.post('/login', (req, res) => {
//     // Extract the 'username' from the request body (from the data sent by the client)
//     const { username } = req.body;
//     // Log the username to the console for debugging or monitoring
//     console.log("Received username:", username);
//     // const ws = new WebSocket('ws://localhost:3000/ws');
//     // console.log("Sending username:", ws);
//     // ws.on('open', () => {
//     //     console.log('Connected to WebSocket server');
//     //     // ws.send(username);
//     // });
//     // Send a response back to the client with a message that includes the received username
//     // The backticks (``) allow us to use string interpolation to insert variables into the string
//     res.send(`Username received: ${username}`);
// });

// const wss = new WebSocket.Server({ noServer: true });
// wss.on('connection', (ws) => {
//     console.log('Client connected');
//     ws.on('message', (message) => {
//         console.log(`Received message => ${message}`);
//         //ws.send(`Server received: ${message}`);
//     });
// });


// // Start the server on the defined port (3000 in this case) and set up a callback function that runs when the server is ready
// // The callback simply logs to the console that the server is up and running, and which URL we can visit in the browser
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });
