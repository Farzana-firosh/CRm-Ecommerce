import React, { useState } from 'react';
import { useTranslation } from '../Components/Context/LanguageContext';

const customers = [
  { id: 1, name: 'Tech Solutions Inc.' },
  { id: 2, name: 'Global Services Ltd.' },
  { id: 3, name: 'Innovative Systems' },
  { id: 4, name: 'Digital Solutions' },
  { id: 5, name: 'Modern Tech Co.' }
];

const itemsList = [
  { id: 1, name: 'Product A', price: 100, taxRate: 10 },
  { id: 2, name: 'Product B', price: 200, taxRate: 15 },
  { id: 3, name: 'Service C', price: 150, taxRate: 5 }
];

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

  const [quotations, setQuotations] = useState([
    {
      id: 'Q-2025-001',
      reference: 'Q-2025-001',
      customer: 1,
      date: '2025-05-01',
      amount: 4500,
      status: 'Draft',
      version: 1,
      items: [],
    },
    {
      id: 'Q-2025-002',
      reference: 'Q-2025-002',
      customer: 2,
      date: '2025-04-29',
      amount: 8750,
      status: 'Submitted',
      version: 1,
      items: [],
    },
    {
      id: 'Q-2025-003',
      reference: 'Q-2025-003',
      customer: 3,
      date: '2025-04-28',
      amount: 6200,
      status: 'Approved',
      version: 1,
      items: [],
    },
    {
      id: 'Q-2025-004',
      reference: 'Q-2025-004',
      customer: 4,
      date: '2025-04-27',
      amount: 3800,
      status: 'Rejected',
      version: 1,
      items: [],
    },
    {
      id: 'Q-2025-005',
      reference: 'Q-2025-005',
      customer: 5,
      date: '2025-04-26',
      amount: 12450,
      status: 'Submitted',
      version: 1,
      items: [],
    }
  ]);
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

  let filtered = quotations.filter(q => {
    let match = true;
    if (filterCustomer && parseInt(q.customer) !== parseInt(filterCustomer)) match = false;
    if (filterStatus && q.status !== filterStatus) match = false;
    if (filterDateFrom && q.date < filterDateFrom) match = false;
    if (filterDateTo && q.date > filterDateTo) match = false;
    if (search && !q.id.toLowerCase().includes(search.toLowerCase()) && !customers.find(c => c.id === q.customer)?.name.toLowerCase().includes(search.toLowerCase())) match = false;
    return match;
  });
  const pageCount = Math.ceil(filtered.length / pageSize);
  filtered = filtered.slice((page - 1) * pageSize, page * pageSize);

  const updateQuotationStatus = (id, newStatus) => {
    setQuotations(prev =>
      prev.map(q =>
        q.id === id ? { ...q, status: newStatus } : q
      )
    );
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

  const convertToSalesOrder = (quotation) => {
    alert(t('sales_order_created_for') + ` ${quotation.id}`);
    updateQuotationStatus(quotation.id, 'Converted');
  };

  const handleAddItem = () => {
    if (!currentItem.itemId) return;
    setNewQuotation({
      ...newQuotation,
      items: [...newQuotation.items, currentItem]
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

  const handleCreateQuotation = () => {
    const refNumber = `Q-2025-${String(quotations.length + 1).padStart(3, '0')}`;
    const newEntry = {
      ...newQuotation,
      id: refNumber,
      reference: refNumber,
      amount: newQuotation.items.reduce(
        (sum, item) => sum + parseFloat(calculateItemTotal(item)), 0),
      status: 'Draft',
      version: 1,
    };
    setQuotations([newEntry, ...quotations]);
    setShowForm(false);
    setNewQuotation({
      customer: '',
      date: '',
      dueDate: '',
      reference: '',
      items: [],
    });
    setDiscountType('none');
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-6 px-1 sm:px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 md:mb-0 text-blue-900 drop-shadow-sm">{t('quotation_management')}</h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 sm:px-5 py-2 rounded-xl font-semibold shadow-lg transition-all duration-150"
              onClick={() => setShowForm(true)}
            >
              + {t('create_quotation')}
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
                      <td className="p-2 sm:p-4 rounded-l-xl font-semibold text-blue-900">{q.id}</td>
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
                            onClick={() => alert(`${t('viewing')} ${q.id}`)}
                          >👁️</button>
                          <button
                            title={t('edit')}
                            className="border border-gray-200 bg-gradient-to-br from-white to-blue-50 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-900 rounded-xl p-2 shadow transition-all duration-150"
                            onClick={() => alert(`${t('editing')} ${q.id}`)}
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
                              const copy = { ...q, id: `${q.reference}-COPY`, status: 'Draft', version: 1 };
                              setQuotations([copy, ...quotations]);
                            }}
                          >📋</button>
                          <button
                            title={t('delete')}
                            className="border border-red-200 bg-gradient-to-br from-red-50 to-white hover:from-red-100 hover:to-red-200 text-red-700 hover:text-red-900 rounded-xl p-2 shadow transition-all duration-150"
                            onClick={() => setQuotations(quotations.filter(qq => qq.id !== q.id))}
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-12 bg-white rounded-xl">{t('no_quotations_found')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
              onClick={() => setShowForm(false)}
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
              <label className="block font-bold mb-3 text-blue-900">{t('items')}</label>
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
                            <option key={i.id} value={i.id}>{i.name}</option>
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
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 sm:px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-150 w-full"
              onClick={handleCreateQuotation}
            >
              {t('Save Quotation')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}