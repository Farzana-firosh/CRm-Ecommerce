import React, { useState } from 'react';
import { useTranslation } from '../Components/Context/LanguageContext';

const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
const isAdmin = currentUser.role === 'Admin';

function Products() {
  const { t, language } = useTranslation();

  const [items, setItems] = useState([]);

  const [newItem, setNewItem] = useState({
    type: 'Product',
    name: '',
    description: '',
    unit: '',
    rate: '',
    tax: '',
    status: 'Active',
  });

  const [filter, setFilter] = useState({
    type: 'All',
    status: 'All',
  });

  const addItem = () => {
    if (!isAdmin) return;
    if (!newItem.name || !newItem.unit || !newItem.rate) {
      alert(t('fill name unit rate'));
      return;
    }
    setItems([
      ...items,
      {
        ...newItem,
        type: newItem.type === 'Service' ? 'Service' : 'Product',
        status: newItem.status === 'Inactive' ? 'Inactive' : 'Active',
      },
    ]);
    setNewItem({
      type: 'Product',
      name: '',
      description: '',
      unit: '',
      rate: '',
      tax: '',
      status: 'Active',
    });
  };

  const deactivateItem = (index) => {
    if (!isAdmin) return;
    const updatedItems = [...items];
    updatedItems[index].status = 'Inactive';
    setItems(updatedItems);
  };

  const filteredItems = items.filter((item) => {
    const typeMatch =
      filter.type === 'All' || item.type === filter.type;
    const statusMatch =
      filter.status === 'All' || item.status === filter.status;
    return typeMatch && statusMatch;
  });

  const rtl = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 sm:px-4 md:px-8" style={{ direction: rtl }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-8 text-center tracking-tight">
          {t('Item Master')}
        </h2>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">{t('Add New Item')}</h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-2">
            <select
              className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm w-full sm:w-auto"
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              disabled={!isAdmin}
            >
              <option value="Product">{t('product')}</option>
              <option value="Service">{t('service')}</option>
            </select>
            <input
              className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm w-full sm:w-auto"
              placeholder={t('Name')}
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              disabled={!isAdmin}
            />
            <input
              className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm w-full sm:w-auto"
              placeholder={t('Description')}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              disabled={!isAdmin}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-2">
            <input
              className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm w-full sm:w-auto"
              placeholder={t('Unit Placeholder')}
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              disabled={!isAdmin}
            />
            <input
              type="number"
              className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm w-full sm:w-auto"
              placeholder={t('rate')}
              value={newItem.rate}
              onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })}
              disabled={!isAdmin}
            />
            <input
              type="number"
              className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm w-full sm:w-auto"
              placeholder={t('Tax')}
              value={newItem.tax}
              onChange={(e) => setNewItem({ ...newItem, tax: e.target.value })}
              disabled={!isAdmin}
            />
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition w-full sm:w-auto"
              onClick={addItem}
              disabled={!isAdmin}
            >
              {t('Add item')}
            </button>
          </div>
          {!isAdmin && (
            <div className="text-xs text-red-500 mt-2">{t('Admin Only can add ')}</div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">{t('filters')}</h3>
          <div className="flex flex-col md:flex-row flex-wrap gap-3">
            <label className="flex items-center gap-2 font-medium text-blue-700 w-full md:w-1/2 lg:w-auto">
              {t('type')}:
              <select
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm w-full md:w-auto"
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              >
                <option value="All">{t('all')}</option>
                <option value="Product">{t('product')}</option>
                <option value="Service">{t('service')}</option>
              </select>
            </label>
            <label className="flex items-center gap-2 font-medium text-blue-700 w-full md:w-1/2 lg:w-auto">
              {t('status')}:
              <select
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm w-full md:w-auto"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="All">{t('all')}</option>
                <option value="Active">{t('active')}</option>
                <option value="Inactive">{t('inactive')}</option>
              </select>
            </label>
          </div>
        </div>

        <h3 className="text-lg font-bold text-blue-900 mb-4">{t('Items List')}</h3>
        <div className="overflow-x-auto rounded-xl border border-blue-100 shadow">
          <table className="w-full text-xs sm:text-sm min-w-[700px]">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="p-2 sm:p-3 font-semibold">{t('type')}</th>
                <th className="p-2 sm:p-3 font-semibold">{t('name')}</th>
                <th className="p-2 sm:p-3 font-semibold">{t('description')}</th>
                <th className="p-2 sm:p-3 font-semibold">{t('unit')}</th>
                <th className="p-2 sm:p-3 font-semibold">{t('rate')}</th>
                <th className="p-2 sm:p-3 font-semibold">{t('tax')}</th>
                <th className="p-2 sm:p-3 font-semibold">{t('status')}</th>
                <th className="p-2 sm:p-3 font-semibold">{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-blue-50 transition">
                    <td className="p-2 sm:p-3">{t(item.type.toLowerCase())}</td>
                    <td className="p-2 sm:p-3">{item.name}</td>
                    <td className="p-2 sm:p-3">{item.description}</td>
                    <td className="p-2 sm:p-3">{item.unit}</td>
                    <td className="p-2 sm:p-3">{item.rate}</td>
                    <td className="p-2 sm:p-3">{item.tax || 0}</td>
                    <td className="p-2 sm:p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {t(item.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3">
                      {item.status === 'Active' && isAdmin ? (
                        <button
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg font-semibold text-xs shadow transition"
                          onClick={() => deactivateItem(index)}
                        >
                          {t('deactivate')}
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-blue-400 py-8 bg-white rounded-xl">{t('No items found')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Products;
