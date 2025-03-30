import { initMap, addMarker, clearMarkers } from './map.js';
import { fetchRestaurants, fetchRestaurantMenu } from './api.js';


let selectedRestaurant = null;
let allRestaurants = [];

// DOM Elements
const dropdownBtn = document.getElementById('restaurant-dropdown-btn');
const dropdownContent = document.getElementById('restaurant-dropdown');
const restaurantsList = document.getElementById('restaurants-list');
const searchInput = document.getElementById('restaurant-search');
const cityFilter = document.getElementById('city-filter');
const providerFilter = document.getElementById('provider-filter');
const restaurantName = document.getElementById('restaurant-name');
const restaurantLocation = document.getElementById('restaurant-location');
const restaurantPhone = document.getElementById('restaurant-phone');
const menuContent = document.getElementById('menu-content');
const menuTypeBtns = document.querySelectorAll('.menu-type-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing application...');

    try {
        // Initialize map
        initMap([60.1699, 24.9384]);

        // Load restaurants
        allRestaurants = await fetchRestaurants();
        populateFilters(allRestaurants);
        renderRestaurants(allRestaurants);
        setupEventListeners();

        // Show first restaurant by default
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
    console.log('Populating filters with restaurants:', restaurants); // Отладка

    cityFilter.innerHTML = '<option value="">Kaikki kaupungit</option>';
    providerFilter.innerHTML = '<option value="">Kaikki palveluntarjoajat</option>';

    const cities = [...new Set(restaurants.map(r => r.city))].filter(Boolean);
    const providers = [...new Set(restaurants.map(r => r.provider))].filter(Boolean);

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });

    providers.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider;
        option.textContent = provider;
        providerFilter.appendChild(option);
    });
}

// Render restaurants list
function renderRestaurants(restaurants) {
    console.log('Rendering restaurants:', restaurants); // Отладка
    restaurantsList.innerHTML = '';

    if (restaurants.length === 0) {
        restaurantsList.innerHTML = '<li class="no-results">Ei ravintoloita löytynyt</li>';
        return;
    }

    restaurants.forEach(restaurant => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${restaurant.name}</strong>
            <div class="restaurant-info">
                <span>${restaurant.city || 'Kaupunki ei saatavilla'}</span>
                <span>•</span>
                <span>${restaurant.provider || 'Tarjoaja ei saatavilla'}</span>
            </div>
        `;
        li.addEventListener('click', () => {
            selectRestaurant(restaurant);
            dropdownContent.style.display = 'none';
        });
        restaurantsList.appendChild(li);
    });
}



async function loadRestaurantMenu(restaurantId) {
    try {
        const activeBtn = document.querySelector('.menu-type-btn.active');
        const menuType = activeBtn ? activeBtn.dataset.type : 'day';

        menuContent.innerHTML = '<div class="loading">Ladataan ruokalistaa...</div>';

        const menuData = await fetchRestaurantMenu(restaurantId, menuType);
        renderMenu(menuData, menuType);
    } catch (error) {
        console.error('Error loading menu:', error);
        menuContent.innerHTML = '<div class="error">Ruokalistan lataaminen epäonnistui</div>';
    }
}


function renderMenu(menuData, type) {
    if (!menuData) {
        menuContent.innerHTML = '<div class="error">Ruokalista ei saatavilla</div>';
        return;
    }

    if (type === 'day') {
        menuContent.innerHTML = `
            <div class="menu-daily">
                ${menuData.courses?.map(course => `
                    <div class="menu-item">
                        <div class="course-name">${course.name || 'Nimetön ruoka'}</div>
                        <div class="course-info">
                            <span class="course-price">${course.price || ''}</span>
                            ${course.diets ? `<span class="course-diets">${course.diets}</span>` : ''}
                        </div>
                    </div>
                `).join('') || '<p>Ei ruokalistaa tälle päivälle</p>'}
            </div>
        `;
    } else {
        menuContent.innerHTML = `
            <div class="menu-weekly">
                ${menuData.days?.map(day => `
                    <div class="day-menu">
                        <h4>${new Date(day.date).toLocaleDateString('fi-FI', { weekday: 'long', day: 'numeric', month: 'numeric' })}</h4>
                        ${day.courses?.map(course => `
                            <div class="menu-item">
                                <div class="course-name">${course.name || 'Nimetön ruoka'}</div>
                                <div class="course-info">
                                    <span class="course-price">${course.price || ''}</span>
                                </div>
                            </div>
                        `).join('') || '<p>Ei ruokalistaa tälle päivälle</p>'}
                    </div>
                `).join('') || '<p>Viikon ruokalista ei saatavilla</p>'}
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
            (restaurant.city && restaurant.city.toLowerCase().includes(searchTerm));
        const matchesCity = city === '' || restaurant.city === city;
        const matchesProvider = provider === '' || restaurant.provider === provider;

        return matchesSearch && matchesCity && matchesProvider;
    });

    renderRestaurants(filtered);
}

function setupEventListeners() {
    // Переключение выпадающего списка
    dropdownBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.classList.toggle('active');
    });

    // Предотвращаем закрытие при клике внутри выпадающего списка
    dropdownContent?.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Закрытие при клике вне списка
    document.addEventListener('click', () => {
        dropdownContent.classList.remove('active');
    });

    // Обработчики для фильтров (остаются без изменений)
    searchInput?.addEventListener('input', filterRestaurants);
    cityFilter?.addEventListener('change', filterRestaurants);
    providerFilter?.addEventListener('change', filterRestaurants);

    // Переключение типа меню
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
    console.log('Selected restaurant:', restaurant); // Отладка

    // Update UI
    restaurantName.textContent = restaurant.name || 'Nimetön ravintola';
    restaurantLocation.innerHTML = `<i class="icon">📍</i> ${restaurant.address || ''}, ${restaurant.city || ''}`;
    restaurantPhone.innerHTML = `<i class="icon">📞</i> ${restaurant.phone || 'Ei puhelinnumeroa'}`;

    // Update map
    clearMarkers();
    if (restaurant.location?.coordinates) {
        console.log('Initializing map with coordinates:', restaurant.location.coordinates); // Отладка
        initMap(restaurant.location.coordinates);
        addMarker(restaurant.location.coordinates, `
            <h3>${restaurant.name}</h3>
            <p>${restaurant.address}, ${restaurant.city}</p>
        `);
    } else {
        console.error('Invalid restaurant location:', restaurant);
    }

    // Load menu
    loadRestaurantMenu(restaurant._id);
}