import React, { useState, useEffect } from 'react';
import { useTranslation } from '../Components/Context/LanguageContext';
import { reportsService } from '../services/reportsService';

export default function SalesReport() {
  const { t, language } = useTranslation();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch sales data from backend when component mounts
  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const salesData = await reportsService.getSalesReportData();
      setSales(salesData);
    } catch (err) {
      setError('Failed to fetch sales data. Please try again.');
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && saleDate < start) return false;
    if (end && saleDate > end) return false;
    if (statusFilter !== 'All' && sale.status !== statusFilter) return false;

    return true;
  });

  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  const rtl = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 sm:px-6" style={{ direction: rtl }}>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 sm:p-8">
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

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight">
            {t('Sales Report')}
          </h2>
          <button 
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition-all duration-150"
            onClick={fetchSalesData}
            disabled={loading}
          >
            🔄 {loading ? 'Refreshing...' : t('refresh')}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center">
          <label className="flex flex-col font-semibold text-blue-900 text-sm w-full sm:w-1/3">
            {t('Start date')}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm mt-1"
            />
          </label>
          <label className="flex flex-col font-semibold text-blue-900 text-sm w-full sm:w-1/3">
            {t('End date')}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm mt-1"
            />
          </label>
          <label className="flex flex-col font-semibold text-blue-900 text-sm w-full sm:w-1/3">
            {t('Status')}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm mt-1"
            >
              <option value="All">{t('all')}</option>
              <option value="Paid">{t('paid')}</option>
              <option value="Unpaid">{t('unpaid')}</option>
              <option value="Partially Paid">{t('partially_paid')}</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto rounded-xl bg-blue-50 shadow mb-8">
          <table className="w-full text-xs sm:text-sm min-w-[600px]">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="p-3 font-semibold text-center">{t('date')}</th>
                <th className="p-3 font-semibold text-center">{t('customer')}</th>
                <th className="p-3 font-semibold text-right">{t('total Amount')}</th>
                <th className="p-3 font-semibold text-center">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 bg-white rounded-xl">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-blue-600">Loading sales data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-blue-400 py-8 bg-white rounded-xl">
                    {t('no_sales_found')}
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale, idx) => (
                  <tr
                    key={sale.id}
                    className={`${
                      idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'
                    } hover:bg-blue-100 transition`}
                  >
                    <td className="p-3 text-center rounded-l-xl">{sale.date}</td>
                    <td className="p-3 text-center">{sale.customer}</td>
                    <td className="p-3 font-semibold text-blue-900 text-right">${sale.total.toFixed(2)}</td>
                    <td className="p-3 text-center rounded-r-xl">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        sale.status === 'Paid' ? 'bg-green-100 text-green-700'
                        : sale.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {t(sale.status.toLowerCase().replace(' ', '_'))}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <h3 className="text-lg font-bold text-blue-900">
            {t('Total Sales')}: <span className="text-green-600">${totalAmount.toFixed(2)}</span>
          </h3>
        </div>
      </div>
    </div>
  );
}

