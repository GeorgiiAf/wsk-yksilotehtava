
const API_URL = 'https://media2.edu.metropolia.fi/restaurant/api/v1/';

const restaurantsList = document.getElementById('restaurants');
const menuContent = document.getElementById('menu-content');
const menuTitle = document.getElementById('menu-title');
const cityFilter = document.getElementById('city-filter');
const providerFilter = document.getElementById('provider-filter');
const menuTypeSelect = document.getElementById('menu-type');
const loginForm = document.getElementById('login-form');



async function fetchRestaraunts() {
    const response = await fetch(`${API_URL}/restaurants`);
    if (!response.ok) throw new Error('Failed to load restaurants');
    return await response.json();
}

async function fetchDailyMenu(restaurantId) {
    const response = await fetch(`${API_URL}/restaurants/daily/${restarauntId}/fi`);
    if (!response.ok) throw new Error('Menu not found');
    return await response.json();
}

async function fetchWeeklyMenu(restaurantId) {
    const response = await fetch(`${API_URL}/restaurants/weekly/${restaurantId}/fi`);
    if (!response.ok) throw new Error('Menu not found');
    return await response.json();
}


