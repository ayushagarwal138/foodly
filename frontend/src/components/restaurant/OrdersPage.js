import React, { useState, useEffect, useCallback } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.RESTAURANT_ORDERS(restaurantId));
      console.log("Fetched orders:", data);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    }
  }, [restaurantId]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const data = await api.patch(API_ENDPOINTS.ORDER_STATUS(orderId), { status: newStatus });
      console.log("Updated order status:", data);
      await fetchOrders(); // Refresh the list
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status. Please try again.");
    }
  };

  const fetchChatMessages = async (orderId) => {
    try {
      const data = await api.get(`${API_ENDPOINTS.SUPPORT_MESSAGES}?orderId=${orderId}&restaurantId=${restaurantId}`);
      setChatMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching chat messages:", err);
      setChatMessages([]);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !selectedOrder) return;
    
    setSendingMessage(true);
    try {
      const messageData = {
        orderId: selectedOrder.id,
        restaurantId: restaurantId,
        customerId: selectedOrder.userId,
        sender: "restaurant",
        message: newMessage
      };
      
      const data = await api.post(API_ENDPOINTS.SUPPORT_MESSAGES, messageData);
      setChatMessages(prev => [...prev, data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const openChatModal = async (order) => {
    setSelectedOrder(order);
    setShowChatModal(true);
    await fetchChatMessages(order.id);
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedOrder(null);
    setChatMessages([]);
    setNewMessage("");
  };

  // Initial fetch
  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    }
    if (restaurantId && token) {
      initialFetch();
    }
  }, [restaurantId, token, fetchOrders]);

  // Polling for new orders
  useEffect(() => {
    if (!restaurantId || !token) return;

    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [restaurantId, token, fetchOrders]);

  // Polling for new chat messages when chat modal is open
  useEffect(() => {
    if (!showChatModal || !selectedOrder) return;

    const chatPollInterval = setInterval(() => {
      fetchChatMessages(selectedOrder.id);
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(chatPollInterval);
  }, [showChatModal, selectedOrder]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  // Filter orders by status
  const filteredOrders = selectedStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  // Sort orders by date (newest first) and status
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // First sort by status priority
    const statusPriority = {
      "New": 0,
      "Accepted": 1,
      "Preparing": 2,
      "Out for Delivery": 3,
      "Delivered": 4,
      "Cancelled": 5
    };
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then sort by date (newest first)
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB - dateA;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-800";
      case "Accepted": return "bg-yellow-100 text-yellow-800";
      case "Preparing": return "bg-orange-100 text-orange-800";
      case "Out for Delivery": return "bg-purple-100 text-purple-800";
      case "Delivered": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "New": return "Accepted";
      case "Accepted": return "Preparing";
      case "Preparing": return "Out for Delivery";
      case "Out for Delivery": return "Delivered";
      default: return null;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "New": return "🆕";
      case "Accepted": return "✅";
      case "Preparing": return "👨‍🍳";
      case "Out for Delivery": return "🚚";
      case "Delivered": return "🎉";
      case "Cancelled": return "❌";
      default: return "📋";
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Restaurant Orders</h2>
      
      {/* Status Filter */}
      <div className="mb-6">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Orders</option>
          <option value="New">New</option>
          <option value="Accepted">Accepted</option>
          <option value="Preparing">Preparing</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <div key={order.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStatusIcon(order.status)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-[#16213e]">Order #{order.id}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.date || order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm">Customer: {order.customerName || "Unknown"}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-[#16213e] mb-2">Items:</h4>
                <ul className="space-y-1">
                  {order.items && order.items.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {item.quantity}x {item.name} - ${item.price}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold text-[#16213e]">
                  Total: ${order.total || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openChatModal(order)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    💬 Chat
                  </button>
                  {getNextStatus(order.status) && (
                    <button
                      onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Mark as {getNextStatus(order.status)}
                    </button>
                  )}
                  {order.status === "New" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "Cancelled")}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold text-[#16213e]">
                  Chat - Order #{selectedOrder.id}
                </h3>
                <p className="text-sm text-gray-600">
                  Customer: {selectedOrder.customerName || "Unknown"}
                </p>
              </div>
              <button
                onClick={closeChatModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "restaurant" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-xl ${
                        message.sender === "restaurant"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === "restaurant" ? "text-blue-100" : "text-gray-500"
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !sendingMessage) {
                      sendChatMessage();
                    }
                  }}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 