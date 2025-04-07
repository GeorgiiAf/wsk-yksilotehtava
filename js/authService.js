export const authService = {
    // Store the current user in localStorage
    setCurrentUser(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    },

    // Get the current user from localStorage
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    // Get the access token
    getToken() {
        const user = this.getCurrentUser();
        return user ? user.token : null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return this.getToken() !== null;
    },

    // Logout the user
    logout() {
        localStorage.removeItem('currentUser');
    }
};