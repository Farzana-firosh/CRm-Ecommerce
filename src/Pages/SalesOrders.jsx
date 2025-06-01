import React, { useState } from "react";
import { useTranslation } from "../Components/Context/LanguageContext"; 

const customers = [
  { id: 1, name: "Sunrise Retail Ltd" },
  { id: 2, name: "GlobalTech Solutions" },
  { id: 3, name: " Urban Build Co" },
];

const products = [
  { id: 1, name: "Printer Paper", price: 800 },
  { id: 2, name: "Coffee Beans", price: 500 },
  { id: 3, name: "LED Bulbs", price: 950 },
];

export default function SalesOrders() {
  const { t } = useTranslation(); 
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer: "",
    date: new Date().toISOString().split("T")[0],
    reference: "",
    currency: "USD",
    notes: "",
    items: [],
    overallDiscount: { type: "none", value: 0 },
    status: "Draft",
  });

  const [currentItem, setCurrentItem] = useState({
    productId: "",
    quantity: 1,
    price: 0,
    discountType: "none",
    discountValue: 0,
    tax: 10,
  });

  const addItem = () => {
    if (!currentItem.productId) return;
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, currentItem],
    });
    setCurrentItem({
      productId: "",
      quantity: 1,
      price: 0,
      discountType: "none",
      discountValue: 0,
      tax: 10,
    });
  };

  const calculateLineTotal = (item) => {
    const lineTotal = item.quantity * item.price;
    const discount =
      item.discountType === "percent"
        ? (lineTotal * item.discountValue) / 100
        : item.discountValue;
    const taxable = lineTotal - discount;
    const tax = (taxable * item.tax) / 100;
    return taxable + tax;
  };

  const calculateTotals = () => {
    const subtotal = newOrder.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const lineDiscounts = newOrder.items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.price;
      return (
        sum +
        (item.discountType === "percent"
          ? (lineTotal * item.discountValue) / 100
          : item.discountValue)
      );
    }, 0);
    const taxable = subtotal - lineDiscounts;
    const tax = newOrder.items.reduce(
      (sum, item) =>
        sum +
        ((item.quantity * item.price -
          (item.discountType === "percent"
            ? (item.quantity * item.price * item.discountValue) / 100
            : item.discountValue)) *
          item.tax) /
          100,
      0
    );
    const overallDiscount =
      newOrder.overallDiscount.type === "percent"
        ? (taxable * newOrder.overallDiscount.value) / 100
        : newOrder.overallDiscount.value;

    const grandTotal = taxable - overallDiscount + tax;

    return {
      subtotal,
      lineDiscounts,
      tax,
      overallDiscount,
      grandTotal,
    };
  };

  const saveOrder = () => {
    const orderNumber = `SO-${Math.floor(Math.random() * 10000)}`;
    const totals = calculateTotals();
    setOrders([
      ...orders,
      {
        ...newOrder,
        id: orderNumber,
        ...totals,
      },
    ]);
    setNewOrder({
      customer: "",
      date: new Date().toISOString().split("T")[0],
      reference: "",
      currency: "USD",
      notes: "",
      items: [],
      overallDiscount: { type: "none", value: 0 },
      status: "Draft",
    });
    setShowForm(false);
  };

  const confirmOrder = (id) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "Confirmed" } : o))
    );
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight">
            {t("Sales Order Management")}
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 sm:px-6 py-2 rounded-xl font-bold shadow transition-all duration-150 text-base w-full sm:w-auto"
          >
            + {t("Create Sales Order")}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-2 sm:p-4 md:p-6 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[600px]">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="p-2 sm:p-3 font-semibold text-left rounded-tl-2xl">
                  {t("so no")}
                </th>
                <th className="p-2 sm:p-3 font-semibold text-left">
                  {t("customer")}
                </th>
                <th className="p-2 sm:p-3 font-semibold text-left">
                  {t("date")}
                </th>
                <th className="p-2 sm:p-3 font-semibold text-left">
                  {t("status")}
                </th>
                <th className="p-2 sm:p-3 font-semibold text-left">
                  {t("total")}
                </th>
                <th className="p-2 sm:p-3 font-semibold text-left rounded-tr-2xl">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-blue-400 py-8">
                    {t("No sales orders")}
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-blue-50 transition">
                  <td className="p-2 sm:p-3 font-mono break-all">{o.id}</td>
                  <td className="p-2 sm:p-3">
                    {customers.find((c) => c.id === parseInt(o.customer))
                      ?.name || ""}
                  </td>
                  <td className="p-2 sm:p-3">{o.date}</td>
                  <td className="p-2 sm:p-3">
                    <span
                      className={
                        o.status === "Confirmed"
                          ? "inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
                          : "inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold"
                      }
                    >
                      {t(o.status.toLowerCase())}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 font-semibold text-blue-900">
                    ${o.grandTotal.toFixed(2)}
                  </td>
                  <td className="p-2 sm:p-3 space-x-2">
                    {o.status === "Draft" && (
                      <button
                        className="inline-flex items-center px-3 py-1 rounded-lg bg-green-50 text-green-700 font-semibold text-xs hover:bg-green-100 transition"
                        onClick={() => confirmOrder(o.id)}
                      >
                        {t("confirm")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 px-2">
            <div className="bg-white w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl border border-blue-100 relative flex flex-col">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-blue-400 text-3xl hover:text-purple-600 transition font-bold"
                aria-label={t("close")}
              >
                ✖
              </button>
              <div className="px-3 sm:px-8 pt-10 pb-4">
                <h2 className="text-xl sm:text-2xl font-extrabold mb-8 text-blue-900 text-center tracking-tight">
                  {t("New Sales Order")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-blue-900 mb-1 block">
                      {t("customer")}
                    </label>
                    <select
                      className="border border-blue-200 rounded-lg p-2 w-full bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                      value={newOrder.customer}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, customer: e.target.value })
                      }
                    >
                      <option value="">{t("select")}</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-blue-900 mb-1 block">
                      {t("reference")}
                    </label>
                    <input
                      className="border border-blue-200 rounded-lg p-2 w-full bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                      value={newOrder.reference}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, reference: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-blue-900 text-sm">
                    {t("Add item")}
                  </h3>
                  <div className="flex flex-wrap gap-2 items-center bg-blue-50/60 rounded-lg p-2 sm:p-3">
                    <select
                      className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                      value={currentItem.productId}
                      onChange={(e) => {
                        const product = products.find(
                          (p) => p.id === parseInt(e.target.value)
                        );
                        setCurrentItem({
                          ...currentItem,
                          productId: e.target.value,
                          price: product ? product.price : 0,
                        });
                      }}
                    >
                      <option value="">{t("select product")}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="border border-blue-200 rounded-lg p-2 w-14 sm:w-16 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                      type="number"
                      min="1"
                      placeholder={t("qty placeholder")}
                      value={currentItem.quantity}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          quantity: parseInt(e.target.value),
                        })
                      }
                    />
                    <input
                      className="border border-blue-200 rounded-lg p-2 w-16 sm:w-20 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                      type="number"
                      placeholder={t("unit price placeholder")}
                      value={currentItem.price}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          price: parseFloat(e.target.value),
                        })
                      }
                    />
                    <select
                      className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                      value={currentItem.discountType}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          discountType: e.target.value,
                        })
                      }
                    >
                      <option value="none">{t("no discount")}</option>
                      <option value="percent">{t("percent")}</option>
                      <option value="fixed">{t("fixed")}</option>
                    </select>
                    <input
                      className="border border-blue-200 rounded-lg p-2 w-14 sm:w-16 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                      type="number"
                      placeholder={t("discount placeholder")}
                      value={currentItem.discountValue}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          discountValue: parseFloat(e.target.value),
                        })
                      }
                    />
                    <button
                      onClick={addItem}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold shadow transition text-sm"
                    >
                      {t("add")}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 sm:p-4 rounded-xl mb-6 border border-blue-100">
                  <h4 className="font-semibold mb-2 text-blue-900 text-sm">
                    {t("order summary")}
                  </h4>
                  {newOrder.items.length === 0 && (
                    <div className="text-blue-400 text-xs mb-2">
                      {t("no items added")}
                    </div>
                  )}
                  {newOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs mb-1"
                    >
                      <span>
                        {
                          products.find(
                            (p) => p.id === parseInt(item.productId)
                          )?.name
                        }{" "}
                        × {item.quantity}
                      </span>
                      <span>${calculateLineTotal(item).toFixed(2)}</span>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <div className="text-xs space-y-1">
                    <div>
                      {t("subtotal")}:{" "}
                      <b>${calculateTotals().subtotal.toFixed(2)}</b>
                    </div>
                    <div>
                      {t("line discounts")}:{" "}
                      <b>-${calculateTotals().lineDiscounts.toFixed(2)}</b>
                    </div>
                    <div>
                      {t("tax")}: <b>${calculateTotals().tax.toFixed(2)}</b>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="font-semibold text-blue-900 text-sm">
                    {t("overall discount")}
                  </label>
                  <div className="flex gap-2 mt-1">
                    <select
                      className="border border-blue-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                      value={newOrder.overallDiscount.type}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          overallDiscount: {
                            ...newOrder.overallDiscount,
                            type: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="none">{t("none")}</option>
                      <option value="percent">{t("percent")}</option>
                      <option value="fixed">{t("fixed")}</option>
                    </select>
                    <input
                      className="border border-blue-200 rounded-lg p-2 w-16 sm:w-20 bg-white focus:ring-2 focus:ring-blue-300 transition text-sm"
                      type="number"
                      value={newOrder.overallDiscount.value}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          overallDiscount: {
                            ...newOrder.overallDiscount,
                            value: parseFloat(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="text-right font-bold text-base sm:text-lg mb-6 text-blue-900">
                  {t("Grand Total")}: ${calculateTotals().grandTotal.toFixed(2)}
                </div>

                <button
                  onClick={saveOrder}
                  className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 hover:from-blue-800 hover:to-blue-500 text-white w-full py-3 rounded-xl font-bold shadow-lg transition-all duration-150 text-base tracking-wide"
                >
                  {t("save sales order")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
