import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { FaTrash } from "react-icons/fa"; // Delete icon

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalImage, setModalImage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const statusOrder = {
    "Order Placed": 1,
    Packing: 2,
    Shipped: 3,
    "Out for delivery": 4,
    Delivered: 5,
    Cancelled: 6,
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    fetchAllOrders();
    return () => window.removeEventListener("resize", handleResize);
  }, [token]);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );
      if (data.success) {
        const sorted = data.orders.sort((a, b) => {
          if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
          }
          return new Date(b.date) - new Date(a.date);
        });
        setOrders(sorted);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!token) return;
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/order/delete/${orderId}`,
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setOrders((o) => o.filter((x) => x._id !== orderId));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.address.firstName} ${order.address.lastName}`.toLowerCase();
    const matchSearch = fullName.includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "All" || order.status === filterStatus;
    const od = new Date(order.date);
    let matchDate = true;
    if (startDate) matchDate = matchDate && od >= new Date(startDate);
    if (endDate)   matchDate = matchDate && od <= new Date(endDate);
    return matchSearch && matchStatus && matchDate;
  });

  const renderVariant = (item) => {
    if (item.age) return `${item.age} ${item.ageUnit || ""}`.trim();
    if (item.size) return item.size;
    if (item.variant) return item.variant;
    return "";
  };

  const statusHandler = async (e, id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId: id, status: e.target.value },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setOrders((o) =>
          o.map((x) => (x._id === id ? { ...x, status: e.target.value } : x))
        );
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const paymentStatusHandler = async (e, id) => {
    const payment = e.target.value === "Done";
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/order/updatePaymentStatus`,
        { orderId: id, payment },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setOrders((o) =>
          o.map((x) => (x._id === id ? { ...x, payment } : x))
        );
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // helper to prefix uploads
  const resolveUrl = (raw) =>
    raw.startsWith("http") ? raw : `${backendUrl}${raw}`;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-100 min-h-screen relative">
      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Order Management
        </h3>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-auto p-3 border rounded h-12 shadow-sm focus:ring"
          >
            <option value="All">All Statuses</option>
            {["Order Placed","Packing","Shipped","Out for delivery","Delivered","Cancelled"].map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="w-full md:w-auto p-3 border rounded h-12 shadow-sm focus:ring"
          />
          <label className="flex items-center gap-2">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-3 border rounded shadow-sm focus:ring"
            />
          </label>
          <label className="flex items-center gap-2">
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-3 border rounded shadow-sm focus:ring"
            />
          </label>
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-8">
        {filteredOrders.length ? (
          filteredOrders.map((order, idx) => (
            <div
              key={order._id}
              className={`relative bg-white border rounded-2xl shadow-lg p-6 transition hover:scale-105 cursor-pointer ${
                isMobile ? "w-11/12 mx-auto" : ""
              }`}
              onClick={() =>
                isMobile && setExpandedOrder(expandedOrder === idx ? null : idx)
              }
            >
              {/* delete */}
              <FaTrash
                size={18}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(order._id);
                }}
              />

              {/* Mobile vs Desktop */}
              {isMobile ? (
                <div className="flex flex-col gap-4">
                  <img
                    src={assets.parcel_icon}
                    alt="Parcel"
                    className="w-16 h-16"
                  />
                  <div className="space-y-4">
                    <p className="text-xl font-bold">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>{order.address.street},</p>
                      <p>
                        {order.address.city}, {order.address.state},{" "}
                        {order.address.country} {order.address.zipcode}
                      </p>
                      <p>{order.address.phone}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="border rounded-lg p-3 flex gap-4 items-center"
                        >
                          <img
                            src={resolveUrl(
                              Array.isArray(item.productImage)
                                ? item.productImage[0]
                                : item.productImage
                            )}
                            alt={item.productName}
                            className="w-16 h-16 object-contain rounded cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalImage(
                                resolveUrl(
                                  Array.isArray(item.productImage)
                                    ? item.productImage[0]
                                    : item.productImage
                                )
                              );
                            }}
                          />
                          <div>
                            <p className="text-blue-700 font-semibold">
                              {item.productName}{" "}
                              <span className="italic text-sm text-gray-500">
                                ({item.subCategory || "N/A"})
                              </span>
                            </p>
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              Color:{" "}
                              {item.color ? (
                                <>
                                  <span
                                    className="w-3 h-3 rounded-full border"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="capitalize">
                                    {item.color}
                                  </span>
                                </>
                              ) : (
                                "N/A"
                              )}
                            </p>
                            <p className="text-sm text-gray-700">
                              Age/Size:{" "}
                              <span className="italic">
                                {renderVariant(item)}
                              </span>{" "}
                              | Qty:{" "}
                              <span className="text-red-600 font-bold">
                                {item.quantity}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    <p>Items: {order.items.length}</p>
                    <p>Method: {order.paymentMethod}</p>
                    <p className={order.payment ? "text-green-600" : "text-red-600"}>
                      Payment: {order.payment ? "Done" : "Pending"}
                    </p>
                    <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                    <p className="text-2xl font-bold">
                      {currency}
                      {order.amount}
                    </p>
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => statusHandler(e, order._id)}
                      value={order.status}
                      className="w-full p-2 border rounded"
                    >
                      {Object.keys(statusOrder).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => paymentStatusHandler(e, order._id)}
                      value={order.payment ? "Done" : "Pending"}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              ) : (
                // Desktop layout
                <div className="flex justify-between">
                  <div className="flex items-start gap-6">
                    <img
                      src={assets.parcel_icon}
                      alt="Parcel"
                      className="w-16 h-16"
                    />
                    <div className="space-y-4">
                      <p className="text-xl font-bold">
                        {order.address.firstName} {order.address.lastName}
                      </p>
                      <div className="text-gray-600 text-sm space-y-1">
                        <p>{order.address.street},</p>
                        <p>
                          {order.address.city}, {order.address.state},{" "}
                          {order.address.country} {order.address.zipcode}
                        </p>
                        <p>{order.address.phone}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="border rounded-lg p-3 flex gap-4 items-center"
                          >
                            <img
                              src={resolveUrl(
                                Array.isArray(item.productImage)
                                  ? item.productImage[0]
                                  : item.productImage
                              )}
                              alt={item.productName}
                              className="w-16 h-16 object-contain rounded cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalImage(
                                  resolveUrl(
                                    Array.isArray(item.productImage)
                                      ? item.productImage[0]
                                      : item.productImage
                                  )
                                );
                              }}
                            />
                            <div>
                              <p className="text-blue-700 font-semibold">
                                {item.productName}{" "}
                                <span className="italic text-sm text-gray-500">
                                  ({item.subCategory || "N/A"})
                                </span>
                              </p>
                              <p className="text-sm text-gray-700 flex items-center gap-2">
                                Color:{" "}
                                {item.color ? (
                                  <>
                                    <span
                                      className="w-3 h-3 rounded-full border"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="capitalize">
                                      {item.color}
                                    </span>
                                  </>
                                ) : (
                                  "N/A"
                                )}
                              </p>
                              <p className="text-sm text-gray-700">
                                Age/Size:{" "}
                                <span className="italic">
                                  {renderVariant(item)}
                                </span>{" "}
                                | Qty:{" "}
                                <span className="text-red-600 font-bold">
                                  {item.quantity}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-3 min-w-[220px]">
                    <p>Items: {order.items.length}</p>
                    <p>Method: {order.paymentMethod}</p>
                    <p className={order.payment ? "text-green-600" : "text-red-600"}>
                      Payment: {order.payment ? "Done" : "Pending"}
                    </p>
                    <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                    <p className="text-2xl font-bold">
                      {currency}
                      {order.amount}
                    </p>
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => statusHandler(e, order._id)}
                      value={order.status}
                      className="w-full p-2 border rounded"
                    >
                      {Object.keys(statusOrder).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => paymentStatusHandler(e, order._id)}
                      value={order.payment ? "Done" : "Pending"}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            No orders found for the selected filters.
          </p>
        )}
      </div>

      {/* Enlarged Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="Enlarged"
            className="max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-lg p-6 w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-800 text-lg mb-4">
              Are you sure you want to delete this order?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  handleDeleteOrder(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
