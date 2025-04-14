import { addMarker, clearMarkers } from './map.js';
import { fetchRestaurants, fetchRestaurantMenu } from './apiRestaurant.js';
import { updateFavoriteRestaurant } from './favoriteRestaurant.js';
import { loadUserProfile } from './profilePanel.js';

let selectedRestaurant = null;
let allRestaurants = [];

// DOM Elements
const dropdownBtn = document.getElementById('restaurant-dropdown-btn');
const dropdownContent = document.getElementById('restaurant-dropdown');
const restaurantsList = document.getElementById('restaurants-list');
const cityFilter = document.getElementById('city-filter');
const providerFilter = document.getElementById('provider-filter');
const restaurantName = document.getElementById('restaurant-name');
const restaurantLocation = document.getElementById('restaurant-location');
const restaurantPhone = document.getElementById('restaurant-phone');
const menuContent = document.getElementById('menu-content');
const menuTypeBtns = document.querySelectorAll('.menu-type-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfile();

    try {
        allRestaurants = await fetchRestaurants();
        populateFilters(allRestaurants);
        renderRestaurants(allRestaurants);
        setupEventListeners();

        if (allRestaurants.length > 0) {
            selectRestaurant(allRestaurants[0]);
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to load restaurants. Please try again later.');
    }
});

function showError(message) {
    restaurantsList.innerHTML = `<li class="error">${message}</li>`;
}

function populateFilters(restaurants) {
    cityFilter.innerHTML = '<option value="">All cities</option>';
    providerFilter.innerHTML = '<option value="">All providers</option>';

    const cities = [...new Set(restaurants.map(r => r.city))].filter(Boolean);
    const companies = [...new Set(restaurants.map(r => r.company))].filter(Boolean);

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });

    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        providerFilter.appendChild(option);
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
            <div class="restaurant-item">
                <strong>${restaurant.name}</strong>
                <div class="restaurant-meta">
                    <span>${restaurant.city || 'City not available'}</span>
                    <span>•</span>
                    <span>${restaurant.company || 'Provider not available'}</span>
                </div>
            </div>
        `;

        li.addEventListener('click', (e) => {
            e.stopPropagation();
            selectRestaurant(restaurant);
            dropdownContent.classList.remove('active');
        });

        restaurantsList.appendChild(li);
    });
}

async function loadRestaurantMenu(restaurantId) {
    try {
        const activeBtn = document.querySelector('.menu-type-btn.active');
        const menuType = activeBtn ? activeBtn.dataset.type : 'day';

        menuContent.innerHTML = '<div class="loading">Loading menu...</div>';

        const menuData = await fetchRestaurantMenu(restaurantId, menuType);
        renderMenu(menuData, menuType);
    } catch (error) {
        console.error('Error loading menu:', error);
        menuContent.innerHTML = '<div class="error">Failed to load menu</div>';
    }
}

function renderMenu(menuData, type) {
    if (!menuData) {
        menuContent.innerHTML = '<div class="error">Menu not available</div>';
        return;
    }

    if (type === 'day') {
        menuContent.innerHTML = `
            <div class="menu-daily">
                ${menuData.courses?.map(course => `
                    <div class="menu-item">
                        <div class="course-name">${course.name || 'Unnamed dish'}</div>
                        <div class="course-info">
                            <span class="course-price">${course.price || ''}</span>
                            ${course.diets ? `<span class="course-diets">${course.diets}</span>` : ''}
                        </div>
                    </div>
                `).join('') || '<p>No menu for today</p>'}
            </div>
        `;
    } else {
        menuContent.innerHTML = `
            <div class="menu-weekly">
                ${menuData.days?.map(day => {
            const [dayOfWeek, date] = day.date.split(' ', 2); // Split into weekday and date

            return `
                        <div class="day-menu">
                            <h4>${dayOfWeek} ${date}</h4>
                            ${day.courses?.map(course => `
                                <div class="menu-item">
                                    <div class="course-name">${course.name || 'Unnamed dish'}</div>
                                    <div class="course-info">
                                        <span class="course-price">${course.price || ''}</span>
                                    </div>
                                </div>
                            `).join('') || '<p>No menu for this day</p>'}
                        </div>
                    `;
        }).join('') || '<p>Weekly menu not available</p>'}
            </div>
        `;
    }
}

// Filter restaurants
function filterRestaurants() {
    const city = cityFilter.value;
    const company = providerFilter.value;

    const filtered = allRestaurants.filter(restaurant => {

        const matchesCity = city === '' || restaurant.city === city;
        const matchesCompany = company === '' || restaurant.company === company;
        return matchesCity && matchesCompany;
    });

    renderRestaurants(filtered);
}

function setupEventListeners() {
    dropdownBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!dropdownContent.contains(e.target)) {
            dropdownContent.classList.remove('active');
        }
    });

    const dropdownElements = [
        cityFilter,
        providerFilter,
        restaurantsList
    ];

    dropdownElements.forEach(el => {
        el?.addEventListener('click', (e) => {
            e.stopPropagation();

            if (el === restaurantsList) {
                const listItem = e.target.closest('li');
                if (listItem) {
                    dropdownContent.classList.remove('active');
                }
            }
        });
    });

    cityFilter?.addEventListener('change', filterRestaurants);
    providerFilter?.addEventListener('change', filterRestaurants);

    // Menu type toggle
    menuTypeBtns?.forEach(btn => {
        btn.addEventListener('click', function () {
            menuTypeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (selectedRestaurant) loadRestaurantMenu(selectedRestaurant._id);
        });
    });
}

function selectRestaurant(restaurant) {
    if (!restaurant) return;

    selectedRestaurant = restaurant;
    console.log('Selected restaurant:', restaurant.name);
    console.log('Restaurant coordinates:', restaurant.location?.coordinates);

    // Update UI
    restaurantName.textContent = restaurant.name || 'Unnamed restaurant';
    restaurantLocation.innerHTML = `<i class="icon">📍</i> ${restaurant.address || ''}, ${restaurant.city || ''}`;
    restaurantPhone.innerHTML = `<i class="icon">📞</i> ${restaurant.phone || 'No phone number'}`;

    const favoriteBtn = document.getElementById('favorite-btn');

    if (favoriteBtn) {
        favoriteBtn.textContent = '❤️ Add to favorites';
        favoriteBtn.onclick = () => {
            updateFavoriteRestaurant(restaurant._id);
        };
    }

    // Update map
    clearMarkers();

    if (restaurant.location?.coordinates) {
        console.log('Adding marker with coordinates:', restaurant.location.coordinates);

        const [longitude, latitude] = restaurant.location.coordinates;
        console.log(`Longitude: ${longitude}, Latitude: ${latitude}`);

        const leafletCoords = [latitude, longitude];
        console.log('Leaflet coordinates:', leafletCoords);

        addMarker(leafletCoords, `
            <h3>${restaurant.name}</h3>
            <p>${restaurant.address}, ${restaurant.city}</p>
        `);
    } else {
        console.error('Invalid restaurant location:', restaurant);
    }

    // Load menu
    loadRestaurantMenu(restaurant._id);
}
