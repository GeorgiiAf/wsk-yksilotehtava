// login.js

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();  // Предотвращаем стандартное поведение формы (перезагрузку страницы)

    const username = document.getElementById('username').value; // Получаем значение имени пользователя
    const password = document.getElementById('password').value; // Получаем значение пароля

    try {
        // Отправляем запрос на сервер для аутентификации
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),  // Отправляем имя пользователя и пароль в формате JSON
        });

        // Получаем ответ от сервера
        const data = await response.json();

        if (response.ok) {
            // Если логин прошел успешно, сохраняем токен в localStorage
            localStorage.setItem('token', data.token);

            // Перенаправляем на страницу профиля
            window.location.href = 'profile.html';  // Замените на страницу вашего профиля
        } else {
            // Если произошла ошибка, выводим сообщение об ошибке
            alert(data.message || 'Kirjautuminen epäonnistui');
        }
    } catch (error) {
        // В случае ошибки при отправке запроса
        console.error('Kirjautuminen virhe:', error);
        alert('Jokin meni pieleen, yritä uudelleen.');
    }
});
