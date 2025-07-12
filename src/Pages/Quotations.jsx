import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../Components/Context/LanguageContext';
import { quotationService } from '../services/quotationService';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import { salesOrderService } from '../services/salesOrderService';

function getStatusColor(status) {
  switch (status) {
    case 'Draft': return 'bg-gray-100 text-gray-700 border border-gray-300';
    case 'Submitted': return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'Approved': return 'bg-green-100 text-green-700 border border-green-200';
    case 'Rejected': return 'bg-red-100 text-red-700 border border-red-200';
    case 'Negotiated': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    case 'Converted': return 'bg-purple-100 text-purple-700 border border-purple-200';
    default: return '';
  }
}

export default function Quotations() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [newQuotation, setNewQuotation] = useState({
    customer: '',
    date: '',
    dueDate: '',
    reference: '',
    items: [],
  });
  const [currentItem, setCurrentItem] = useState({
    itemId: '',
    description: '',
    quantity: 1,
    price: 0,
  });
  const [discountType, setDiscountType] = useState('none');
  
  // Use ref to track the latest items to avoid stale state issues
  const itemsRef = useRef([]);

  // Fetch quotations, items, and customers from backend when component mounts
  useEffect(() => {
    fetchQuotations();
    fetchItems();
    fetchCustomers();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await productService.getAllItems();
      // Transform backend data to match frontend format
      const transformedItems = data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.default_rate,
        taxRate: item.tax_rate,
        type: item.item_type,
        unit: item.unit_of_measure,
        description: item.description
      }));
      setItemsList(transformedItems);
    } catch (err) {
      console.error('Error fetching items:', err);
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

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await quotationService.getAllQuotations();
      
      console.log('Raw quotation data from backend:', data);
      
      // Transform backend data to match frontend format
      const transformedData = data.map((item, index) => {
        console.log('Processing quotation item:', item);
        
        // Ensure we always have a valid ID
        const quotationId = item.id || item.quotation_id; // Backend returns 'id' as the database ID
        const referenceNo = item.reference_no || item.quotation_id || `Q-${Date.now()}-${index}`;
        
        if (!quotationId) {
          console.warn('Warning: Quotation has no valid ID:', item);
          console.warn('Available properties:', Object.keys(item));
        }
        
        const transformedItem = {
          id: quotationId, // Use 'id' (database ID) as the main ID
          reference: referenceNo, // Use reference_no for display
          customer: parseInt(item.created_by) || 1,
          date: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          amount: parseFloat(item.total_amount) || 0,
          status: item.quotation_status || item.status || 'Draft', // Use quotation_status first
          version: parseInt(item.version_number) || 1,
          items: [],
          validTill: item.validity_date || item.valid_till,
          remarks: item.remarks || ''
        };
        
        console.log('Transformed item:', transformedItem);
        return transformedItem;
      });
      
      console.log('Transformed quotation data:', transformedData);
      setQuotations(transformedData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch quotations. Please try again.');
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  let filtered = quotations.filter(q => {
    let match = true;
    if (filterCustomer && parseInt(q.customer) !== parseInt(filterCustomer)) match = false;
    if (filterStatus && q.status !== filterStatus) match = false;
    if (filterDateFrom && q.date < filterDateFrom) match = false;
    if (filterDateTo && q.date > filterDateTo) match = false;
    if (search && !q.reference.toLowerCase().includes(search.toLowerCase()) && !customers.find(c => c.id === q.customer)?.name.toLowerCase().includes(search.toLowerCase())) match = false;
    return match;
  });
  const pageCount = Math.ceil(filtered.length / pageSize);
  filtered = filtered.slice((page - 1) * pageSize, page * pageSize);

  const updateQuotationStatus = async (id, newStatus) => {
    try {
      // Validate that ID is not undefined or null
      if (!id && id !== 0) {
        throw new Error('Invalid quotation ID: ID is undefined or null');
      }
      
      console.log('Updating quotation status:', { id, newStatus });
      
      // Find the quotation to get both id and reference
      const quotation = quotations.find(q => q.id === id);
      if (!quotation) {
        throw new Error(`Quotation not found in local state with ID: ${id}`);
      }
      
      console.log('Found quotation for update:', quotation);
      
      // Use the database ID for the update
      await quotationService.updateQuotationStatus(id, newStatus);
      
      console.log('Quotation status updated successfully, refreshing data...');
      
      // Always refresh data from backend after status update to ensure consistency
      await fetchQuotations();
      
    } catch (error) {
      console.error('Error updating quotation status:', error);
      alert(`Failed to update quotation status: ${error.message}`);
      
      // Refresh data from backend on error to ensure UI is in sync
      await fetchQuotations();
    }
  };

  const createNewVersion = (quotation) => {
    const group = quotations.filter(q => q.reference === quotation.reference);
    if (group.some(q => q.status === 'Submitted' || q.status === 'Approved')) {
      alert(t('only_one_version_submitted'));
      return;
    }
    const newVersion = {
      ...quotation,
      id: `${quotation.reference}-v${(quotation.version || 1) + 1}`,
      status: 'Draft',
      version: (quotation.version || 1) + 1,
    };
    setQuotations([...quotations, newVersion]);
  };

  const convertToSalesOrder = async (quotation) => {
    try {
      console.log('Converting quotation to sales order:', quotation);
      
      // Get the first available item from the items list for the default item
      const defaultItem = itemsList.length > 0 ? itemsList[0] : null;
      
      // Since quotations don't store items in our current system,
      // create a default item with the quotation's total amount and all required fields
      const quotationItems = [{
        item_id: defaultItem ? defaultItem.id : 1, // Use first available item or default to 1
        quantity: 1,
        unit_price: quotation.amount || 0,
        line_discount_type: 'none', // Required field
        line_discount_value: 0, // Required field
        tax_rate: 0, // Required field - no tax by default
        description: `Items from quotation ${quotation.reference}`
      }];
      
      // Create sales order data from quotation with all required fields
      const salesOrderData = {
        customer_id: quotation.customer,
        sales_order_date: new Date().toISOString().split('T')[0],
        reference_no: `SO-${quotation.reference}`, // Generate SO reference from quotation reference
        currency: '$',
        notes: `Converted from quotation ${quotation.reference}`,
        overall_discount_type: 'none',
        overall_discount_value: 0,
        items: quotationItems // Include properly formatted items array
      };
      
      console.log('Sales order data being sent:', salesOrderData);
      console.log('Items array with required fields:', quotationItems);
      
      // Create the sales order
      const createdSalesOrder = await salesOrderService.createSalesOrder(salesOrderData);
      console.log('Created sales order response:', createdSalesOrder);
      
      // Update quotation status to 'Converted' - using database ID for backend operation
      await updateQuotationStatus(quotation.id, 'Converted');
      
      // Show success message
      alert(`Sales order SO-${quotation.reference} created successfully from quotation ${quotation.reference}. You can view it in the Sales Orders page.`);
      
      // Refresh quotations to show updated status
      await fetchQuotations();
      
    } catch (error) {
      console.error('Error converting to sales order:', error);
      alert(`Failed to convert quotation to sales order: ${error.message}`);
    }
  };

  const handleDeleteQuotation = async (quotationId) => {
    if (window.confirm(t('confirm_delete_quotation'))) {
      try {
        await quotationService.deleteQuotation(quotationId);
        setQuotations(prev => prev.filter(q => q.id !== quotationId));
      } catch (error) {
        alert('Failed to delete quotation. Please try again.');
        console.error('Error deleting quotation:', error);
      }
    }
  };

  const handleAddItem = () => {
    if (!currentItem.itemId) {
      alert('Please select an item first');
      return;
    }
    
    const newItem = { ...currentItem };
    setNewQuotation(prevQuotation => {
      const updatedItems = [...prevQuotation.items, newItem];
      const updatedQuotation = {
        ...prevQuotation,
        items: updatedItems
      };
      // Update the ref with the latest items
      itemsRef.current = updatedItems;
      return updatedQuotation;
    });
    
    setCurrentItem({
      itemId: '',
      description: '',
      quantity: 1,
      price: 0,
    });
  };

  const calculateItemTotal = (item) => {
    return (item.quantity * item.price).toFixed(2);
  };

  const validateQuotationData = useCallback((quotationData, itemsToValidate) => {
    if (!quotationData.customer) {
      alert('Please select a customer');
      return false;
    }
    if (!quotationData.date) {
      alert('Please select a date');
      return false;
    }
    if (itemsToValidate.length === 0) {
      alert('Please add at least one item');
      return false;
    }
    return true;
  }, []);

  const handleCreateQuotation = async () => {
    try {
      setLoading(true);
      
      // Use the items from ref which should have the latest data
      const currentItems = itemsRef.current.length > 0 ? itemsRef.current : newQuotation.items;
      
      // Create a quotation object with the most current items
      const quotationWithCurrentItems = {
        ...newQuotation,
        items: currentItems
      };
      
      // Use the current state with updated items
      if (!validateQuotationData(quotationWithCurrentItems, currentItems)) {
        return;
      }
      
      const refNumber = `Q-2025-${String(quotations.length + 1).padStart(3, '0')}`;
      
      // Prepare data for backend using current items
      const quotationData = {
        quotation_id: refNumber,
        version_number: 1,
        status: 'Draft',
        created_by: parseInt(newQuotation.customer),
        total_amount: currentItems.reduce(
          (sum, item) => sum + parseFloat(calculateItemTotal(item)), 0),
        valid_till: newQuotation.dueDate || null,
        remarks: newQuotation.reference || ''
      };

      console.log('Sending quotation data:', quotationData);
      const createdQuotation = await quotationService.createQuotation(quotationData);
      console.log('Created quotation response:', createdQuotation);
      
      // Instead of manually adding to state, refresh the data from backend
      // This ensures we get the correct data structure with proper IDs
      await fetchQuotations();

      setShowForm(false);
      setNewQuotation({
        customer: '',
        date: '',
        dueDate: '',
        reference: '',
        items: [],
      });
      // Reset the ref
      itemsRef.current = [];
      setDiscountType('none');
    } catch (error) {
      console.error('Full error details:', error);
      alert(`Failed to create quotation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-6 px-1 sm:px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full">
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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 md:mb-0 text-blue-900 drop-shadow-sm">{t('quotation_management')}</h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 sm:px-5 py-2 rounded-xl font-semibold shadow-lg transition-all duration-150"
              onClick={() => {
                itemsRef.current = [];
                setShowForm(true);
              }}
            >
              + {t('create_quotation')}
            </button>
            <button 
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 sm:px-5 py-2 rounded-xl font-semibold shadow-lg transition-all duration-150"
              onClick={fetchQuotations}
              disabled={loading}
            >
              🔄 {loading ? 'Refreshing...' : t('refresh')}
            </button>
            <button className="border border-gray-200 px-3 sm:px-4 py-2 rounded-xl text-gray-700 bg-white hover:bg-gray-100 font-medium shadow transition-all duration-150">{t('filter')}</button>
            <button className="border border-gray-200 px-3 sm:px-4 py-2 rounded-xl text-gray-700 bg-white hover:bg-gray-100 font-medium shadow transition-all duration-150">{t('export')}</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 sm:p-4 md:p-8 mb-10 w-full">
          <div className="mb-6">
            <span className="block text-lg sm:text-xl font-bold text-blue-900 mb-4">{t('filters')}</span>
            <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6 flex-wrap">
              <div className="flex flex-col w-full md:w-1/5 min-w-[180px]">
                <label className="text-xs text-gray-500 mb-1 font-semibold">{t('customer')}</label>
                <select
                  className="border border-gray-200 rounded-lg px-3 sm:px-4 py-2 bg-white focus:ring-2 focus:ring-blue-200 transition"
                  value={filterCustomer}
                  onChange={e => { setFilterCustomer(e.target.value); setPage(1); }}
                >
                  <option value="">{t('all_customers')}</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col w-full md:w-1/5 min-w-[180px]">
                <label className="text-xs text-gray-500 mb-1 font-semibold">{t('status')}</label>
                <select
                  className="border border-gray-200 rounded-lg px-3 sm:px-4 py-2 bg-white focus:ring-2 focus:ring-blue-200 transition"
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                >
                  <option value="">{t('all_statuses')}</option>
                  <option value="Draft">{t('draft')}</option>
                  <option value="Submitted">{t('submitted')}</option>
                  <option value="Approved">{t('approved')}</option>
                  <option value="Rejected">{t('rejected')}</option>
                </select>
              </div>
              <div className="flex flex-col w-full md:w-1/5 min-w-[180px]">
                <label className="text-xs text-gray-500 mb-1 font-semibold">{t('date_from')}</label>
                <input
                  type="date"
                  className="border border-gray-200 rounded-lg px-3 sm:px-4 py-2 bg-white focus:ring-2 focus:ring-blue-200 transition"
                  value={filterDateFrom}
                  onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }}
                  placeholder={t('date_from')}
                />
              </div>
              <div className="flex flex-col w-full md:w-1/5 min-w-[180px]">
                <label className="text-xs text-gray-500 mb-1 font-semibold">{t('date_to')}</label>
                <input
                  type="date"
                  className="border border-gray-200 rounded-lg px-3 sm:px-4 py-2 bg-white focus:ring-2 focus:ring-blue-200 transition"
                  value={filterDateTo}
                  onChange={e => { setFilterDateTo(e.target.value); setPage(1); }}
                  placeholder={t('date_to')}
                />
              </div>
              <div className="flex flex-col w-full md:w-1/5 min-w-[180px]">
                <label className="text-xs text-gray-500 mb-1 font-semibold">{t('search')}</label>
                <input
                  type="text"
                  className="border border-gray-200 rounded-lg px-3 sm:px-4 py-2 bg-white focus:ring-2 focus:ring-blue-200 transition"
                  placeholder={t('search_quotations')}
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          </div>

          <div>
            <span className="block text-lg sm:text-xl font-bold text-blue-900 mb-4">{t('quotations')}</span>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-blue-600">Loading quotations...</span>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow">
              <table className="w-full text-xs sm:text-sm border-separate border-spacing-y-2 min-w-[600px]">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-gray-50 text-blue-900">
                    <th className="p-2 sm:p-4 font-bold text-left rounded-tl-xl">{t('quotation_number')}</th>
                    <th className="p-2 sm:p-4 font-bold text-left">{t('customer')}</th>
                    <th className="p-2 sm:p-4 font-bold text-left">{t('date')}</th>
                    <th className="p-2 sm:p-4 font-bold text-left">{t('amount')}</th>
                    <th className="p-2 sm:p-4 font-bold text-left">{t('status')}</th>
                    <th className="p-2 sm:p-4 font-bold text-left rounded-tr-xl">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(q => (
                    <tr key={q.id} className="bg-white border border-gray-100 rounded-xl shadow hover:shadow-lg transition">
                      <td className="p-2 sm:p-4 rounded-l-xl font-semibold text-blue-900">{q.reference}</td>
                      <td className="p-2 sm:p-4">{customers.find(c => c.id === q.customer)?.name || ''}</td>
                      <td className="p-2 sm:p-4">{q.date && new Date(q.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="p-2 sm:p-4 font-semibold text-blue-800">${q.amount?.toLocaleString()}</td>
                      <td className="p-2 sm:p-4">
                        <span className={`px-3 sm:px-4 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(q.status)}`}>
                          {t(q.status.toLowerCase())}
                        </span>
                      </td>
                      <td className="p-2 sm:p-4 rounded-r-xl">
                        <div className="flex flex-wrap gap-2">
                          <button
                            title={t('view')}
                            className="border border-gray-200 bg-gradient-to-br from-white to-blue-50 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-900 rounded-xl p-2 shadow transition-all duration-150"
                            onClick={() => alert(`${t('viewing')} ${q.reference}`)}
                          >👁️</button>
                          <button
                            title={t('edit')}
                            className="border border-gray-200 bg-gradient-to-br from-white to-blue-50 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-900 rounded-xl p-2 shadow transition-all duration-150"
                            onClick={() => alert(`${t('editing')} ${q.reference}`)}
                          >✏️</button>
                          {q.status === 'Draft' && (
                            <button
                              title={t('send')}
                              className="border border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-900 rounded-xl p-2 shadow transition-all duration-150"
                              onClick={() => updateQuotationStatus(q.id, 'Submitted')}
                            >📤</button>
                          )}
                          {q.status === 'Submitted' && (
                            <>
                              <button
                                title={t('approve')}
                                className="border border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 hover:text-green-900 rounded-xl p-2 shadow transition-all duration-150"
                                onClick={() => updateQuotationStatus(q.id, 'Approved')}
                              >✅</button>
                              <button
                                title={t('reject')}
                                className="border border-red-300 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 hover:text-red-900 rounded-xl p-2 shadow transition-all duration-150"
                                onClick={() => updateQuotationStatus(q.id, 'Rejected')}
                              >❌</button>
                            </>
                          )}
                          {q.status === 'Approved' && (
                            <button
                              title={t('convert_to_so')}
                              className="border border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 hover:text-purple-900 rounded-xl p-2 shadow transition-all duration-150"
                              onClick={() => convertToSalesOrder(q)}
                            >🔄</button>
                          )}
                          <button
                            title={t('copy')}
                            className="border border-gray-200 bg-gradient-to-br from-white to-blue-50 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-900 rounded-xl p-2 shadow transition-all duration-150"
                            onClick={() => {
                              const copyId = Date.now(); // Use timestamp as unique ID
                              const copy = { 
                                ...q, 
                                id: copyId, 
                                reference: `${q.reference}-COPY-${copyId}`, 
                                status: 'Draft', 
                                version: 1 
                              };
                              setQuotations([copy, ...quotations]);
                            }}
                          >📋</button>
                          <button
                            title={t('delete')}
                            className="border border-red-200 bg-gradient-to-br from-red-50 to-white hover:from-red-100 hover:to-red-200 text-red-700 hover:text-red-900 rounded-xl p-2 shadow transition-all duration-150"
                            onClick={() => handleDeleteQuotation(q.id)}
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-12 bg-white rounded-xl">{t('no_quotations_found')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-2 sm:gap-3 mt-8">
            <button
              className="px-3 sm:px-4 py-2 border border-gray-200 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 disabled:opacity-50 shadow transition"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >&lt;</button>
            <span className="text-sm sm:text-base font-semibold text-blue-900">{t('page')} {page} {t('of')} {pageCount}</span>
            <button
              className="px-3 sm:px-4 py-2 border border-gray-200 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 disabled:opacity-50 shadow transition"
              disabled={page >= pageCount}
              onClick={() => setPage(page + 1)}
            >&gt;</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/10 px-2">
          <div className="bg-white w-full max-w-lg sm:max-w-xl rounded-2xl shadow-2xl p-2 sm:p-6 md:p-10 relative pointer-events-auto border border-gray-100">
            <button
              onClick={() => {
                setShowForm(false);
                setNewQuotation({
                  customer: '',
                  date: '',
                  dueDate: '',
                  reference: '',
                  items: [],
                });
                itemsRef.current = [];
                setCurrentItem({
                  itemId: '',
                  description: '',
                  quantity: 1,
                  price: 0,
                });
              }}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 text-2xl hover:text-red-500 transition"
            >
              ✖
            </button>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-6 sm:mb-8 text-blue-900">{t('create_quotation')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label className="block text-sm mb-2 font-semibold text-blue-900">{t('customer')}</label>
                <select
                  className="border border-gray-200 rounded-lg p-2 sm:p-3 w-full bg-white focus:ring-2 focus:ring-blue-200 transition"
                  value={newQuotation.customer}
                  onChange={e => setNewQuotation({ ...newQuotation, customer: e.target.value })}
                >
                  <option value="">{t('select_customer')}</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 font-semibold text-blue-900">{t('date')}</label>
                <input
                  type="date"
                  className="border border-gray-200 rounded-lg p-2 sm:p-3 w-full bg-white focus:ring-2 focus:ring-blue-200 transition"
                  value={newQuotation.date}
                  onChange={e => setNewQuotation({ ...newQuotation, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 font-semibold text-blue-900">{t('due_date')}</label>
                <input
                  type="date"
                  className="border border-gray-200 rounded-lg p-2 sm:p-3 w-full bg-white focus:ring-2 focus:ring-blue-200 transition"
                  value={newQuotation.dueDate}
                  onChange={e => setNewQuotation({ ...newQuotation, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 font-semibold text-blue-900">{t('reference')}</label>
                <input
                  type="text"
                  className="border border-gray-200 rounded-lg p-2 sm:p-3 w-full bg-white focus:ring-2 focus:ring-blue-200 transition"
                  placeholder={t('optional_reference')}
                  value={newQuotation.reference}
                  onChange={e => setNewQuotation({ ...newQuotation, reference: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-bold mb-3 text-blue-900">
                {t('items')} 
                <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {newQuotation.items.length} items | Ref: {itemsRef.current.length}
                </span>
              </label>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm mb-3 rounded-xl overflow-hidden min-w-[500px]">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="p-2 sm:p-3 font-semibold">{t('item')}</th>
                      <th className="p-2 sm:p-3 font-semibold">{t('description')}</th>
                      <th className="p-2 sm:p-3 font-semibold">{t('qty')}</th>
                      <th className="p-2 sm:p-3 font-semibold">{t('price')}</th>
                      <th className="p-2 sm:p-3 font-semibold">{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 sm:p-3">
                        <select
                          className="border border-gray-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-200 transition"
                          value={currentItem.itemId}
                          onChange={e => {
                            const item = itemsList.find(i => i.id === parseInt(e.target.value));
                            setCurrentItem({
                              ...currentItem,
                              itemId: e.target.value,
                              price: item ? item.price : 0,
                            });
                          }}
                        >
                          <option value="">{t('select_item')}</option>
                          {itemsList.map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.type})</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 sm:p-3">
                        <input
                          className="border border-gray-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-200 transition"
                          placeholder={t('description')}
                          value={currentItem.description}
                          onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <input
                          type="number"
                          min="1"
                          className="border border-gray-200 rounded-lg p-2 w-12 sm:w-16 bg-white focus:ring-2 focus:ring-blue-200 transition"
                          value={currentItem.quantity}
                          onChange={e => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <input
                          type="number"
                          min="0"
                          className="border border-gray-200 rounded-lg p-2 w-14 sm:w-20 bg-white focus:ring-2 focus:ring-blue-200 transition"
                          value={currentItem.price}
                          onChange={e => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })}
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        ${calculateItemTotal(currentItem)}
                      </td>
                    </tr>
                    {newQuotation.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 sm:p-3">{itemsList.find(i => i.id === parseInt(item.itemId))?.name || ''}</td>
                        <td className="p-2 sm:p-3">{item.description}</td>
                        <td className="p-2 sm:p-3">{item.quantity}</td>
                        <td className="p-2 sm:p-3">${item.price}</td>
                        <td className="p-2 sm:p-3">${calculateItemTotal(item)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                className="text-blue-700 text-sm font-semibold hover:underline hover:text-blue-900 transition"
                type="button"
                onClick={handleAddItem}
              >
                + {t('add_item')}
              </button>
            </div>

            {/* Discount Type */}
            <div className="mb-8">
              <label className="block font-bold mb-2 text-blue-900">{t('discount_type')}</label>
              <select
                className="border border-gray-200 rounded-lg p-2 sm:p-3 bg-white focus:ring-2 focus:ring-blue-200 transition w-full"
                value={discountType}
                onChange={e => setDiscountType(e.target.value)}
              >
                <option value="none">{t('no_discount')}</option>
                <option value="percent">{t('percentage')}</option>
                <option value="flat">{t('flat')}</option>
              </select>
            </div>

            <button
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 sm:px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-150 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreateQuotation}
              disabled={loading}
            >
              {loading ? 'Creating...' : t('Save Quotation')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}