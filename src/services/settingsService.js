const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Check multiple possible token storage locations
  let token = localStorage.getItem('authToken'); // From authService
  
  if (!token) {
    // Check if token is stored in currentUser object (from Login.jsx)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        token = userData.token;
      } catch (e) {
        console.error('Error parsing currentUser from localStorage:', e);
      }
    }
  }
  
  if (!token) {
    // Also check for 'token' key directly
    token = localStorage.getItem('token');
  }
  
  console.log('Settings Token found:', token ? 'Yes' : 'No');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const settingsService = {
  // Currency API calls
  getAllCurrencies: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/currencies`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch currencies: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  },

  createCurrency: async (currencyData) => {
    try {
      // Transform frontend data to match backend schema
      const backendData = {
        currency_code: currencyData.code,
        symbol: currencyData.symbol,
        status: currencyData.status
      };

      const response = await fetch(`${API_BASE_URL}/currencies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create currency: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating currency:', error);
      throw error;
    }
  },

  updateCurrency: async (currencyId, currencyData) => {
    try {
      // Transform frontend data to match backend schema
      const backendData = {
        currency_code: currencyData.code,
        symbol: currencyData.symbol,
        status: currencyData.status
      };

      const response = await fetch(`${API_BASE_URL}/currencies/${currencyId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update currency: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating currency:', error);
      throw error;
    }
  },

  deleteCurrency: async (currencyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/currencies/${currencyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete currency: ${response.status} - ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting currency:', error);
      throw error;
    }
  },

  // Tax API calls
  getAllTaxes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/taxes`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch taxes: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching taxes:', error);
      throw error;
    }
  },

  createTax: async (taxData) => {
    try {
      // Transform frontend data to match backend schema
      const backendData = {
        tax_name: taxData.name,
        rate: parseFloat(taxData.rate),
        status: taxData.status
      };

      const response = await fetch(`${API_BASE_URL}/taxes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create tax: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating tax:', error);
      throw error;
    }
  },

  updateTax: async (taxId, taxData) => {
    try {
      // Transform frontend data to match backend schema
      const backendData = {
        tax_name: taxData.name,
        rate: parseFloat(taxData.rate),
        status: taxData.status
      };

      const response = await fetch(`${API_BASE_URL}/taxes/${taxId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update tax: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating tax:', error);
      throw error;
    }
  },

  deleteTax: async (taxId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/taxes/${taxId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete tax: ${response.status} - ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting tax:', error);
      throw error;
    }
  },

  // Organization API calls
  getOrganizationInfo: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/organization`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch organization info: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching organization info:', error);
      throw error;
    }
  },

  updateOrganizationInfo: async (orgId, orgData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organization/${orgId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(orgData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update organization info: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating organization info:', error);
      throw error;
    }
  },

  createOrganizationInfo: async (orgData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organization`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orgData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create organization info: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating organization info:', error);
      throw error;
    }
  },

  // Users API calls (we'll use the existing userService for this)
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      // Add default password if not provided
      const userDataWithPassword = {
        ...userData,
        password: userData.password || 'defaultPassword123' // You might want to generate a random password or ask user for it
      };

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userDataWithPassword),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create user: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update user: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete user: ${response.status} - ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Roles API calls
  getAllRoles: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/roles`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }
};
