const API_BASE_URL = "https://media2.edu.metropolia.fi/restaurant/api/v1/";

export const userService = {
    // Register a new user
    async register(username, password, email) {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Get current user by token
    async getCurrentUser(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Session expired, please log in again');
                }
                throw new Error('Failed to fetch user data');
            }

            return await response.json();
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    },

    // Update user information
    async updateUser(token, updates) {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Failed to update user information');
            }

            return await response.json();
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    },

    // Delete user account
    async deleteUser(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user account');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    },

    // Upload avatar image
    async uploadAvatar(token, file) {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch(`${API_BASE_URL}/users/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload avatar');
            }

            return await response.json();
        } catch (error) {
            console.error('Avatar upload error:', error);
            throw error;
        }
    }
};