import { fetchRestaurants } from './apiRestaurant.js';

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
        console.log('Map initialized with marker at coordinates:', coordinates);
    }
}

export function addMarker(coordinates, popupContent = '', isHighlighted = false) {
    console.log('addMarker called with coordinates:', coordinates);

    if (!map) {
        console.error('Map is not initialized');
        return;
    }

    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        console.error('Invalid coordinates:', coordinates);
        return;
    }

    try {
        if (!window.markerLayer) {
            window.markerLayer = L.layerGroup().addTo(map);
        }


        let markerIcon;

        if (isHighlighted) {
            markerIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            }
            );
        } else {
            markerIcon = new L.Icon.Default();
        }


        const marker = L.marker(coordinates, { icon: markerIcon }).addTo(window.markerLayer);
        console.log('Marker successfully added:', marker);

        if (popupContent) {
            marker.bindPopup(popupContent);
        }

        markers.push(marker);
        map.setView(coordinates, 15);

        console.log('Current marker count:', markers.length);
    } catch (error) {
        console.error('Error adding marker:', error);
    }
}

// Clear all markers from the map
export function clearMarkers() {
    console.log('Clearing old markers, count:', markers.length);

    try {
        if (window.markerLayer) {
            map.removeLayer(window.markerLayer);
        }
        window.markerLayer = L.layerGroup().addTo(map);

        markers = [];
        console.log('Markers cleared, new count:', markers.length);
    } catch (error) {
        console.error('Error clearing markers:', error);
    }
}

// Add markers to the map (all restaurants)
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
