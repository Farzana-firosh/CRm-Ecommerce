import React, { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';

const PAYMENT_STATUS = ['Unpaid', 'Partially Paid', 'Paid'];

export default function SimpleInvoice() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [salesOrderNo, setSalesOrderNo] = useState('');
  const [currency, setCurrency] = useState('$');
  const [terms, setTerms] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [globalDiscountType, setGlobalDiscountType] = useState('%');
  const [lineItems, setLineItems] = useState([
    { item_id: '', name: '', type: 'Product', quantity: 1, unit_price: 0, discount_value: 0, discount_type: 'percent', tax_rate: 0 }
  ]);

  // Additional state variables for form management
  const [editIndex, setEditIndex] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');
  const [payments, setPayments] = useState([]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoiceService.getAllInvoices();
      setInvoices(data);
    } catch (err) {
      setError('Failed to fetch invoices. Please try again.');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllItems();
      if (Array.isArray(data)) {
        const transformedProducts = data.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.default_rate) || 0,
          tax_rate: parseFloat(item.tax_rate) || 0
        }));
        setProducts(transformedProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const addLineItem = () => {
    const currentItems = lineItems || [];
    setLineItems([...currentItems, { item_id: '', name: '', type: 'Product', quantity: 1, unit_price: 0, discount_value: 0, discount_type: 'percent', tax_rate: 0 }]);
  };
  const handleLineChange = (index, field, value) => {
    const currentItems = lineItems || [];
    const newLineItems = [...currentItems];
    
    // Handle product selection
    if (field === 'item_id') {
      const selectedProduct = products.find(p => p.id === parseInt(value));
      if (selectedProduct) {
        newLineItems[index].item_id = value;
        newLineItems[index].name = selectedProduct.name;
        newLineItems[index].unit_price = selectedProduct.price;
        newLineItems[index].tax_rate = selectedProduct.tax_rate || 0;
      }
    } else if (['quantity', 'unit_price', 'discount_value', 'tax_rate'].includes(field)) {
      value = Number(value);
      if (value < 0) value = 0;
      newLineItems[index][field] = value;
    } else {
      newLineItems[index][field] = value;
    }

    setLineItems(newLineItems);
  };

  // Remove a line item
  const removeLineItem = (index) => {
    const currentItems = lineItems || [];
    setLineItems(currentItems.filter((_, i) => i !== index));
  };

  const calcLineSubtotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    const discountValue = parseFloat(item.discount_value) || 0;
    const taxRate = parseFloat(item.tax_rate) || 0;
    
    let base = quantity * unitPrice;
    let discount = item.discount_type === 'percent' ? (base * discountValue) / 100 : discountValue;
    let afterDiscount = base - discount;
    let tax = (afterDiscount * taxRate) / 100;
    return afterDiscount + tax;
  };

  const calcSubtotal = () => {
    const currentItems = lineItems || [];
    return currentItems.reduce((sum, item) => sum + calcLineSubtotal(item), 0);
  };

  const calcGlobalDiscount = (subtotal) => {
    const discountValue = parseFloat(globalDiscount) || 0;
    if (globalDiscountType === '%') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  };

  const calculateTotal = () => {
    const subtotal = calcSubtotal();
    const discount = calcGlobalDiscount(subtotal);
    return Math.max(subtotal - discount, 0);
  };

  const calculateBalanceDue = (total, paymentsArr) => {
    const paid = paymentsArr.reduce((sum, p) => sum + Number(p.amount), 0);
    return Math.max(total - paid, 0);
  };

  const saveInvoice = async () => {
    if (!customerId) {
      alert('Please select a customer');
      return;
    }
    const currentItems = lineItems || [];
    if (currentItems.length === 0 || !currentItems[0].item_id) {
      alert('Please select at least one item');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const createdBy = currentUser.email || 'Unknown User';

      // Prepare invoice data for backend
      const invoiceData = {
        customer_id: parseInt(customerId),
        invoice_date: invoiceDate,
        due_date: dueDate,
        sales_order_id: salesOrderNo ? parseInt(salesOrderNo) : null,
        currency: currency,
        status: 'Unpaid',
        created_by: createdBy,
        terms: terms,
        items: currentItems.filter(item => item.item_id).map(item => ({
          item_id: parseInt(item.item_id),
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_type: item.discount_type === 'percent' ? 'percent' : 'flat',
          discount_value: item.discount_value || 0,
          tax_rate: item.tax_rate / 100 // Convert percentage to decimal
        }))
      };

      const result = await invoiceService.createInvoice(invoiceData);
      console.log('Invoice created:', result);

      // Refresh invoices list
      await fetchInvoices();
      
      resetForm();
      setShowForm(false);
      alert('Invoice created successfully!');
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError(`Failed to create invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const editInvoice = async (idx) => {
    try {
      const invoice = invoices[idx];
      setLoading(true);
      
      // Fetch full invoice data with line items
      const fullInvoiceData = await invoiceService.getInvoiceById(invoice.id);
      
      // Map backend data to frontend format
      setCustomerId(fullInvoiceData.customer_id || '');
      setCustomerName(fullInvoiceData.customer_name || invoice.customer_name || '');
      setInvoiceDate(fullInvoiceData.invoice_date ? fullInvoiceData.invoice_date.split('T')[0] : '');
      setDueDate(fullInvoiceData.due_date ? fullInvoiceData.due_date.split('T')[0] : '');
      setSalesOrderNo(fullInvoiceData.sales_order_id || '');
      setCurrency(fullInvoiceData.currency || '$');
      setTerms(fullInvoiceData.terms || '');
      
      // Transform backend items to frontend format
      if (fullInvoiceData.items && fullInvoiceData.items.length > 0) {
        const transformedItems = fullInvoiceData.items.map(item => ({
          item_id: item.item_id || '',
          name: item.name || '',
          type: item.type || 'Product',
          quantity: item.quantity || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          discount_value: parseFloat(item.discount_value) || 0,
          discount_type: item.discount_type || 'percent',
          tax_rate: parseFloat(item.tax_rate) || 0
        }));
        setLineItems(transformedItems);
      } else {
        setLineItems([{ item_id: '', name: '', type: 'Product', quantity: 1, unit_price: 0, discount_value: 0, discount_type: 'percent', tax_rate: 0 }]);
      }
      
      setGlobalDiscount(parseFloat(fullInvoiceData.global_discount) || 0);
      setGlobalDiscountType(fullInvoiceData.global_discount_type || '%');
      setPaymentStatus(fullInvoiceData.status || 'Unpaid');
      setPayments(fullInvoiceData.payments || []);
      setEditIndex(idx);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      setError('Failed to load invoice details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerId('');
    setCustomerName('');
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setDueDate(new Date().toISOString().slice(0, 10));
    setSalesOrderNo('');
    setCurrency('$');
    setTerms('');
    setLineItems([{ item_id: '', name: '', type: 'Product', quantity: 1, unit_price: 0, discount_value: 0, discount_type: 'percent', tax_rate: 0 }]);
    setGlobalDiscount(0);
    setGlobalDiscountType('%');
    setPayments([]);
    setEditIndex(null);
  };

  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const openPayment = (invIdx) => {
    setSelectedInvoice(invIdx);
    setShowPayment(true);
    setPaymentAmount('');
    setPaymentMethod('Cash');
    setPaymentDate(new Date().toISOString().slice(0, 10));
  };

  const handlePayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    
    try {
      const invoice = invoices[selectedInvoice];
      const paymentAmountNum = Number(paymentAmount);
      
      // Update backend - let backend calculate the proper status
      await invoiceService.updatePaymentStatus(invoice.id, {
        paid_amount: paymentAmountNum,
        payment_date: paymentDate,
        payment_method: paymentMethod
      });
      
      // Refresh invoice list to get updated data
      await fetchInvoices();
      
      setShowPayment(false);
      setSelectedInvoice(null);
      setPaymentAmount('');
      setPaymentMethod('Cash');
      setPaymentDate(new Date().toISOString().slice(0, 10));
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Failed to process payment. Please try again.');
    }
  };

  const downloadPDF = async (invoice) => {
    try {
      // Get full invoice details with items if not already loaded
      let fullInvoice = invoice;
      if (!invoice.items || invoice.items.length === 0) {
        fullInvoice = await invoiceService.getInvoiceById(invoice.id);
      }
      
      // Create a simple PDF-like view for printing
      const printWindow = window.open('', '_blank');
      const customer = customers.find(c => c.id === fullInvoice.customer_id) || { name: fullInvoice.customer_name || 'Unknown Customer' };
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${fullInvoice.invoice_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: #f2f2f2; }
              .totals { margin-left: auto; width: 300px; }
              .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
              .final-total { font-weight: bold; border-top: 2px solid #333; padding-top: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>INVOICE</h1>
              <h2>${fullInvoice.invoice_number}</h2>
            </div>
            
            <div class="invoice-details">
              <div>
                <h3>Bill To:</h3>
                <p>${customer.name}</p>
              </div>
              <div>
                <p><strong>Invoice Date:</strong> ${new Date(fullInvoice.invoice_date).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(fullInvoice.due_date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${fullInvoice.status}</p>
              </div>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(fullInvoice.items || []).map(item => `
                  <tr>
                    <td>${item.name || 'Unknown Item'}</td>
                    <td>${item.quantity}</td>
                    <td>$${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                    <td>$${parseFloat(item.total_amount || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <div class="total-line">
                <span>Subtotal:</span>
                <span>$${parseFloat(fullInvoice.subtotal || 0).toFixed(2)}</span>
              </div>
              <div class="total-line">
                <span>Tax:</span>
                <span>$${parseFloat(fullInvoice.total_tax || 0).toFixed(2)}</span>
              </div>
              <div class="total-line final-total">
                <span>Total:</span>
                <span>$${parseFloat(fullInvoice.total_amount || 0).toFixed(2)}</span>
              </div>
              <div class="total-line">
                <span>Balance Due:</span>
                <span>$${parseFloat(fullInvoice.balance_due || fullInvoice.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };
  const sendEmail = () => alert('Send Email (not implemented)');

  const cancelInvoice = async (idx) => {
    try {
      const invoice = invoices[idx];
      await invoiceService.updatePaymentStatus(invoice.id, {
        payment_status: 'Cancelled',
        paid_amount: 0,
        payment_date: new Date().toISOString().split('T')[0]
      });
      
      // Update local state
      const updated = [...invoices];
      updated[idx].status = 'Cancelled';
      setInvoices(updated);
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      setError('Failed to cancel invoice. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-1 sm:px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-blue-100 p-2 sm:p-6 md:p-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight">
            Invoice Management
          </h2>
          <button 
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition-all duration-150"
            onClick={fetchInvoices}
            disabled={loading}
          >
            🔄 {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {!showForm && (
          <>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2 rounded-xl font-bold shadow transition-all duration-150 mb-6 w-full sm:w-auto"
            >
              + New Invoice
            </button>

            {loading ? (
              <div className="text-center py-12">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-blue-600">Loading invoices...</span>
                </div>
              </div>
            ) : invoices.length === 0 ? (
              <p className="text-blue-400 text-center mt-8">No invoices created yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-blue-100 shadow">
                <table className="w-full text-xs sm:text-sm min-w-[900px]">
                  <thead>
                    <tr className="bg-blue-50 text-blue-900">
                      <th className="p-2 sm:p-3 font-semibold">Invoice No.</th>
                      <th className="p-2 sm:p-3 font-semibold">Customer</th>
                      <th className="p-2 sm:p-3 font-semibold">Sales Order No.</th>
                      <th className="p-2 sm:p-3 font-semibold">Invoice Date</th>
                      <th className="p-2 sm:p-3 font-semibold">Due Date</th>
                      <th className="p-2 sm:p-3 font-semibold">Status</th>
                      <th className="p-2 sm:p-3 font-semibold">Total</th>
                      <th className="p-2 sm:p-3 font-semibold">Balance Due</th>
                      <th className="p-2 sm:p-3 font-semibold">Created By</th>
                      <th className="p-2 sm:p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, idx) => (
                      <tr key={inv.id} className="bg-white border-b hover:bg-blue-50 transition">
                        <td className="p-2 sm:p-3">{inv.invoice_number}</td>
                        <td className="p-2 sm:p-3">{inv.customer_name}</td>
                        <td className="p-2 sm:p-3">{inv.sales_order_id || '-'}</td>
                        <td className="p-2 sm:p-3">{inv.invoice_date}</td>
                        <td className="p-2 sm:p-3">{inv.due_date}</td>
                        <td className="p-2 sm:p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            inv.status === 'Paid' ? 'bg-green-100 text-green-700'
                            : inv.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700'
                            : inv.status === 'Cancelled' ? 'bg-gray-200 text-gray-500'
                            : 'bg-red-100 text-red-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 font-semibold text-blue-900">${parseFloat(inv.total_amount || 0).toFixed(2)}</td>
                        <td className="p-2 sm:p-3">${parseFloat(inv.balance_due || inv.total_amount || 0).toFixed(2)}</td>
                        <td className="p-2 sm:p-3">{inv.created_by || 'System'}</td>
                        <td className="p-2 sm:p-3 flex flex-wrap gap-1">
                          <button onClick={() => editInvoice(idx)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-semibold">Edit</button>
                          <button onClick={() => downloadPDF(inv)} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded text-xs font-semibold">PDF</button>
                          <button onClick={sendEmail} className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-semibold">Email</button>
                          {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                            <button onClick={() => openPayment(idx)} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">Payment</button>
                          )}
                          {inv.status !== 'Cancelled' && (
                            <button onClick={() => cancelInvoice(idx)} className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-semibold">Cancel</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {showForm && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-2 sm:p-4 md:p-6 shadow-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-3 sm:mb-4">{editIndex !== null ? 'Edit Invoice' : 'Create Invoice'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <label className="font-semibold text-blue-900">Customer</label>
                <select
                  value={customerId}
                  onChange={e => {
                    setCustomerId(e.target.value);
                    const selectedCustomer = customers.find(c => c.id === parseInt(e.target.value));
                    setCustomerName(selectedCustomer ? selectedCustomer.name : '');
                  }}
                  className="w-full mt-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 font-medium shadow-sm"
                >
                  <option value="">
                    {customers.length === 0 ? "Loading customers..." : "Select customer"}
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-blue-900">Sales Order No.</label>
                <input
                  type="text"
                  value={salesOrderNo}
                  onChange={e => setSalesOrderNo(e.target.value)}
                  className="w-full mt-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 font-medium placeholder-blue-400 shadow-sm"
                  placeholder="(optional)"
                />
              </div>
              <div>
                <label className="font-semibold text-blue-900">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  className="w-full mt-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 transition bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-blue-900">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full mt-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 transition bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-blue-900">Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full mt-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 transition bg-white"
                >
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="₹">INR (₹)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-blue-900">Terms & Conditions</label>
                <input
                  type="text"
                  value={terms}
                  onChange={e => setTerms(e.target.value)}
                  className="w-full mt-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 transition bg-white"
                  placeholder="(optional)"
                />
              </div>
            </div>

            <h4 className="font-semibold text-blue-900 mb-2 mt-3 sm:mt-4">Line Items</h4>
            {lineItems && lineItems.length > 0 ? lineItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-2 mb-2 bg-white/80 rounded-lg p-2 sm:items-center"
              >
                <select
                  value={item.type}
                  onChange={e => handleLineChange(idx, 'type', e.target.value)}
                  className="p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                >
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                </select>
                <select
                  value={item.item_id}
                  onChange={e => handleLineChange(idx, 'item_id', e.target.value)}
                  className="flex-1 p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                >
                  <option value="">
                    {products.length === 0 ? "Loading products..." : "Select product"}
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={e => handleLineChange(idx, 'quantity', e.target.value)}
                  className="w-16 p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Unit Price"
                  value={item.unit_price}
                  onChange={e => handleLineChange(idx, 'unit_price', e.target.value)}
                  className="w-24 p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Discount"
                  value={item.discount_value}
                  onChange={e => handleLineChange(idx, 'discount_value', e.target.value)}
                  className="w-16 p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                />
                <select
                  value={item.discount_type}
                  onChange={e => handleLineChange(idx, 'discount_type', e.target.value)}
                  className="p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                >
                  <option value="percent">%</option>
                  <option value="flat">Fixed</option>
                </select>
                <input
                  type="number"
                  min="0"
                  placeholder="Tax %"
                  value={item.tax_rate}
                  onChange={e => handleLineChange(idx, 'tax_rate', e.target.value)}
                  className="w-16 p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                />
                <span className="text-blue-900 font-semibold text-xs sm:text-sm px-2 whitespace-nowrap">
                  ${calcLineSubtotal(item).toFixed(2)}
                </span>
                {lineItems.length > 1 && (
                  <button
                    onClick={() => removeLineItem(idx)}
                    className="text-red-500 hover:text-red-700 font-bold px-2"
                    title="Remove"
                  >×</button>
                )}
              </div>
            )) : (
              <div className="text-gray-500 italic">No line items</div>
            )}
            <button
              onClick={addLineItem}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-4 py-2 rounded-lg shadow transition mb-3 sm:mb-4"
            >
              + Add Item
            </button>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4 items-end">
              <div>
                <label className="font-semibold text-blue-900">Global Discount</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    min="0"
                    value={globalDiscount}
                    onChange={e => setGlobalDiscount(Number(e.target.value))}
                    className="w-20 p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                  />
                  <select
                    value={globalDiscountType}
                    onChange={e => setGlobalDiscountType(e.target.value)}
                    className="p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                  >
                    <option value="%">%</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 text-right font-bold text-lg text-blue-900">
                Total: {calculateTotal().toFixed(2)} {currency}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={saveInvoice}
                className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 hover:from-blue-800 hover:to-blue-500 text-white w-full py-3 rounded-xl font-bold shadow-lg transition-all duration-150 text-base tracking-wide"
              >
                Save Invoice
              </button>
              <button
                onClick={() => { resetForm(); setShowForm(false); }}
                className="bg-white border border-blue-200 text-blue-700 font-bold w-full py-3 rounded-xl shadow transition hover:bg-blue-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showPayment && selectedInvoice !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-2">
            <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 sm:p-6 w-full max-w-xs sm:max-w-sm">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Payment Entry</h3>
              <div className="mb-3">
                <label className="font-semibold text-blue-900">Amount</label>
                <input
                  type="number"
                  min="1"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full mt-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 transition bg-white"
                  placeholder="Enter amount"
                />
              </div>
              <div className="mb-3">
                <label className="font-semibold text-blue-900">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full mt-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 transition bg-white"
                >
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Bank</option>
                  <option>Online</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="font-semibold text-blue-900">Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full mt-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 transition bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePayment}
                  className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 hover:from-blue-800 hover:to-blue-500 text-white w-full py-2 rounded-xl font-bold shadow-lg transition-all duration-150"
                >
                  Add Payment
                </button>
                <button
                  onClick={() => setShowPayment(false)}
                  className="bg-white border border-blue-200 text-blue-700 font-bold w-full py-2 rounded-xl shadow transition hover:bg-blue-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

