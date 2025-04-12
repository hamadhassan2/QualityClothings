import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalImage, setModalImage] = useState(null);

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
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        // Sort by status (using statusOrder) and then by date (most recent first).
        const sortedOrders = response.data.orders.sort((a, b) => {
          if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
          }
          return new Date(b.date) - new Date(a.date);
        });
        setOrders(sortedOrders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Filtering orders based on search, status, and date.
  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.address.firstName} ${order.address.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || order.status === filterStatus;
    const orderDate = new Date(order.date);
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && orderDate >= new Date(startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && orderDate <= new Date(endDate);
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Helper function to render variant detail.
  const renderVariant = (item) => {
    if (item.age) {
      return `${item.age} ${item.ageUnit || ""}`.trim();
    } else if (item.size) {
      return item.size;
    } else if (item.variant) {
      return item.variant;
    }
    return "";
  };

  // Handler to update order status.
  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: newStatus },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handler to update payment status.
  const paymentStatusHandler = async (event, orderId) => {
    // "Done" means payment is true, otherwise false.
    const newPaymentStatus = event.target.value === "Done";
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/updatePaymentStatus`,
        { orderId, payment: newPaymentStatus },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, payment: newPaymentStatus } : order
          )
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-100 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Order Management
        </h3>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-auto p-3 md:mt-9 border border-gray-300 rounded-md text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 hover:border-gray-400 h-12"
          >
            <option value="All">All Statuses</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Packing">Packing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for delivery">Out for delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="w-full h-12 md:mt-9 md:w-auto p-3 border border-gray-300 rounded-md text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 hover:border-gray-400"
          />
          <div className="flex gap-2 items-center grid grid-col-1">
            <label className="text-gray-700 text-xl">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full md:w-auto p-3 border border-gray-300 rounded-md text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 hover:border-gray-400"
            />
          </div>
          <div className="flex gap-2 items-center grid grid-col-1">
            <label className="text-gray-700 text-xl">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full md:w-auto p-3 border border-gray-300 rounded-md text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 hover:border-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <div
              key={order._id || index}
              className={`bg-white border border-gray-200 rounded-2xl shadow-lg p-6 transition transform hover:scale-105 hover:shadow-2xl cursor-pointer ${
                isMobile ? "w-11/12 mx-auto" : ""
              }`}
              onClick={() =>
                isMobile &&
                setExpandedOrder(expandedOrder === index ? null : index)
              }
            >
              {isMobile ? (
                // Layout for Mobile: parcel icon fixed on top and then order details below
                <div className="flex flex-col gap-4">
                  <div className="flex ">
                    <img
                      src={assets.parcel_icon}
                      alt="Parcel Icon"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div className="space-y-4">
                    <p className="text-xl font-bold text-gray-800">
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
                          className="border border-gray-300 rounded-lg p-3 flex gap-4 items-center w-full"
                        >
                          {item.productImage && (
                            <img
                              src={
                                Array.isArray(item.productImage)
                                  ? item.productImage[0]
                                  : item.productImage
                              }
                              alt={item.productName}
                              className="w-16 h-16 object-contain rounded cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click event
                                setModalImage(
                                  Array.isArray(item.productImage)
                                    ? item.productImage[0]
                                    : item.productImage
                                );
                              }}
                            />
                          )}
                          <div>
                            <p className="text-blue-700 font-semibold text-base">
                              {item.productName}{" "}
                              <span className="text-slate-500 italic text-sm ml-1">
                                ({item.subCategory || "N/A"})
                              </span>
                            </p>
                            <p className="flex items-center gap-2 text-sm text-gray-700">
                              Color:{" "}
                              {item.color ? (
                                <>
                                  <span
                                    className="inline-block w-3 h-3 rounded-full border border-gray-300"
                                    style={{
                                      backgroundColor: item.color.toLowerCase(),
                                    }}
                                  ></span>
                                  <span className="ml-1 capitalize font-medium text-gray-800">
                                    {item.color}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-500">N/A</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-700">
                              Age/Size:{" "}
                              <span className="italic text-gray-800 ml-1">
                                {renderVariant(item)}
                              </span>{" "}
                              | Quantity:{" "}
                              <span className="text-red-600 font-bold ml-1">
                                {item.quantity}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    <p className="text-gray-700 text-sm">
                      Items: {order.items.length}
                    </p>
                    <p className="text-gray-700 text-sm">
                      Method: {order.paymentMethod}
                    </p>
                    <p
                      className={`font-semibold text-sm ${
                        order.payment ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Payment: {order.payment ? "Done" : "Pending"}
                    </p>
                    <p className="text-gray-700 text-sm">
                      Date: {new Date(order.date).toLocaleDateString()}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {currency}
                      {order.amount}
                    </p>
                    <div className="flex flex-col gap-2 w-full">
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(event) =>
                          statusHandler(event, order._id)
                        }
                        value={order.status}
                        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-gray-400 ${
                          order.status === "Cancelled" ? "text-red-600" : ""
                        }`}
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Packing">Packing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(event) =>
                          paymentStatusHandler(event, order._id)
                        }
                        value={order.payment ? "Done" : "Pending"}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-gray-400"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                // Layout for larger screens
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="flex items-start gap-6">
                    <img
                      src={assets.parcel_icon}
                      alt="Parcel Icon"
                      className="w-16 h-16 object-contain"
                    />
                    <div className="space-y-4">
                      <p className="text-xl font-bold text-gray-800">
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
                            className="border border-gray-300 rounded-lg p-3 flex gap-4 items-center"
                          >
                            {item.productImage && (
                              <img
                                src={
                                  Array.isArray(item.productImage)
                                    ? item.productImage[0]
                                    : item.productImage
                                }
                                alt={item.productName}
                                className="w-16 h-16 object-contain rounded cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalImage(
                                    Array.isArray(item.productImage)
                                      ? item.productImage[0]
                                      : item.productImage
                                  );
                                }}
                              />
                            )}
                            <div>
                              <p className="text-blue-700 font-semibold text-base">
                                {item.productName}{" "}
                                <span className="text-slate-500 italic text-sm ml-1">
                                  ({item.subCategory || "N/A"})
                                </span>
                              </p>
                              <p className="flex items-center gap-2 text-sm text-gray-700">
                                Color:{" "}
                                {item.color ? (
                                  <>
                                    <span
                                      className="inline-block w-3 h-3 rounded-full border border-gray-300"
                                      style={{
                                        backgroundColor: item.color.toLowerCase(),
                                      }}
                                    ></span>
                                    <span className="ml-1 capitalize font-medium text-gray-800">
                                      {item.color}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-gray-500">N/A</span>
                                )}
                              </p>
                              <p className="text-sm text-gray-700">
                                Age/Size:{" "}
                                <span className="italic text-gray-800 ml-1">
                                  {renderVariant(item)}
                                </span>{" "}
                                | Quantity:{" "}
                                <span className="text-red-600 font-bold ml-1">
                                  {item.quantity}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-col items-end space-y-3 min-w-[220px]">
                    <p className="text-gray-700 text-sm">
                      Items: {order.items.length}
                    </p>
                    <p className="text-gray-700 text-sm">
                      Method: {order.paymentMethod}
                    </p>
                    <p
                      className={`font-semibold text-sm ${
                        order.payment ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Payment: {order.payment ? "Done" : "Pending"}
                    </p>
                    <p className="text-gray-700 text-sm">
                      Date: {new Date(order.date).toLocaleDateString()}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {currency}
                      {order.amount}
                    </p>
                    <div className="flex flex-col gap-2 w-full">
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(event) =>
                          statusHandler(event, order._id)
                        }
                        value={order.status}
                        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-gray-400 ${
                          order.status === "Cancelled" ? "text-red-600" : ""
                        }`}
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Packing">Packing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for delivery">
                          Out for delivery
                        </option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(event) =>
                          paymentStatusHandler(event, order._id)
                        }
                        value={order.payment ? "Done" : "Pending"}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-gray-400"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
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

      {/* Modal for enlarged product image */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="Enlarged product"
            className="max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Orders;
