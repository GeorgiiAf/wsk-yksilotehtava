import { initMap, addMarker, clearMarkers } from './map.js';
import { fetchRestaurants, fetchRestaurantMenu } from './api.js';
import { userService } from './userManagment.js';
import { authService } from './authService.js';

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

    try {

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

    cityFilter.innerHTML = '<option value="">Kaikki kaupungit</option>';
    providerFilter.innerHTML = '<option value="">Kaikki palveluntarjoajat</option>';

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
        restaurantsList.innerHTML = '<li class="no-results">Ei ravintoloita löytynyt</li>';
        return;
    }

    restaurants.forEach(restaurant => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="restaurant-item">
                <strong>${restaurant.name}</strong>
                <div class="restaurant-meta">
                    <span>${restaurant.city || 'Kaupunki ei saatavilla'}</span>
                    <span>•</span>
                    <span>${restaurant.company || 'Tarjoaja ei saatavilla'}</span>
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
    const company = providerFilter.value;

    const filtered = allRestaurants.filter(restaurant => {
        const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm) ||
            (restaurant.city && restaurant.city.toLowerCase().includes(searchTerm));
        const matchesCity = city === '' || restaurant.city === city;
        const matchesCompany = company === '' || restaurant.company === company;
        return matchesSearch && matchesCity && matchesCompany;
    });

    renderRestaurants(filtered);
}

function setupEventListeners() {
    // Переключение выпадающего списка
    dropdownBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.classList.toggle('active');
    });

    // Обработчик для всего документа
    document.addEventListener('click', (e) => {
        // Закрываем только если клик был вне выпадающего списка и не по кнопке
        if (!dropdownContent.contains(e.target)) {
            dropdownContent.classList.remove('active');
        }
    });

    // Специальные обработчики для элементов внутри выпадающего списка
    const dropdownElements = [
        searchInput,
        cityFilter,
        providerFilter,
        restaurantsList
    ];

    dropdownElements.forEach(el => {
        el?.addEventListener('click', (e) => {
            e.stopPropagation();

            // Для элементов списка ресторанов - дополнительная логика
            if (el === restaurantsList) {
                const listItem = e.target.closest('li');
                if (listItem) {
                    dropdownContent.classList.remove('active');
                }
            }
        });
    });

    // Обработчики изменений фильтров
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

    // Update UI
    restaurantName.textContent = restaurant.name || 'Nimetön ravintola';
    restaurantLocation.innerHTML = `<i class="icon">📍</i> ${restaurant.address || ''}, ${restaurant.city || ''}`;
    restaurantPhone.innerHTML = `<i class="icon">📞</i> ${restaurant.phone || 'Ei puhelinnumeroa'}`;

    // Update map
    clearMarkers();
    if (restaurant.location?.coordinates) {
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


document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await userService.register(username, password, email);
        alert('Registration successful! Please check your email to activate your account.');
        // Optionally redirect to login page
    } catch (error) {
        alert(error.message);
    }
});