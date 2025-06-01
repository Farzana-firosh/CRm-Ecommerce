import React, { useState } from "react";
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

export default function DashBoard() {
  const { t, language } = useTranslation();

  const quotations = [
    { status: t("draft"), customer: "Ali Traders", date: "2025-05-29" },
    { status: t("approved"), customer: "Zara Corp", date: "2025-05-28" },
    { status: t("rejected"), customer: "Tech Solutions", date: "2025-05-27" },
    {
      status: t("negotiation"),
      customer: "Global Industries",
      date: "2025-05-26",
    },
    { status: t("approved"), customer: "Smart Tech", date: "2025-05-25" },
    { status: t("draft"), customer: "Future Innovations", date: "2025-05-24" },
  ];
  const salesOrders = [
    { month: t("jan"), count: 5 },
    { month: t("feb"), count: 8 },
    { month: t("mar"), count: 4 },
    { month: t("apr"), count: 7 },
    { month: t("may"), count: 6 },
  ];
  const invoices = [
    {
      status: t("paid"),
      amount: 5000,
      customer: "Ali Traders",
      date: "2025-05-29",
    },
    {
      status: t("unpaid"),
      amount: 150,
      customer: "Zara Corp",
      date: "2025-05-28",
    },
    {
      status: t("paid"),
      amount: 300,
      customer: "Tech Solutions",
      date: "2025-05-27",
    },
    {
      status: t("unpaid"),
      amount: 100,
      customer: "Global Industries",
      date: "2025-05-26",
    },
    {
      status: t("partially_paid"),
      amount: 250,
      customer: "Smart Tech",
      date: "2025-05-25",
    },
  ];
  const revenueData = [
    { month: t("jan"), amount: 1200 },
    { month: t("feb"), amount: 800 },
    { month: t("mar"), amount: 900 },
    { month: t("apr"), amount: 1400 },
    { month: t("may"), amount: 1000 },
  ];
  const [range, setRange] = useState("all");
  const filterByRange = (arr) => {
    if (range === "all") return arr;
    const now = new Date();
    let days = range === "7" ? 7 : 30;
    return arr.filter((item) => {
      const itemDate = new Date(item.date);
      return (now - itemDate) / (1000 * 60 * 60 * 24) <= days;
    });
  };
  const filteredQuotations = filterByRange(quotations);
  const filteredInvoices = filterByRange(invoices);

  const quotationsStats = [
    t("draft"),
    t("approved"),
    t("rejected"),
    t("negotiation"),
  ].map((status) => ({
    name: status,
    value: quotations.filter((q) => q.status === status).length,
  }));

  const invoicesStats = [t("paid"), t("unpaid"), t("partially_paid")].map(
    (status) => ({
      name: status,
      value: invoices
        .filter((inv) => inv.status === status)
        .reduce((sum, i) => sum + i.amount, 0),
    })
  );

  const COLORS = ["#10b981", "#6366f1", "#f59e42", "#ef4444", "#a855f7"];
  const totalQuotations = filteredQuotations.length;
  const totalSalesOrders = salesOrders.reduce((sum, s) => sum + s.count, 0);
  const totalInvoices = filteredInvoices.length;
  const OutStandingReceivables = invoices
    .filter((i) => i.status !== t("paid"))
    .reduce((sum, i) => sum + i.amount, 0);

  const recentActivity = [
    ...filteredQuotations.map((q) => ({
      type: t("quotation"),
      customer: q.customer,
      status: q.status,
      date: q.date,
    })),
    ...filteredInvoices.map((inv) => ({
      type: t("invoice"),
      customer: inv.customer,
      status: inv.status,
      date: inv.date,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const handleRangeChange = ($event) => {
    setRange($event.target.value);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-10 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-blue-900 drop-shadow-sm">
          {t("dashboard")}
        </h1>

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
              ${OutStandingReceivables}
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
              <BarChart data={revenueData}>
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

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            {t("recent_activity")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="p-3 font-semibold text-left">{t("type")}</th>
                  <th className="p-3 font-semibold text-left">
                    {t("customer")}
                  </th>
                  <th className="p-3 font-semibold text-left">{t("status")}</th>
                  <th className="p-3 font-semibold text-left">{t("date")}</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition">
                    <td className="p-3">{item.type}</td>
                    <td className="p-3">{item.customer}</td>
                    <td className="p-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-blue-900 border border-gray-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">{item.date}</td>
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-gray-400 py-8 bg-white rounded-xl"
                    >
                      {t("no_activity_found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
