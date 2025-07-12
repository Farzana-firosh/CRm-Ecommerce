import React, { useState, useEffect } from 'react';
import { useTranslation } from '../Components/Context/LanguageContext';
import { settingsService } from '../services/settingsService';
import { productService } from '../services/productService';

const tabLabels = {
  currency: "currency",
  users: "users",
  tax: "tax",
  org: "org"
};

const Settings = () => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState('currency');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = currentUser.role === 'Admin';

  // State for currencies
  const [currencies, setCurrencies] = useState([]);
  const [newCurrency, setNewCurrency] = useState({ code: '', symbol: '', status: 'Active' });

  // State for users
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Sales Executive', password: '' });

  // State for taxes
  const [taxes, setTaxes] = useState([]);
  const [newTax, setNewTax] = useState({ name: '', rate: '', status: 'Active' });

  // State for items (for checking tax usage)
  const [items, setItems] = useState([]);

  // State for organization info
  const [orgInfo, setOrgInfo] = useState({
    name: '',
    address: '',
    contact: '',
    currency: '',
    defaultTax: '',
  });
  const [orgId, setOrgId] = useState(null);

  // Fetch all data when component mounts
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [currenciesData, usersData, rolesData, taxesData, itemsData, orgData] = await Promise.all([
        settingsService.getAllCurrencies().catch(err => { console.warn('Failed to fetch currencies:', err); return []; }),
        settingsService.getAllUsers().catch(err => { console.warn('Failed to fetch users:', err); return []; }),
        settingsService.getAllRoles().catch(err => { console.warn('Failed to fetch roles:', err); return []; }),
        settingsService.getAllTaxes().catch(err => { console.warn('Failed to fetch taxes:', err); return []; }),
        productService.getAllItems().catch(err => { console.warn('Failed to fetch items:', err); return []; }),
        settingsService.getOrganizationInfo().catch(err => { console.warn('Failed to fetch org info:', err); return null; })
      ]);

      setCurrencies(currenciesData);
      setUsers(usersData);
      setRoles(rolesData);
      setTaxes(taxesData);
      setItems(itemsData);
      
      if (orgData) {
        setOrgInfo({
          name: orgData.name || '',
          address: orgData.address || '',
          contact: orgData.contact || '',
          currency: orgData.currency || '',
          defaultTax: orgData.default_tax || '',
        });
        setOrgId(orgData.id);
      }
      
    } catch (err) {
      setError('Failed to load settings data. Please try again.');
      console.error('Error fetching settings data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyAdd = async () => {
    if (!isAdmin) return;
    if (currencies.length >= 1) return;
    if (!newCurrency.code || !newCurrency.symbol) return;
    
    try {
      setLoading(true);
      const createdCurrency = await settingsService.createCurrency(newCurrency);
      setCurrencies([...currencies, createdCurrency]);
      setNewCurrency({ code: '', symbol: '', status: 'Active' });
    } catch (err) {
      setError('Failed to create currency. Please try again.');
      console.error('Error creating currency:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAdd = async () => {
    if (!isAdmin) return;
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('Name, email, and password are required');
      return;
    }
    
    try {
      setLoading(true);
      const createdUser = await settingsService.createUser(newUser);
      // Refresh users to get the latest data with roles
      const updatedUsers = await settingsService.getAllUsers();
      setUsers(updatedUsers);
      setNewUser({ name: '', email: '', role: 'Sales Executive', password: '' });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to create user. Please try again.');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaxAdd = async () => {
    if (!isAdmin) return;
    if (!newTax.name || !newTax.rate) return;
    
    try {
      setLoading(true);
      const createdTax = await settingsService.createTax(newTax);
      setTaxes([...taxes, createdTax]);
      setNewTax({ name: '', rate: '', status: 'Active' });
    } catch (err) {
      setError('Failed to create tax. Please try again.');
      console.error('Error creating tax:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = (e) => {
    if (!isAdmin) return;
    const { name, value } = e.target;
    setOrgInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleOrgSave = async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      const orgData = {
        name: orgInfo.name,
        address: orgInfo.address,
        contact: orgInfo.contact,
        currency: orgInfo.currency,
        default_tax: orgInfo.defaultTax,
      };

      if (orgId) {
        await settingsService.updateOrganizationInfo(orgId, orgData);
      } else {
        const createdOrg = await settingsService.createOrganizationInfo(orgData);
        setOrgId(createdOrg.id);
      }
      
      alert('Organization information saved successfully!');
    } catch (err) {
      setError('Failed to save organization info. Please try again.');
      console.error('Error saving organization info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (idx) => {
    if (!isAdmin) return;
    const user = users[idx];
    
    try {
      setLoading(true);
      await settingsService.deleteUser(user.id);
      setUsers(users.filter((_, i) => i !== idx));
    } catch (err) {
      setError('Failed to delete user. Please try again.');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCurrency = async (idx) => {
    if (!isAdmin) return;
    const currency = currencies[idx];
    
    try {
      setLoading(true);
      await settingsService.deleteCurrency(currency.id);
      setCurrencies(currencies.filter((_, i) => i !== idx));
    } catch (err) {
      setError('Failed to delete currency. Please try again.');
      console.error('Error deleting currency:', err);
    } finally {
      setLoading(false);
    }
  };

  const isTaxUsed = (taxName) => items.some(item => 
    item.tax_rate === taxName || 
    item.tax_name === taxName || 
    item.tax === taxName ||
    (item.tax_rate && typeof item.tax_rate === 'string' && item.tax_rate.includes(taxName))
  );

  const handleDeleteTax = async (idx) => {
    if (!isAdmin) return;
    const tax = taxes[idx];
    const taxName = tax.tax_name || tax.name;
    
    if (isTaxUsed(taxName)) {
      alert(t('cannot_delete_tax'));
      return;
    }
    
    try {
      setLoading(true);
      await settingsService.deleteTax(tax.id);
      setTaxes(taxes.filter((_, i) => i !== idx));
    } catch (err) {
      setError('Failed to delete tax. Please try again.');
      console.error('Error deleting tax:', err);
    } finally {
      setLoading(false);
    }
  };

  const rtl = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 sm:px-6" style={{ direction: rtl }}>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-8 text-center tracking-tight">{t('settings')}</h1>
        
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

        {/* Loading Display */}
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading...
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div></div>
          <button 
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition-all duration-150"
            onClick={fetchAllData}
            disabled={loading}
          >
            🔄 {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

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
                  <span className="font-semibold text-blue-900">{c.currency_code || c.code} <span className="text-blue-400">({c.symbol})</span></span>
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
              <input
                type="password"
                className="border border-blue-200 rounded-lg p-2 w-full bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                placeholder={t('password')}
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                disabled={!isAdmin}
              />
              <select
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                disabled={!isAdmin}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.role_name}>{role.role_name}</option>
                ))}
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
                <li key={u.id || i} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-semibold text-blue-900">{u.name}</span>
                  <span className="text-blue-500">{u.email}</span>
                  <span className="text-blue-400">{u.roles || 'No Role'}</span>
                  <span className="text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</span>
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
                  <span className="font-semibold text-blue-900">{tax.tax_name || tax.name}</span>
                  <span className="text-blue-500">{tax.rate}%</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${tax.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t(tax.status.toLowerCase())}</span>
                  {isAdmin && !isTaxUsed(tax.tax_name || tax.name) && (
                    <button
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                      onClick={() => handleDeleteTax(i)}
                      title={t('delete')}
                    >×</button>
                  )}
                  {isTaxUsed(tax.tax_name || tax.name) && (
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
              <select
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                name="currency"
                value={orgInfo.currency}
                onChange={handleOrgChange}
                disabled={!isAdmin}
              >
                <option value="">{t('select_currency')}</option>
                {currencies.map(c => (
                  <option key={c.id || c.currency_code || c.code} value={c.currency_code || c.code}>
                    {c.currency_code || c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <select
                className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                name="defaultTax"
                value={orgInfo.defaultTax}
                onChange={handleOrgChange}
                disabled={!isAdmin}
              >
                <option value="">{t('select_default_tax')}</option>
                {taxes.map(tax => (
                  <option key={tax.id || tax.tax_name || tax.name} value={tax.tax_name || tax.name}>
                    {tax.tax_name || tax.name} ({tax.rate}%)
                  </option>
                ))}
              </select>
            </div>
            
            {isAdmin && (
              <button
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition mb-4"
                onClick={handleOrgSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : t('save_organization_info')}
              </button>
            )}
            
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              <span className="font-semibold">{t('current_data')}:</span> {JSON.stringify(orgInfo)}
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

