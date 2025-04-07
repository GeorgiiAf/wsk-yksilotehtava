// Fetch restaurants from API
export async function fetchRestaurants() {
    try {
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants');
        if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
        const data = await response.json();
        return data.restaurants || data;
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        throw error;
    }
}
export async function fetchRestaurantMenu(restaurantId, menuType = 'day', lang = 'fi') {
    try {
        const endpoint = menuType === 'day'
            ? `v1/restaurants/daily/${restaurantId}/${lang}`
            : `v1/restaurants/weekly/${restaurantId}/${lang}`;

        const response = await fetch(`https://media2.edu.metropolia.fi/restaurant/api/${endpoint}`);
        if (!response.ok) throw new Error('Menu not found');

        return await response.json();
    } catch (error) {
        console.error('Error fetching menu:', error);
        throw error;
    }
}