import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.ADMIN_ORDERS);
      console.log("Fetched orders:", data);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    }
  };

  const cancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel order #${order.id}?`)) return;
    
    try {
      const data = await api.post(API_ENDPOINTS.ADMIN_ORDER_CANCEL(order.id));
      console.log("Cancelled order:", data);
      setOrders(prev => prev.map(o => 
        o.id === order.id ? { ...o, status: "Cancelled" } : o
      ));
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError(err.message);
    }
  };

  const refundOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to refund order #${order.id}?`)) return;
    
    try {
      const data = await api.post(API_ENDPOINTS.ADMIN_ORDER_REFUND(order.id));
      console.log("Refunded order:", data);
      setOrders(prev => prev.map(o => 
        o.id === order.id ? { ...o, status: "Refunded" } : o
      ));
    } catch (err) {
      console.error("Error refunding order:", err);
      setError(err.message);
    }
  };

  const deleteOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to delete order #${order.id}? This cannot be undone.`)) return;
    
    try {
      await api.delete(API_ENDPOINTS.ADMIN_ORDER_DELETE(order.id));
      console.log("Deleted order:", order.id);
      setOrders(prev => prev.filter(o => o.id !== order.id));
    } catch (err) {
      console.error("Error deleting order:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    }
    initialFetch();
  }, []);

  const filteredOrders = orders.filter(order =>
    order.id?.toString().includes(searchTerm) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => ["New", "Accepted", "Preparing", "Out for Delivery"].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === "Delivered").length;
  const cancelledOrders = orders.filter(o => o.status === "Cancelled").length;

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Order Monitoring</h2>
      <p className="text-gray-600 mb-8">Monitor and manage platform orders, track status, and handle issues</p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{activeOrders}</div>
          <div className="text-sm text-gray-600">Active Orders</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="text-2xl font-bold text-red-600">{cancelledOrders}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by order ID, user ID, restaurant ID, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          <span className="text-sm text-gray-600">
            {filteredOrders.length} of {orders.length} orders
          </span>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No orders found.</div>
          <div className="text-sm text-gray-400">
            {searchTerm ? "Try adjusting your search terms." : "Orders will appear here once customers place them."}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 font-semibold border-b">
                <th className="pb-3 px-4">Order ID</th>
                <th className="pb-3 px-4">Customer</th>
                <th className="pb-3 px-4">Restaurant</th>
                <th className="pb-3 px-4">Amount</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-[#16213e]">#{order.id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{order.restaurantName}</div>
                      <div className="text-xs text-gray-500">{order.restaurantAddress}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#16213e]">₹{order.total || 0}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "Delivered" ? "bg-green-100 text-green-800" :
                      order.status === "Cancelled" ? "bg-red-100 text-red-800" :
                      order.status === "New" ? "bg-blue-100 text-blue-800" :
                      order.status === "Preparing" ? "bg-yellow-100 text-yellow-800" :
                      order.status === "Out for Delivery" ? "bg-purple-100 text-purple-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(order.createdAt || order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {order.status !== "Cancelled" && order.status !== "Delivered" && (
                        <button
                          onClick={() => cancelOrder(order)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      {order.status === "Delivered" && (
                        <button
                          onClick={() => refundOrder(order)}
                          className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors"
                        >
                          Refund
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order)}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 