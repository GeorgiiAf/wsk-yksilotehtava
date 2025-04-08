export async function loadUserProfile() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const res = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users/token', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok && data.username) {
                const userNameEl = document.getElementById('user-name');
                const userAvatarEl = document.getElementById('user-avatar');
                const userInfoBox = document.getElementById('user-info');

                userNameEl.textContent = data.username;
                userInfoBox.style.display = 'flex';

                if (data.avatar) {
                    userAvatarEl.src = `https://media2.edu.metropolia.fi/restaurant/uploads/${data.avatar}`;
                }
            }
        } catch (error) {
            console.error('Käyttäjätiedot epäonnistui:', error);
        }
    }
}

