// API base URL - make sure this matches your backend server
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
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Product/Items Service functions
export const productService = {
  // Get all items
  async getAllItems() {
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch items: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching items:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
      }
      throw error;
    }
  },

  // Create a new item
  async createItem(itemData) {
    try {
      console.log('Creating item:', itemData);
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create item');
      }
      
      const data = await response.json();
      console.log('Item created:', data);
      return data;
    } catch (error) {
      console.error('Error creating item:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
      }
      throw error;
    }
  },

  // Update item status
  async updateItemStatus(itemId, status) {
    try {
      console.log(`Updating item ${itemId} status to:`, status);
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item status');
      }
      
      const data = await response.json();
      console.log('Item status updated:', data);
      return data;
    } catch (error) {
      console.error('Error updating item status:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
      }
      throw error;
    }
  },

  // Update item
  async updateItem(itemId, itemData) {
    try {
      console.log(`Updating item ${itemId}:`, itemData);
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item');
      }
      
      const data = await response.json();
      console.log('Item updated:', data);
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
      }
      throw error;
    }
  },

  // Delete item
  async deleteItem(itemId) {
    try {
      console.log('Deleting item:', itemId);
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }
      
      console.log('Item deleted successfully');
      return { message: 'Item deleted successfully' };
    } catch (error) {
      console.error('Error deleting item:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
      }
      throw error;
    }
  }
};
