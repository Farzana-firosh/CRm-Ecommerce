import React, { useState } from 'react';

const PAYMENT_STATUS = ['Unpaid', 'Partially Paid', 'Paid'];

export default function SimpleInvoice() {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [salesOrderNo, setSalesOrderNo] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [terms, setTerms] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [globalDiscountType, setGlobalDiscountType] = useState('%');
  const [lineItems, setLineItems] = useState([
    { name: '', type: 'Product', quantity: 1, unit: '', price: 0, discount: 0, discountType: '%', tax: 0 }
  ]);
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');
  const [payments, setPayments] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const addLineItem = () => {
    setLineItems([...lineItems, { name: '', type: 'Product', quantity: 1, unit: '', price: 0, discount: 0, discountType: '%', tax: 0 }]);
  };

  const handleLineChange = (index, field, value) => {
    const newLineItems = [...lineItems];
    if (['quantity', 'price', 'discount', 'tax'].includes(field)) {
      value = Number(value);
      if (value < 0) value = 0;
    }
    newLineItems[index][field] = value;
    setLineItems(newLineItems);
  };

  // Remove a line item
  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calcLineSubtotal = (item) => {
    let base = item.quantity * item.price;
    let discount = item.discountType === '%' ? (base * item.discount) / 100 : item.discount;
    let afterDiscount = base - discount;
    let tax = (afterDiscount * item.tax) / 100;
    return afterDiscount + tax;
  };

  const calcSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + calcLineSubtotal(item), 0);
  };

  const calcGlobalDiscount = (subtotal) => {
    if (globalDiscountType === '%') {
      return (subtotal * globalDiscount) / 100;
    }
    return globalDiscount;
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

  const saveInvoice = () => {
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (lineItems.length === 0 || !lineItems[0].name) {
      alert('Please enter at least one line item');
      return;
    }
    const total = calculateTotal();
    const balanceDue = calculateBalanceDue(total, payments);
    const newInvoice = {
      id: Date.now(),
      invoiceNo: `INV-${invoices.length + 1}`.padStart(8, '0'),
      customerName,
      invoiceDate,
      dueDate,
      salesOrderNo,
      currency,
      terms,
      lineItems,
      globalDiscount,
      globalDiscountType,
      total,
      payments,
      balanceDue,
      paymentStatus: balanceDue === 0 ? 'Paid' : payments.length > 0 ? 'Partially Paid' : 'Unpaid',
      createdBy: 'Current User',
    };
    if (editIndex !== null) {
      const updated = [...invoices];
      updated[editIndex] = newInvoice;
      setInvoices(updated);
      setEditIndex(null);
    } else {
      setInvoices([...invoices, newInvoice]);
    }
    resetForm();
    setShowForm(false);
  };

  const editInvoice = (idx) => {
    const inv = invoices[idx];
    setCustomerName(inv.customerName);
    setInvoiceDate(inv.invoiceDate);
    setDueDate(inv.dueDate);
    setSalesOrderNo(inv.salesOrderNo);
    setCurrency(inv.currency);
    setTerms(inv.terms);
    setLineItems(inv.lineItems);
    setGlobalDiscount(inv.globalDiscount);
    setGlobalDiscountType(inv.globalDiscountType);
    setPayments(inv.payments || []);
    setEditIndex(idx);
    setShowForm(true);
  };

  const resetForm = () => {
    setCustomerName('');
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setDueDate(new Date().toISOString().slice(0, 10));
    setSalesOrderNo('');
    setCurrency('USD');
    setTerms('');
    setLineItems([{ name: '', type: 'Product', quantity: 1, unit: '', price: 0, discount: 0, discountType: '%', tax: 0 }]);
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

  const handlePayment = () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    const updated = [...invoices];
    const inv = { ...updated[selectedInvoice] };
    inv.payments = [...(inv.payments || []), { amount: Number(paymentAmount), method: paymentMethod, date: paymentDate }];
    inv.balanceDue = calculateBalanceDue(inv.total, inv.payments);
    if (inv.balanceDue === 0) inv.paymentStatus = 'Paid';
    else if (inv.payments.length > 0) inv.paymentStatus = 'Partially Paid';
    else inv.paymentStatus = 'Unpaid';
    updated[selectedInvoice] = inv;
    setInvoices(updated);
    setShowPayment(false);
    setSelectedInvoice(null);
  };

  const downloadPDF = () => alert('Download PDF (not implemented)');
  const sendEmail = () => alert('Send Email (not implemented)');

  const cancelInvoice = (idx) => {
    const updated = [...invoices];
    updated[idx].paymentStatus = 'Cancelled';
    setInvoices(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-1 sm:px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-blue-100 p-2 sm:p-6 md:p-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-6 sm:mb-8 text-center tracking-tight">
          Invoice Management
        </h2>

        {!showForm && (
          <>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2 rounded-xl font-bold shadow transition-all duration-150 mb-6 w-full sm:w-auto"
            >
              + New Invoice
            </button>

            {invoices.length === 0 ? (
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
                        <td className="p-2 sm:p-3">{inv.invoiceNo}</td>
                        <td className="p-2 sm:p-3">{inv.customerName}</td>
                        <td className="p-2 sm:p-3">{inv.salesOrderNo}</td>
                        <td className="p-2 sm:p-3">{inv.invoiceDate}</td>
                        <td className="p-2 sm:p-3">{inv.dueDate}</td>
                        <td className="p-2 sm:p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            inv.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700'
                            : inv.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700'
                            : inv.paymentStatus === 'Cancelled' ? 'bg-gray-200 text-gray-500'
                            : 'bg-red-100 text-red-700'
                          }`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 font-semibold text-blue-900">{inv.total.toFixed(2)} {inv.currency}</td>
                        <td className="p-2 sm:p-3">{inv.balanceDue.toFixed(2)}</td>
                        <td className="p-2 sm:p-3">{inv.createdBy}</td>
                        <td className="p-2 sm:p-3 flex flex-wrap gap-1">
                          <button onClick={() => editInvoice(idx)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-semibold">Edit</button>
                          <button onClick={downloadPDF} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded text-xs font-semibold">PDF</button>
                          <button onClick={sendEmail} className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-semibold">Email</button>
                          {inv.paymentStatus !== 'Paid' && inv.paymentStatus !== 'Cancelled' && (
                            <button onClick={() => openPayment(idx)} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">Payment</button>
                          )}
                          {inv.paymentStatus !== 'Cancelled' && (
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
                <label className="font-semibold text-blue-900">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full mt-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 font-medium placeholder-blue-400 shadow-sm"
                  placeholder="Enter customer name"
                />
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
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
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
            {lineItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-2 mb-2 items-end bg-white/80 rounded-lg p-2 sm:p-0 sm:items-end items-stretch"
              >
                <select
                  value={item.type}
                  onChange={e => handleLineChange(idx, 'type', e.target.value)}
                  className="p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                >
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                </select>
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={e => handleLineChange(idx, 'name', e.target.value)}
                  className="flex-1 p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={item.unit}
                  onChange={e => handleLineChange(idx, 'unit', e.target.value)}
                  className="w-20 p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                />
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
                  placeholder="Unit Price"
                  value={item.price}
                  onChange={e => handleLineChange(idx, 'price', e.target.value)}
                  className="w-24 p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Discount"
                  value={item.discount}
                  onChange={e => handleLineChange(idx, 'discount', e.target.value)}
                  className="w-16 p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                />
                <select
                  value={item.discountType}
                  onChange={e => handleLineChange(idx, 'discountType', e.target.value)}
                  className="p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                >
                  <option value="%">%</option>
                  <option value="fixed">Fixed</option>
                </select>
                <input
                  type="number"
                  min="0"
                  placeholder="Tax %"
                  value={item.tax}
                  onChange={e => handleLineChange(idx, 'tax', e.target.value)}
                  className="w-16 p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                />
                <span className="text-blue-900 font-semibold text-xs sm:text-sm px-2 whitespace-nowrap text-right sm:text-left w-full sm:w-auto">
                  Subtotal: {calcLineSubtotal(item).toFixed(2)}
                </span>
                {lineItems.length > 1 && (
                  <button
                    onClick={() => removeLineItem(idx)}
                    className="text-red-500 hover:text-red-700 font-bold px-2"
                    title="Remove"
                  >×</button>
                )}
              </div>
            ))}
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

