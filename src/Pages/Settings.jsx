import React, { useState } from 'react';
import { useTranslation } from '../Components/Context/LanguageContext';

const tabLabels = {
  currency: "currency",
  users: "users",
  tax: "tax",
  org: "org"
};

const Settings = () => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState('currency');

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = currentUser.role === 'Admin';

  const [currencies, setCurrencies] = useState([
    { code: 'USD', symbol: '$', status: 'Active' }
  ]);
  const [newCurrency, setNewCurrency] = useState({ code: '', symbol: '', status: 'Active' });

  const [users, setUsers] = useState([
    { name: 'Farzana', email: 'Farzana@example.com', role: 'Admin', status: 'Active' }
  ]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Sales', status: 'Active' });

  const [taxes, setTaxes] = useState([
    { name: 'VAT', rate: 5, status: 'Active' }
  ]);
  const [newTax, setNewTax] = useState({ name: '', rate: '', status: 'Active' });

  const [items] = useState([
    { name: 'Product A', tax: 'VAT' }
  ]);

  const [orgInfo, setOrgInfo] = useState({
    name: 'MyOrg Inc.',
    address: '123 Main Street',
    contact: 'contact@myorg.com',
    currency: 'USD',
    defaultTax: 'VAT',
  });

  const handleCurrencyAdd = () => {
    if (!isAdmin) return;
    if (currencies.length >= 1) return;
    if (!newCurrency.code || !newCurrency.symbol) return;
    setCurrencies([...currencies, newCurrency]);
    setNewCurrency({ code: '', symbol: '', status: 'Active' });
  };

  const handleUserAdd = () => {
    if (!isAdmin) return;
    if (!newUser.name || !newUser.email) return;
    setUsers([...users, newUser]);
    setNewUser({ name: '', email: '', role: 'Sales', status: 'Active' });
  };

  const handleTaxAdd = () => {
    if (!isAdmin) return;
    if (!newTax.name || !newTax.rate) return;
    setTaxes([...taxes, newTax]);
    setNewTax({ name: '', rate: '', status: 'Active' });
  };

  const handleOrgChange = (e) => {
    if (!isAdmin) return;
    const { name, value } = e.target;
    setOrgInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteUser = (idx) => {
    if (!isAdmin) return;
    setUsers(users.filter((_, i) => i !== idx));
  };

  const handleDeleteCurrency = (idx) => {
    if (!isAdmin) return;
    setCurrencies(currencies.filter((_, i) => i !== idx));
  };

  const isTaxUsed = (taxName) => items.some(item => item.tax === taxName);

  const handleDeleteTax = (idx) => {
    if (!isAdmin) return;
    const taxName = taxes[idx].name;
    if (isTaxUsed(taxName)) {
      alert(t('cannot_delete_tax'));
      return;
    }
    setTaxes(taxes.filter((_, i) => i !== idx));
  };

  const rtl = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 sm:px-6" style={{ direction: rtl }}>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-8 text-center tracking-tight">{t('settings')}</h1>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
          {Object.keys(tabLabels).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-150 shadow-sm
                ${activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
            >
              {t(tabLabels[tab])}
            </button>
          ))}
        </div>

        {activeTab === 'currency' && (
          <div>
            <h2 className="text-xl font-bold text-blue-900 mb-4">{t('Currency Settings')}</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                className="border border-blue-200 rounded-lg p-2 w-full bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                placeholder={t('code')}
                value={newCurrency.code}
                onChange={e => setNewCurrency({ ...newCurrency, code: e.target.value })}
                disabled={!isAdmin || currencies.length >= 1}
              />
              <input
                className="border border-blue-200 rounded-lg p-2 w-full bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                placeholder={t('symbol')}
                value={newCurrency.symbol}
                onChange={e => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                disabled={!isAdmin || currencies.length >= 1}
              />
              <select
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                value={newCurrency.status}
                onChange={e => setNewCurrency({ ...newCurrency, status: e.target.value })}
                disabled={!isAdmin || currencies.length >= 1}
              >
                <option>{t('active')}</option>
                <option>{t('inactive')}</option>
              </select>
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
                onClick={handleCurrencyAdd}
                disabled={!isAdmin || currencies.length >= 1}
              >
                {t('add')}
              </button>
            </div>
            {currencies.length >= 1 && (
              <div className="text-xs text-red-500 mb-2">{t('Only one currency')}</div>
            )}
            <ul className="divide-y divide-blue-50 rounded-lg bg-blue-50 p-3">
              {currencies.map((c, i) => (
                <li key={i} className="py-2 flex justify-between items-center">
                  <span className="font-semibold text-blue-900">{c.code} <span className="text-blue-400">({c.symbol})</span></span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t(c.status.toLowerCase())}</span>
                    {isAdmin && currencies.length > 0 && (
                      <button
                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                        onClick={() => handleDeleteCurrency(i)}
                        title={t('delete')}
                        disabled={currencies.length <= 1}
                      >×</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold text-blue-900 mb-4">{t('User Management')}</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                className="border border-blue-200 rounded-lg p-2 w-full bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                placeholder={t('name')}
                value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                disabled={!isAdmin}
              />
              <input
                className="border border-blue-200 rounded-lg p-2 w-full bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                placeholder={t('email')}
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                disabled={!isAdmin}
              />
              <select
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                disabled={!isAdmin}
              >
                <option>{t('admin')}</option>
                <option>{t('sales')}</option>
                <option>{t('finance')}</option>
              </select>
              <select
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                value={newUser.status}
                onChange={e => setNewUser({ ...newUser, status: e.target.value })}
                disabled={!isAdmin}
              >
                <option>{t('Active')}</option>
                <option>{t('inactive')}</option>
              </select>
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
                onClick={handleUserAdd}
                disabled={!isAdmin}
              >
                {t('add')}
              </button>
            </div>
            <ul className="divide-y divide-blue-50 rounded-lg bg-blue-50 p-3">
              {users.map((u, i) => (
                <li key={i} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-semibold text-blue-900">{u.name}</span>
                  <span className="text-blue-500">{u.email}</span>
                  <span className="text-blue-400">{t(u.role.toLowerCase())}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t(u.status.toLowerCase())}</span>
                  {isAdmin && (
                    <button
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                      onClick={() => handleDeleteUser(i)}
                      title={t('delete')}
                    >×</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'tax' && (
          <div>
            <h2 className="text-xl font-bold text-blue-900 mb-4">{t('Tax Settings')}</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                className="border border-blue-200 rounded-lg p-2 w-full bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                placeholder={t('Tax name')}
                value={newTax.name}
                onChange={e => setNewTax({ ...newTax, name: e.target.value })}
                disabled={!isAdmin}
              />
              <input
                type="number"
                className="border border-blue-200 rounded-lg p-2 w-full bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                placeholder={t('rate')}
                value={newTax.rate}
                onChange={e => setNewTax({ ...newTax, rate: e.target.value })}
                disabled={!isAdmin}
              />
              <select
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                value={newTax.status}
                onChange={e => setNewTax({ ...newTax, status: e.target.value })}
                disabled={!isAdmin}
              >
                <option>{t('active')}</option>
                <option>{t('inactive')}</option>
              </select>
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
                onClick={handleTaxAdd}
                disabled={!isAdmin}
              >
                {t('add')}
              </button>
            </div>
            <ul className="divide-y divide-blue-50 rounded-lg bg-blue-50 p-3">
              {taxes.map((tax, i) => (
                <li key={i} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-semibold text-blue-900">{tax.name}</span>
                  <span className="text-blue-500">{tax.rate}%</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${tax.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t(tax.status.toLowerCase())}</span>
                  {isAdmin && !isTaxUsed(tax.name) && (
                    <button
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                      onClick={() => handleDeleteTax(i)}
                      title={t('delete')}
                    >×</button>
                  )}
                  {isTaxUsed(tax.name) && (
                    <span className="text-xs text-gray-400 ml-2">{t('in_use')}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'org' && (
          <div>
            <h2 className="text-xl font-bold text-blue-900 mb-4">{t('Organization Info')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                name="name"
                placeholder={t('name')}
                value={orgInfo.name}
                onChange={handleOrgChange}
                disabled={!isAdmin}
              />
              <input
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                name="address"
                placeholder={t('address')}
                value={orgInfo.address}
                onChange={handleOrgChange}
                disabled={!isAdmin}
              />
              <input
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                name="contact"
                placeholder={t('contact')}
                value={orgInfo.contact}
                onChange={handleOrgChange}
                disabled={!isAdmin}
              />
              <input
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                name="currency"
                placeholder={t('currency')}
                value={orgInfo.currency}
                onChange={handleOrgChange}
                disabled={!isAdmin}
              />
              <input
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                name="defaultTax"
                placeholder={t('default_tax')}
                value={orgInfo.defaultTax}
                onChange={handleOrgChange}
                disabled={!isAdmin}
              />
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              <span className="font-semibold">{t('saved_data')}:</span> {JSON.stringify(orgInfo)}
            </div>
            {!isAdmin && (
              <div className="text-xs text-red-500 mt-2">{t('Only Admin allowed to edit')}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

