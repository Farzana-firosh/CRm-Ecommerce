// API base URL - make sure this matches your backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Authentication Service functions
export const authService = {
  // User login
  async login(credentials) {
    try {
      console.log('Logging in user:', credentials.email);
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      console.log('Login successful:', data);
      
      // Store token and user info in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRoles', JSON.stringify(data.roles));
      }
      
      return data;
    } catch (error) {
      console.error('Error during login:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
      }
      throw error;
    }
  },

  // Create new user (registration)
  async register(userData) {
    try {
      console.log('Creating new user:', userData.email);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      console.log('Registration successful:', data);
      return data;
    } catch (error) {
      console.error('Error during registration:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
      }
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('currentUser');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Get current user token
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Get user roles
  getUserRoles() {
    const roles = localStorage.getItem('userRoles');
    return roles ? JSON.parse(roles) : [];
  }
};
