const API_BASE_URL = 'http://localhost:5000/api';

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
  
  console.log('SalesOrder Token found:', token ? 'Yes' : 'No');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const salesOrderService = {
  // Get all sales orders
  getAllSalesOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-orders`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sales orders: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      throw error;
    }
  },

  // Get sales order by ID
  getSalesOrderById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-orders/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sales order: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sales order:', error);
      throw error;
    }
  },

  // Create a new sales order
  createSalesOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create sales order: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating sales order:', error);
      throw error;
    }
  },

  // Confirm a sales order
  confirmSalesOrder: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-orders/${id}/confirm`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to confirm sales order: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error confirming sales order:', error);
      throw error;
    }
  }
};
