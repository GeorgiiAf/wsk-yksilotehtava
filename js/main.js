import { initMap, addMarker, clearMarkers } from './map.js';
import { fetchRestaurants, fetchRestaurantMenu } from './api.js';

let selectedRestaurant = null;

// DOM Elements
const dropdownBtn = document.getElementById('restaurant-dropdown-btn');
const dropdownContent = document.getElementById('restaurant-dropdown');
const restaurantsList = document.getElementById('restaurants-list');
const searchInput = document.getElementById('restaurant-search');
const cityFilter = document.getElementById('city-filter');
const providerFilter = document.getElementById('provider-filter');
const selectedRestaurantName = document.getElementById('selected-restaurant-name');
const restaurantName = document.getElementById('restaurant-name');
const restaurantLocation = document.getElementById('restaurant-location').querySelector('.text');
const restaurantPhone = document.getElementById('restaurant-phone').querySelector('.text');
const menuContent = document.getElementById('menu-content');
const menuTypeBtns = document.querySelectorAll('.menu-type-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize map
    initMap([60.1699, 24.9384]); // Default to Helsinki center

    // Load restaurants
    try {
        allRestaurants = await fetchRestaurants();
        populateFilters(allRestaurants);
        renderRestaurants(allRestaurants);
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        restaurantsList.innerHTML = '<li class="error">Failed to load restaurants</li>';
    }
});

// Fetch restaurants from API
async function fetchRestaurants() {
    try {
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.restaurants || data;
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        throw error;
    }
}

// Populate filter dropdowns
function populateFilters(restaurants) {
    // Get unique cities and providers
    const cities = [...new Set(restaurants.map(r => r.city))];
    const providers = [...new Set(restaurants.map(r => r.company))];

    // Populate city filter
    cities.forEach(city => {
        cityFilter.innerHTML += `<option value="${city}">${city}</option>`;
    });

    // Populate provider filter
    providers.forEach(provider => {
        providerFilter.innerHTML += `<option value="${provider}">${provider}</option>`;
    });
}

// Render restaurants list
function renderRestaurants(restaurants) {
    restaurantsList.innerHTML = '';

    if (restaurants.length === 0) {
        restaurantsList.innerHTML = '<li class="no-results">No restaurants found</li>';
        return;
    }

    restaurants.forEach(restaurant => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${restaurant.name}</strong>
            <div class="restaurant-info">
                <span>${restaurant.city}</span>
                <span>•</span>
                <span>${restaurant.company}</span>
            </div>
        `;

        li.addEventListener('click', () => {
            selectRestaurant(restaurant);
            dropdownContent.style.display = 'none';
        });

        restaurantsList.appendChild(li);
    });
}

// Load restaurant menu
async function loadRestaurantMenu(restaurantId) {
    try {
        const activeBtn = document.querySelector('.menu-type-btn.active');
        const menuType = activeBtn ? activeBtn.dataset.type : 'day';

        const endpoint = menuType === 'day'
            ? `daily/${restaurantId}/fi`
            : `weekly/${restaurantId}/fi`;

        const response = await fetch(`https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/${endpoint}`);
        if (!response.ok) throw new Error('Menu not found');

        const menuData = await response.json();
        renderMenu(menuData, menuType);
    } catch (error) {
        console.error('Error loading menu:', error);
        menuContent.innerHTML = '<div class="error">Failed to load menu</div>';
    }
}

// Render menu
function renderMenu(menuData, type) {
    if (type === 'day') {
        menuContent.innerHTML = `
            <div class="menu-daily">
                ${menuData.courses.map(course => `
                    <div class="menu-item">
                        <div class="course-name">${course.name}</div>
                        <div class="course-info">
                            <span class="course-price">${course.price || ''}</span>
                            ${course.diets ? `<span class="course-diets">${course.diets}</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        menuContent.innerHTML = `
            <div class="menu-weekly">
                ${menuData.days.map(day => `
                    <div class="day-menu">
                        <h4>${new Date(day.date).toLocaleDateString('fi-FI', { weekday: 'long', day: 'numeric', month: 'numeric' })}</h4>
                        ${day.courses.map(course => `
                            <div class="menu-item">
                                <div class="course-name">${course.name}</div>
                                <div class="course-info">
                                    <span class="course-price">${course.price || ''}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Filter restaurants
function filterRestaurants() {
    const searchTerm = searchInput.value.toLowerCase();
    const city = cityFilter.value;
    const provider = providerFilter.value;

    const filtered = allRestaurants.filter(restaurant => {
        const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm) ||
            restaurant.city.toLowerCase().includes(searchTerm);
        const matchesCity = city === '' || restaurant.city === city;
        const matchesProvider = provider === '' || restaurant.company === provider;

        return matchesSearch && matchesCity && matchesProvider;
    });

    renderRestaurants(filtered);
}

// Setup event listeners
function setupEventListeners() {
    // Dropdown toggle
    dropdownBtn.addEventListener('click', () => {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!dropdownBtn.contains(event.target)) {
            dropdownContent.style.display = 'none';
        }
    });

    // Filter events
    searchInput.addEventListener('input', filterRestaurants);
    cityFilter.addEventListener('change', filterRestaurants);
    providerFilter.addEventListener('change', filterRestaurants);

    // Menu type toggle
    menuTypeBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            menuTypeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            if (selectedRestaurant) {
                loadRestaurantMenu(selectedRestaurant._id);
            }
        });
    });
}


// Select a restaurant
function selectRestaurant(restaurant) {
    selectedRestaurant = restaurant;

    // Update UI
    selectedRestaurantName.textContent = restaurant.name;
    restaurantName.textContent = restaurant.name;
    restaurantLocation.textContent = `${restaurant.address}, ${restaurant.city}`;
    restaurantPhone.textContent = restaurant.phone || 'Not available';

    // Update map
    if (restaurant.location && restaurant.location.coordinates) {
        initMap(restaurant.location.coordinates);
        addMarker(restaurant.location.coordinates, `
            <h3>${restaurant.name}</h3>
            <p>${restaurant.address}, ${restaurant.city}</p>
        `);
    }

    // Load menu
    loadRestaurantMenu(restaurant._id);
}