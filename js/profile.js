import { getRestaurantNameById } from './apiRestaurant.js';


async function getUserProfile() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Kirjaudu ensin sisään.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users/token', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('profile-username').textContent = data.username || '';
            document.getElementById('profile-email').textContent = data.email || '';

            const avatarImage = document.getElementById('avatar-image');
            if (data.avatar) {
                avatarImage.src = `https://media2.edu.metropolia.fi/restaurant/uploads/${data.avatar}`;
            } else {
                avatarImage.src = '../images/icon.png';
            }

            if (data.favouriteRestaurant) {
                const restaurantName = await getRestaurantNameById(data.favouriteRestaurant);
                const favRestaurantInput = document.getElementById('Suosikkiravintola');
                if (favRestaurantInput) {
                    favRestaurantInput.value = restaurantName;
                }
            }
        } else {
            alert(data.message || 'Käyttäjän tietojen lataus epäonnistui');
        }

    } catch (error) {
        console.error('Virhe käyttäjän tietojen lataamisessa:', error);
        alert('Jokin meni pieleen, yritä uudelleen.');
    }
}

async function updateUserProfile(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Kirjaudu ensin sisään.');
        window.location.href = 'login.html';
        return;
    }

    const newUsername = document.getElementById('new-username').value.trim();
    const newEmail = document.getElementById('new-email').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();

    const updates = {};

    if (newUsername) updates.username = newUsername;
    if (newEmail) updates.email = newEmail;
    if (newPassword) updates.password = newPassword;

    try {
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
            alert('Päivitys epäonnistui: ' + (data.message || 'Tuntematon virhe'));
            return;
        }

        alert('Profiilin tiedot päivitetty onnistuneesti!');

        if (newPassword) {
            alert('Salasana vaihdettu. Kirjaudu uudelleen sisään.');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

        await getUserProfile();
        document.getElementById('update-profile-form').reset();
    } catch (error) {
        console.error('Virhe profiilin päivittämisessä:', error);
        alert('Jokin meni pieleen, yritä uudelleen.');
    }
}


async function uploadAvatar(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Kirjaudu ensin sisään.');
        window.location.href = 'login.html';
        return;
    }

    const fileInput = document.getElementById('avatar');
    const file = fileInput.files[0];
    if (!file) {
        alert('Valitse kuva ennen lähettämistä.');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert('Profiilikuva päivitetty!');
            const avatarUrl = `https://media2.edu.metropolia.fi/restaurant/uploads/${data.data.avatar}?t=${Date.now()}`;
            document.getElementById('avatar-image').src = avatarUrl;

        } else {
            alert(data.message || 'Kuvan lataus epäonnistui.');
        }
    } catch (error) {
        console.error('Virhe avataria ladattaessa:', error);
        alert('Jokin meni pieleen, yritä uudelleen.');
    }
}

document.addEventListener('DOMContentLoaded', getUserProfile);
document.getElementById('update-profile-form').addEventListener('submit', updateUserProfile);
document.getElementById('avatar-form').addEventListener('submit', uploadAvatar);
