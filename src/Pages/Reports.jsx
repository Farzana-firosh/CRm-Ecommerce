import React, { useState } from 'react';
import { useTranslation } from '../Components/Context/LanguageContext';

const sampleSales = [
  { id: 1, date: '2025-05-01', customer: 'Global Industries', total: 250, status: 'Paid' },
  { id: 2, date: '2025-05-05', customer: 'Smart Tech', total: 150, status: 'Unpaid' },
  { id: 3, date: '2025-05-10', customer: 'Ali Traders', total: 300, status: 'Partially Paid' },
  { id: 4, date: '2025-05-12', customer: 'Zara Corp', total: 450, status: 'Paid' },
  { id: 5, date: '2025-05-15', customer: 'Blue Ocean LLC', total: 200, status: 'Paid' },
  { id: 6, date: '2025-05-18', customer: 'NextGen Solutions', total: 350, status: 'Unpaid' },
  { id: 7, date: '2025-05-20', customer: 'Sunrise Enterprises', total: 180, status: 'Partially Paid' },
  { id: 8, date: '2025-05-22', customer: 'Green Fields', total: 275, status: 'Paid' },
];

export default function SalesReport() {
  const { t, language } = useTranslation();
  const [sales] = useState(sampleSales);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-8 text-center tracking-tight">
          {t('Sales Report')}
        </h2>

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
              {filteredSales.length === 0 ? (
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

