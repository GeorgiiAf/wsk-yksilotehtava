
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Rekisteröinti onnistui! Voit kirjautua sisään.');
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Rekisteröinti epäonnistui');
        }
    } catch (error) {
        console.error('Rekisteröinti virhe:', error);
        alert('Jokin meni pieleen, yritä uudelleen.');
    }
});
