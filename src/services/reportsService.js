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
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Reports Service functions
export const reportsService = {
  // Get sales report data (uses sales orders for now)
  async getSalesReportData() {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-orders`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch sales data: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      // Transform sales orders data to match reports format
      const salesData = data.map(order => ({
        id: order.id,
        date: order.order_date ? order.order_date.split('T')[0] : order.order_date, // Format date
        customer: order.customer_name || 'Unknown Customer',
        total: parseFloat(order.grand_total) || 0,
        status: mapOrderStatusToPaymentStatus(order.status), // Map order status to payment status
        reference: order.reference_no,
        subtotal: parseFloat(order.subtotal) || 0,
        tax: parseFloat(order.total_tax) || 0
      }));
      
      return salesData;
    } catch (error) {
      console.error('❌ Error fetching sales report data:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
      }
      throw error;
    }
  },

  // Get sales summary/analytics
  async getSalesSummary(startDate, endDate) {
    try {
      const salesData = await this.getSalesReportData();
      
      // Filter by date range if provided
      let filteredSales = salesData;
      if (startDate || endDate) {
        filteredSales = salesData.filter(sale => {
          const saleDate = new Date(sale.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          
          if (start && saleDate < start) return false;
          if (end && saleDate > end) return false;
          return true;
        });
      }
      
      // Calculate summary statistics
      const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
      const totalOrders = filteredSales.length;
      const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      const statusCounts = filteredSales.reduce((acc, sale) => {
        acc[sale.status] = (acc[sale.status] || 0) + 1;
        return acc;
      }, {});
      
      return {
        totalSales,
        totalOrders,
        averageOrder,
        statusCounts,
        salesData: filteredSales
      };
    } catch (error) {
      console.error('❌ Error getting sales summary:', error);
      throw error;
    }
  }
};

// Helper function to map sales order status to payment status
function mapOrderStatusToPaymentStatus(orderStatus) {
  switch (orderStatus?.toLowerCase()) {
    case 'confirmed':
    case 'completed':
    case 'delivered':
      return 'Paid';
    case 'draft':
    case 'pending':
      return 'Unpaid';
    case 'partially_paid':
      return 'Partially Paid';
    default:
      return 'Unpaid';
  }
}
