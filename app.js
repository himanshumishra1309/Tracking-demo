const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

// Create server
const server = http.createServer(app);
const io = socketio(server);

// Socket.io connection event
io.on("connection", function (socket) {
    socket.on("send-location", function (data) {
        io.emit("receive-location", {id: socket.id, ...data});
    });
    console.log("User Connected", socket.id);

    socket.on("disconnect", function () {
        io.emit("user-disconnected", socket.id);
    });
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'))); // Correct way to serve static files

// Set view engine to EJS
app.set('view engine', 'ejs');

// Serve the homepage
app.get('/', (req, res) => {
    res.render('index'); // Render 'index.ejs'
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
