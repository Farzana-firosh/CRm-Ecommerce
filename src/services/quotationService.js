// API base URL - make sure this matches your backend server
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
  
  console.log('Token found for quotations:', token ? 'Yes' : 'No');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Quotation Service functions
export const quotationService = {
  // Get all quotations
  async getAllQuotations() {
    try {
      console.log('Fetching quotations from:', `${API_BASE_URL}/quotations`);
      const response = await fetch(`${API_BASE_URL}/quotations`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Quotations received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching quotations:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Make sure the backend server is running on port 5000.');
      }
      throw error;
    }
  },

  // Create a new quotation
  async createQuotation(quotationData) {
    try {
      console.log('Creating quotation:', quotationData);
      const response = await fetch(`${API_BASE_URL}/quotations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(quotationData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Quotation created:', data);
      return data;
    } catch (error) {
      console.error('Error creating quotation:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Make sure the backend server is running on port 5000.');
      }
      throw error;
    }
  },

  // Update quotation status
  async updateQuotationStatus(quotationId, newStatus) {
    try {
      console.log('🔄 QuotationService: Sending status update request:', { quotationId, newStatus });
      
      // Validate inputs
      if (!quotationId && quotationId !== 0) {
        throw new Error('QuotationId is required and cannot be undefined');
      }
      if (!newStatus) {
        throw new Error('NewStatus is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ QuotationService: Server response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ QuotationService: Status update response:', data);
      return data;
    } catch (error) {
      console.error('Error updating quotation status:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Make sure the backend server is running on port 5000.');
      }
      throw error;
    }
  },

  // Delete a quotation
  async deleteQuotation(quotationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  }
};
