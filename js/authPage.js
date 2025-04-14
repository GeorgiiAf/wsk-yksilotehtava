document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('auth-btn');
    if (!authBtn) return;

    const token = localStorage.getItem('token');
    if (token) {
        authBtn.textContent = 'Kirjaudu ulos';
        authBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    } else {
        authBtn.textContent = 'Kirjaudu sisään';
        authBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
});
