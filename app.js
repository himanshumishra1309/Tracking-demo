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
    try {
        res.render('index'); // Render 'index.ejs'
    } catch (error) {
        console.error('Error rendering index:', error);
        res.status(500).send('Internal Server Error');
    }
});


const PORT = process.env.PORT || 3000; // Use Vercel's dynamic port or default to 3000 for local
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

