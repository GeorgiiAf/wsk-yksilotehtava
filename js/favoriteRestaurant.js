export async function updateFavoriteRestaurant(restaurantId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Sinun täytyy kirjautua sisään lisätäksesi suosikkeja.');
        return;
    }

    try {
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                favouriteRestaurant: restaurantId,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Virhe suosikin päivittämisessä:', data.message);
            alert('Suosikin päivittäminen epäonnistui.');
            return;
        }

        console.log('Suosikkiravintola päivitetty:', data);
        alert('Ravintola lisätty suosikiksi!');
    } catch (err) {
        console.error('Virhe verkossa:', err);
        alert('Verkkovirhe suosikin tallennuksessa.');
    }
}
