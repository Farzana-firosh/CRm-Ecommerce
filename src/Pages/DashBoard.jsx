import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "../Components/Context/LanguageContext";
import { dashboardService } from "../services/dashboardService";

export default function DashBoard() {
  const { t, language } = useTranslation();

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    quotations: [],
    salesOrders: [],
    invoices: [],
    revenueTrend: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("all");

  // Fetch dashboard data when component mounts
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardSummary();
      
      console.log('🔍 Raw dashboard data from backend:', data);
      console.log('🔍 Revenue trend data:', data.revenueTrend);
      console.log('🔍 Quotations data:', data.quotations);
      console.log('🔍 Sales Orders data:', data.salesOrders);
      console.log('🔍 Invoices data:', data.invoices);
      
      // Transform backend data to frontend format
      setDashboardData({
        quotations: data.quotations || [],
        salesOrders: data.salesOrders || [],
        invoices: data.invoices || [],
        revenueTrend: data.revenueTrend || [],
        recentActivity: data.recentActivity || []
      });
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };
  // Process data for charts and stats
  const processedData = React.useMemo(() => {
    if (loading || !dashboardData) return { 
      quotationsStats: [], 
      invoicesStats: [], 
      totalQuotations: 0, 
      totalSalesOrders: 0, 
      totalInvoices: 0, 
      outstandingReceivables: 0,
      revenueTrendForChart: [],
      recentActivityForTable: []
    };

    // Process quotations stats
    const quotationsStats = dashboardData.quotations.length > 0 
      ? dashboardData.quotations.map(item => ({
          name: item.status,
          value: parseInt(item.count) || 0,
        }))
      : [{ name: 'No Data', value: 0 }];

    // Process sales orders stats  
    const salesOrdersStats = dashboardData.salesOrders.length > 0
      ? dashboardData.salesOrders.map(item => ({
          name: item.status,
          value: parseInt(item.count) || 0,
        }))
      : [{ name: 'No Data', value: 0 }];

    // Process invoices stats
    const invoicesStats = dashboardData.invoices.length > 0
      ? dashboardData.invoices.map(item => ({
          name: item.status,
          value: parseInt(item.count) || 0,
        }))
      : [{ name: 'No Data', value: 0 }];

    // Calculate totals
    const totalQuotations = quotationsStats.reduce((sum, item) => sum + item.value, 0);
    const totalSalesOrders = salesOrdersStats.reduce((sum, item) => sum + item.value, 0);
    const totalInvoices = invoicesStats.reduce((sum, item) => sum + item.value, 0);
    
    // Calculate outstanding receivables (unpaid + partially paid invoices)
    const unpaidCount = invoicesStats.find(item => item.name === 'Unpaid')?.value || 0;
    const partiallyPaidCount = invoicesStats.find(item => item.name === 'Partially Paid')?.value || 0;
    const outstandingReceivables = unpaidCount + partiallyPaidCount;

    // Process revenue trend for chart
    const revenueTrendForChart = dashboardData.revenueTrend.length > 0
      ? dashboardData.revenueTrend.map(item => {
          console.log('🔍 Processing revenue item:', item);
          return {
            month: item.month,
            amount: parseFloat(item.revenue) || 0,
          };
        })
      : [{ month: 'No Data', amount: 0 }];

    console.log('🔍 Processed revenue trend for chart:', revenueTrendForChart);

    // Process recent activity for table
    const recentActivityForTable = dashboardData.recentActivity.length > 0
      ? dashboardData.recentActivity.map(item => ({
          id: item.reference || 'N/A',
          type: item.type || 'Unknown',
          reference: item.reference || 'N/A',
          customer: item.customer_name || `Customer ${item.customer_id || 'Unknown'}`,
          status: item.status || 'Unknown',
          amount: parseFloat(item.total_amount) || 0,
          date: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
          rawDate: item.created_at
        }))
      : [];

    console.log('🔍 Processed recent activity for table:', recentActivityForTable);

    return {
      quotationsStats,
      salesOrdersStats,
      invoicesStats,
      totalQuotations,
      totalSalesOrders,
      totalInvoices,
      outstandingReceivables,
      revenueTrendForChart,
      recentActivityForTable
    };
  }, [dashboardData, loading]);

  const { quotationsStats, salesOrdersStats, invoicesStats, totalQuotations, totalSalesOrders, totalInvoices, outstandingReceivables, revenueTrendForChart, recentActivityForTable } = processedData;

  const COLORS = ["#10b981", "#6366f1", "#f59e42", "#ef4444", "#a855f7"];

  // Helper function to get status color for recent activity
  const getStatusColor = (status) => {
    if (!status || typeof status !== 'string') {
      return 'bg-gray-100 text-gray-700';
    }
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'converted': return 'bg-purple-100 text-purple-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'unpaid': return 'bg-red-100 text-red-700';
      case 'partially paid': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper function to get type color for recent activity
  const getTypeColor = (type) => {
    if (!type || typeof type !== 'string') {
      return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
    switch (type.toLowerCase()) {
      case 'quotation': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'sales order': return 'bg-green-50 text-green-700 border border-green-200';
      case 'invoice': return 'bg-purple-50 text-purple-700 border border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const handleRangeChange = ($event) => {
    setRange($event.target.value);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-10 px-2 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-blue-600">Loading dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-10 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
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
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 drop-shadow-sm">
            {t("dashboard")}
          </h1>
          <button 
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition-all duration-150"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            🔄 {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="mb-8 flex flex-wrap gap-4 items-center">
          <label className="text-base font-semibold text-blue-900">
            {t("time_range")}:
          </label>
          <select
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-200 transition shadow-sm"
            value={range}
            onChange={handleRangeChange}
          >
            <option value="all">{t("all")}</option>
            <option value="7">{t("last_7_days")}</option>
            <option value="30">{t("last_30_days")}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
            <h2 className="text-gray-500 font-semibold mb-2">
              {t("total_quotations")}
            </h2>
            <p className="text-4xl font-extrabold text-blue-700">
              {totalQuotations}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
            <h2 className="text-gray-500 font-semibold mb-2">
              {t("total_sales_orders")}
            </h2>
            <p className="text-4xl font-extrabold text-blue-700">
              {totalSalesOrders}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
            <h2 className="text-gray-500 font-semibold mb-2">
              {t("total_invoices")}
            </h2>
            <p className="text-4xl font-extrabold text-blue-700">
              {totalInvoices}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
            <h2 className="text-gray-500 font-semibold mb-2">
              {t("outstanding_receivables")}
            </h2>
            <p className="text-4xl font-extrabold text-rose-600">
              {outstandingReceivables}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-10">
          <h3 className="text-lg font-bold text-blue-900 mb-6">
            {t("quotations_by_status")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {quotationsStats.map((q, idx) => (
              <div key={q.name} className="flex flex-col items-center">
                <span
                  className="w-3 h-3 rounded-full mb-2"
                  style={{ background: COLORS[idx % COLORS.length] }}
                ></span>
                <p className="text-sm text-gray-500">{q.name}</p>
                <p className="text-2xl font-bold text-blue-800">{q.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-blue-900 mb-6">
              {t("monthly_revenue")}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueTrendForChart}>
                <XAxis
                  dataKey="month"
                  tick={{ fontWeight: 600, fill: "#64748b" }}
                />
                <YAxis tick={{ fontWeight: 600, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-blue-900 mb-6">
              {t("invoice_status_distribution")}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={invoicesStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {invoicesStats.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-10">
          <h3 className="text-lg font-bold text-blue-900 mb-6">
            {t("quotations_by_status_pie")}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={quotationsStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {quotationsStats.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-10">
          <h3 className="text-lg font-bold text-blue-900 mb-6">
            Recent Activity
          </h3>
          {recentActivityForTable.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-gray-50 text-blue-900">
                    <th className="p-3 font-bold text-left rounded-tl-lg">Type</th>
                    <th className="p-3 font-bold text-left">Reference</th>
                    <th className="p-3 font-bold text-left">Customer</th>
                    <th className="p-3 font-bold text-left">Status</th>
                    <th className="p-3 font-bold text-left">Amount</th>
                    <th className="p-3 font-bold text-left rounded-tr-lg">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivityForTable.map((activity, index) => (
                    <tr key={`activity-${activity.type}-${activity.reference}-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(activity.type)}`}>
                          {activity.type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-blue-900">{activity.reference}</td>
                      <td className="p-3 text-gray-700">{activity.customer}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-green-600">${activity.amount.toLocaleString()}</td>
                      <td className="p-3 text-gray-500">{activity.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>No recent activity found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
