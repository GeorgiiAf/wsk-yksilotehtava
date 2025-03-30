const L = window.L;
let map;
let markers = [];

// Initialize Leaflet map
export function initMap(coordinates = [60.1699, 24.9384]) {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        console.error('Invalid coordinates passed to initMap:', coordinates);
        return;
    }

    if (map) {
        map.setView(coordinates, 15);
    } else {
        map = L.map('map-container').setView(coordinates, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
    }

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Add new marker if coordinates are valid
    const marker = L.marker(coordinates).addTo(map);
    markers.push(marker);
    console.log('Map initialized with marker:', coordinates); // Отладка
}
// Add a marker to the map
export function addMarker(coordinates, popupContent = '') {
    if (map && coordinates.length === 2) {
        const marker = L.marker(coordinates).addTo(map);
        if (popupContent) {
            marker.bindPopup(popupContent);
        }
        markers.push(marker);
    }
}

// Clear all markers from the map
export function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}