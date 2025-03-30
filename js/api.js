// Fetch restaurants from API
export async function fetchRestaurants() {
    try {
        console.log('Fetching restaurants...');
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants');
        if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
        const data = await response.json();
        console.log('Fetched restaurants:', data);
        return data.restaurants || data;
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        throw error;
    }
}
// Fetch restaurant menu from API
export async function fetchRestaurantMenu(restaurantId, menuType = 'day') {
    try {
        const endpoint = menuType === 'day'
            ? `daily/${restaurantId}/fi`
            : `weekly/${restaurantId}/fi`;

        const response = await fetch(`https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/${endpoint}`);
        if (!response.ok) throw new Error('Menu not found');

        return await response.json();
    } catch (error) {
        console.error('Error fetching menu:', error);
        throw error;
    }
}