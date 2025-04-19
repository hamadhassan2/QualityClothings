// src/pages/Analytics.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import {
  FaShoppingCart,
  FaRupeeSign,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

const Analytics = () => {
  const [orders, setOrders]       = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [filtered, setFiltered]   = useState([]);

  // Fetch all orders on mount
  useEffect(() => {
    axios
      .post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token: localStorage.getItem("token") } }
      )
      .then(res => {
        if (res.data.success) {
          setOrders(
            res.data.orders.map(o => ({
              ...o,
              dateObj: new Date(o.date),
            }))
          );
        }
      })
      .catch(console.error);
  }, []);

  // Re‑filter & sort whenever orders or date filters change
  useEffect(() => {
    let out = orders;
    if (startDate) {
      const from = new Date(startDate);
      out = out.filter(o => o.dateObj >= from);
    }
    if (endDate) {
      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
      out = out.filter(o => o.dateObj <= to);
    }
    out.sort((a, b) => b.dateObj - a.dateObj);
    setFiltered(out);
  }, [orders, startDate, endDate]);

  // Decide data‐source for "24 h vs avg daily" calculations
  const source = filtered.length || startDate || endDate ? filtered : orders;

  // Helpers
  const sumInWindow = (arr, from, to) =>
    arr
      .filter(o => o.dateObj >= from && o.dateObj < to)
      .reduce((acc, o) => acc + o.amount, 0);
  const countInWindow = (arr, from, to) =>
    arr.filter(o => o.dateObj >= from && o.dateObj < to).length;

  const now = new Date();
  const oneDayAgo = new Date(now);
  oneDayAgo.setDate(now.getDate() - 1);

  // Last 24 h figures
  const last24Sales  = sumInWindow(source, oneDayAgo, now);
  const last24Orders = countInWindow(source, oneDayAgo, now);

  // Compute span & averages
  const times    = source.map(o => o.dateObj.getTime());
  const minTime  = times.length ? Math.min(...times) : now.getTime();
  const daysSpan = Math.max((now.getTime() - minTime) / (1000 * 60 * 60 * 24), 1);

  const totalSalesAll  = source.reduce((sum, o) => sum + o.amount, 0);
  const totalOrdersAll = source.length;
  const avgDailySales  = totalSalesAll  / daysSpan;
  const avgDailyOrders = totalOrdersAll / daysSpan;

  // Percent change vs avg daily
  const salesPct  = avgDailySales  > 0 
    ? ((last24Sales  - avgDailySales)  / avgDailySales)  * 100
    : last24Sales  > 0 ? 100 : 0;
  const ordersPct = avgDailyOrders > 0 
    ? ((last24Orders - avgDailyOrders) / avgDailyOrders) * 100
    : last24Orders > 0 ? 100 : 0;

  // Totals for the filtered table
  const totalOrders = filtered.length;
  const totalSales  = filtered.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="max-w-screen-xl mx-auto p-6 space-y-8">
      {/* Title */}
      <h1 className="text-3xl font-extrabold text-gray-800">Sales Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Orders Card */}
        <div className="flex flex-col p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
              <FaShoppingCart size={28} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 uppercase">Total Orders</p>
              <p className="mt-1 text-3xl font-bold text-gray-800">
                {totalOrders}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {ordersPct >= 0 ? (
              <FaArrowUp className="text-green-600 mr-2" />
            ) : (
              <FaArrowDown className="text-red-600 mr-2" />
            )}
            <span
              className={`text-sm font-medium ${
                ordersPct >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {Math.abs(ordersPct).toFixed(1)}% vs avg daily
            </span>
          </div>
        </div>

        {/* Sales Card */}
        <div className="flex flex-col p-6 bg-green-50 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="p-4 bg-green-100 rounded-full text-green-600">
              <FaRupeeSign size={28} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 uppercase">Total Sales</p>
              <p className="mt-1 text-3xl font-bold text-gray-800">
                {currency}{totalSales.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {salesPct >= 0 ? (
              <FaArrowUp className="text-green-600 mr-2" />
            ) : (
              <FaArrowDown className="text-red-600 mr-2" />
            )}
            <span
              className={`text-sm font-medium ${
                salesPct >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {Math.abs(salesPct).toFixed(1)}% vs avg daily
            </span>
          </div>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex flex-row sm:flex-row gap-4 items-end justify-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <button
          onClick={() => { setStartDate(""); setEndDate(""); }}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Reset
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-700 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">#</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Customer</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-white">Items</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-white">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((o, idx) => {
                // compute total items in this order
                const totalItems = o.items
                  ? o.items.reduce((sum, i) => sum + (i.quantity || 0), 0)
                  : 0;
                return (
                  <tr
                    key={o._id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-100 transition`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{idx+1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {o.dateObj.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {o.address?.firstName || "Guest"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">
                      {totalItems}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {currency}{o.amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
