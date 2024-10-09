const socket = io();

// Function to center map and place marker
const addMarker = (latitude, longitude, id) => {
    if (!markers[id]) {
        markers[id] = L.marker([latitude, longitude]).addTo(map);  // Create a new marker
    } else {
        markers[id].setLatLng([latitude, longitude]);  // Update existing marker position
    }
};

// Check if browser supports geolocation
if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { longitude, latitude } = position.coords;

        // Send user's location to the server
        socket.emit('send-location', { longitude, latitude });

        // Center the map on the user's location the first time
        map.setView([latitude, longitude], 15);  // Set zoom level to 15 for a close-up view

        // Place or update marker on user's location
        addMarker(latitude, longitude, 'self');  // 'self' used as a unique identifier for the current user

    }, (error) => {
        console.log(error);
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
}

// Initialize Leaflet map
const map = L.map("map").setView([0, 0], 2);  // Initial view set to [0,0] and zoom 2

// Load and add OpenStreetMap tiles to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const markers = {};  // Store markers for all users

// Receive other users' locations from the server
socket.on('receive-location', (data) => {
    const { id, longitude, latitude } = data;

    // Center the map and add or update marker for other users
    addMarker(latitude, longitude, id);
});

// Remove marker when a user disconnects
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);  // Remove the marker from the map
        delete markers[id];  // Remove the marker from the markers object
    }
});
