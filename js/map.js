import { fetchRestaurants } from './api.js';

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

    const [longitude, latitude] = coordinates;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
        const marker = L.marker([latitude, longitude]).addTo(map);
        markers.push(marker);
        console.log('Map initialized with marker:', coordinates);
    }
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

// Add markers to the map
function addMarkers(restaurants) {
    restaurants.forEach((restaurant) => {
        const [longitude, latitude] = restaurant.location.coordinates;

        if (typeof latitude === 'number' && typeof longitude === 'number') {
            const marker = L.marker([latitude, longitude]).addTo(map);

            const popupContent = `
                <h3>${restaurant.name}</h3>
                <p>${restaurant.address}, ${restaurant.postalCode} ${restaurant.city}</p>
            `;

            marker.bindPopup(popupContent);
        } else {
            console.error(`Invalid coordinates for restaurant: ${restaurant.name}`);
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    initMap();

    try {
        const restaurants = await fetchRestaurants();
        addMarkers(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
    }
});