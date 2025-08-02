import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, API_ENDPOINTS } from "../../config/api";

const STATUS_STEPS = [
  { key: "New", label: "Order Placed", icon: "🆕", color: "blue" },
  { key: "Accepted", label: "Confirmed by Restaurant", icon: "✅", color: "yellow" },
  { key: "Preparing", label: "Preparing Your Order", icon: "👨‍🍳", color: "orange" },
  { key: "Out for Delivery", label: "Out for Delivery", icon: "🚚", color: "purple" },
  { key: "Delivered", label: "Delivered", icon: "🎉", color: "green" }
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function OrderTrackingPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const orderId = query.get("id");
  const [order, setOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("New");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.ORDER_BY_ID(orderId));
      setOrder(data);
      setCurrentStatus(data.status || "New");
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    if (!order || !order.restaurantId) return;
    
    try {
      const data = await api.get(`${API_ENDPOINTS.SUPPORT_MESSAGES}?orderId=${orderId}&customerId=${userId}&restaurantId=${order.restaurantId}`);
      setChatMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching chat messages:", err);
      setChatMessages([]);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !order) return;
    
    setSendingMessage(true);
    try {
      const messageData = {
        orderId: orderId,
        restaurantId: order.restaurantId,
        customerId: userId,
        sender: "customer",
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

  const openChatModal = async () => {
    setShowChatModal(true);
    await fetchChatMessages();
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setChatMessages([]);
    setNewMessage("");
  };

  useEffect(() => {
    if (orderId && token) {
      fetchOrder();
    }
  }, [orderId, token]);

  // Polling for order updates
  useEffect(() => {
    if (!orderId || !token) return;

    const pollInterval = setInterval(() => {
      fetchOrder();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [orderId, token]);

  // Polling for chat messages when chat modal is open
  useEffect(() => {
    if (!showChatModal || !order) return;

    const chatPollInterval = setInterval(() => {
      fetchChatMessages();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(chatPollInterval);
  }, [showChatModal, order]);

  const getStatusIndex = (status) => {
    return STATUS_STEPS.findIndex(step => step.key === status);
  };

  const getStatusColor = (status) => {
    const step = STATUS_STEPS.find(s => s.key === status);
    if (!step) return "gray";
    return step.color;
  };

  const getStatusIcon = (status) => {
    const step = STATUS_STEPS.find(s => s.key === status);
    return step ? step.icon : "📋";
  };

  if (loading) return <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center">Loading...</div>;
  if (error || !order) return <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 text-center text-red-600">{error || "Order not found."}</div>;

  const currentStatusIndex = getStatusIndex(currentStatus);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Order Tracking</h2>
      
      {/* Order Details */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-gray-600 mb-1">Order ID: <span className="font-semibold text-[#16213e]">#{order.id}</span></div>
        <div className="text-gray-600 mb-1">Restaurant: <span className="font-semibold text-[#16213e]">{order.restaurantName || "Restaurant"}</span></div>
        <div className="text-gray-600 mb-1">Placed At: {new Date(order.date || order.createdAt).toLocaleString()}</div>
        <div className="text-gray-600 mb-1">
          Items: {order.items && order.items.map ? 
            order.items.map(i => `${i.quantity || i.qty} x ${i.name}`).join(", ") : 
            "Order items"
          }
        </div>
        <div className="text-gray-600">Total: <span className="font-semibold text-[#16213e]">${order.total?.toFixed ? order.total.toFixed(2) : order.total}</span></div>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getStatusIcon(currentStatus)}</span>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Current Status</h3>
            <p className="text-blue-600">{currentStatus}</p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#16213e] mb-4">Order Progress</h3>
        <ol className="relative border-l-2 border-blue-200">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            
            return (
              <li key={step.key} className="mb-8 ml-6">
                <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ${
                  isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? "✓" : idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{step.icon}</span>
                  <div>
                    <h3 className={`font-semibold ${isCompleted ? 'text-blue-700' : 'text-gray-400'}`}>
                      {step.label}
                    </h3>
                    {isCurrent && <p className="text-sm text-blue-500 mt-1">Current Status</p>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {order.status !== "Delivered" && order.status !== "Cancelled" && (
          <button
            onClick={openChatModal}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            💬 Chat with Restaurant
          </button>
        )}
        
        <button
          onClick={() => navigate("/customer/orders")}
          className="w-full bg-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-gray-700 transition"
        >
          Back to Orders
        </button>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold text-[#16213e]">
                  Chat with Restaurant
                </h3>
                <p className="text-sm text-gray-600">
                  Order #{order.id} - {order.restaurantName || "Restaurant"}
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
                    className={`flex ${message.sender === "customer" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-xl ${
                        message.sender === "customer"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === "customer" ? "text-blue-100" : "text-gray-500"
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