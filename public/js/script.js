const socket = io();

// Define a custom marker icon with a larger size
const largeIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',  // Use your desired icon image URL
    iconSize: [78, 75], // size of the icon (width, height) - adjust these values to make it bigger
    iconAnchor: [52, 85], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -50] // point from which the popup should open relative to the iconAnchor
});

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

        // Center the map on the user's location
        if (!markers['self']) {  // Check if it's the first time loading the map
            map.setView([latitude, longitude], 20);  // Adjust zoom level to 18 for a closer view
        }

        // Place or update marker on user's location
        addMarker(latitude, longitude, 'self');  // 'self' is used as a unique identifier for the current user

    }, (error) => {
        console.log(error);
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
}

// Initialize Leaflet map
const map = L.map("map").setView([0, 0], 5);  // Initial view set to [0,0] and zoom level 2 (global view)

// Load and add OpenStreetMap tiles to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const markers = {};  // Store markers for all users

// Receive other users' locations from the server
socket.on('receive-location', (data) => {
    const { id, longitude, latitude } = data;

    // Add or update marker for other users
    addMarker(latitude, longitude, id);
});

// Remove marker when a user disconnects
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);  // Remove the marker from the map
        delete markers[id];  // Remove the marker from the markers object
    }
});
