async function login(username, password) {
    const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
        console.log('Login successful:', data);
        localStorage.setItem('token', data.token);

        window.location.href = 'profile.html';
    } else {
        console.error('Login failed:', data.message);
        alert('Login failed: ' + data.message);
    }
}


document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    login(username, password);
});