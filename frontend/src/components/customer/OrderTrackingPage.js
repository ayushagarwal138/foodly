import React, { useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiCheckCircle, FiClock, FiMessageCircle, FiPackage, FiSend, FiTruck, FiX } from "react-icons/fi";
import { api, API_ENDPOINTS } from "../../config/api";
import { keepPreviousIfSame } from "../../utils/state";

const STATUS_STEPS = [
  { key: "new", label: "Order Placed", icon: FiPackage },
  { key: "accepted", label: "Confirmed by Restaurant", icon: FiCheckCircle },
  { key: "preparing", label: "Preparing Your Order", icon: FiClock },
  { key: "out for delivery", label: "Out for Delivery", icon: FiTruck },
  { key: "delivered", label: "Delivered", icon: FiCheckCircle }
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
  const userId = localStorage.getItem("userId");

  const fetchOrder = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await api.get(API_ENDPOINTS.ORDER_BY_ID(orderId));
      console.log("Fetched order data:", data);
      setOrder(previous => keepPreviousIfSame(previous, data));
      setCurrentStatus(data.status || "New");
      if (!silent) setError("");
    } catch (err) {
      console.error("Error fetching order:", err);
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [orderId]);

  const fetchChatMessages = async () => {
    console.log("Attempting to fetch chat messages with:", { order, orderId, userId, restaurantId: order?.restaurantId });
    
    if (!order) {
      console.log("Order not loaded yet");
      return;
    }
    
    if (!order.restaurantId) {
      console.log("Restaurant ID missing from order:", order);
      return;
    }
    
    try {
      const data = await api.get(`${API_ENDPOINTS.SUPPORT_MESSAGES}?orderId=${orderId}&customerId=${userId}&restaurantId=${order.restaurantId}`);
      console.log("Fetched chat messages:", data);
      const nextMessages = Array.isArray(data) ? data : [];
      setChatMessages(previous => keepPreviousIfSame(previous, nextMessages));
    } catch (err) {
      console.error("Error fetching chat messages:", err);
      setChatMessages(previous => previous.length === 0 ? previous : []);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !order) return;
    
    if (!order.restaurantId) {
      setError("Cannot send message: Restaurant information not available");
      return;
    }
    
    setSendingMessage(true);
    try {
      const messageData = {
        orderId: orderId,
        restaurantId: order.restaurantId,
        customerId: userId,
        sender: "customer",
        message: newMessage
      };
      
      console.log("Sending chat message:", messageData);
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
    console.log("Opening chat modal with order:", order);
    if (!order || !order.restaurantId) {
      setError("Cannot open chat: Order information not complete");
      return;
    }
    
    setShowChatModal(true);
    await fetchChatMessages();
    
    // Mark all messages as read when opening chat
    try {
      await api.put(
        `${API_ENDPOINTS.SUPPORT_MARK_ALL_READ}?orderId=${orderId}&customerId=${userId}&restaurantId=${order.restaurantId}`,
        {}
      );
      window.dispatchEvent(new CustomEvent("foodlyNotificationsChanged"));
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setChatMessages([]);
    setNewMessage("");
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  // Polling for order updates
  useEffect(() => {
    if (!orderId) return;

    const pollInterval = setInterval(() => {
      fetchOrder({ silent: true });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [orderId, fetchOrder]);

  // Polling for chat messages when chat modal is open
  useEffect(() => {
    if (!showChatModal || !order || !order.restaurantId) return;

    const chatPollInterval = setInterval(() => {
      fetchChatMessages();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(chatPollInterval);
  }, [showChatModal, order?.restaurantId]);

  const getStatusIndex = (status) => {
    const normalizedStatus = status?.toLowerCase();
    return STATUS_STEPS.findIndex(step => step.key === normalizedStatus);
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    const step = STATUS_STEPS.find(s => s.key === normalizedStatus);
    return step ? step.icon : FiPackage;
  };

  if (loading) return <div className="app-page-narrow surface-panel text-center">Loading...</div>;
  if (error || !order) return <div className="app-page-narrow surface-panel text-center text-red-600">{error || "Order not found."}</div>;

  const currentStatusIndex = getStatusIndex(currentStatus);

  return (
    <div className="app-page-narrow">
      <div className="mb-6">
        <h2 className="section-title">Order Tracking</h2>
        <p className="section-subtitle">Follow your order progress and contact the restaurant if needed.</p>
      </div>
      
      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Info</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>Order ID: {orderId}</div>
            <div>User ID: {userId}</div>
            <div>Order Loaded: {order ? 'Yes' : 'No'}</div>
            <div>Restaurant ID: {order?.restaurantId || 'Missing'}</div>
            <div>Order Status: {currentStatus}</div>
            <div>Chat Modal Open: {showChatModal ? 'Yes' : 'No'}</div>
            <div>Chat Messages: {chatMessages.length}</div>
          </div>
        </div>
      )}
      
      {/* Order Details */}
      <div className="surface-panel mb-6">
        <div className="mb-1 text-neutral-600">Order ID: <span className="font-semibold text-neutral-950">#{order.id}</span></div>
        <div className="mb-1 text-neutral-600">Restaurant: <span className="font-semibold text-neutral-950">{order.restaurantName || "Restaurant"}</span></div>
        <div className="mb-1 text-neutral-600">Placed At: {new Date(order.date || order.createdAt).toLocaleString()}</div>
        <div className="mb-1 text-neutral-600">
          Items: {order.items && order.items.map ? 
            order.items.map(i => `${i.quantity || i.qty} x ${i.name}`).join(", ") : 
            "Order items"
          }
        </div>
        <div className="text-neutral-600">Total: <span className="font-semibold text-neutral-950">₹{order.total?.toFixed ? order.total.toFixed(2) : order.total}</span></div>
      </div>

      {/* Current Status */}
      <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50 p-4">
        <div className="flex items-center gap-3">
          {React.createElement(getStatusIcon(currentStatus), { className: "h-7 w-7 text-primary-700" })}
          <div>
            <h3 className="text-lg font-semibold text-primary-900">Current Status</h3>
            <p className="text-primary-700">{currentStatus}</p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="surface-panel mb-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-950">Order Progress</h3>
        <ol className="relative border-l-2 border-primary-200">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            const StepIcon = step.icon;
            
            return (
              <li key={step.key} className="mb-8 ml-6">
                <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${
                  isCompleted ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'
                }`}>
                  {isCompleted ? <FiCheck className="h-3.5 w-3.5" /> : idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <StepIcon className={`h-5 w-5 ${isCompleted ? 'text-primary-700' : 'text-neutral-400'}`} />
                  <div>
                    <h3 className={`font-semibold ${isCompleted ? 'text-primary-800' : 'text-neutral-400'}`}>
                      {step.label}
                    </h3>
                    {isCurrent && <p className="mt-1 text-sm text-primary-600">Current Status</p>}
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
            className="btn btn-primary w-full"
          >
            <FiMessageCircle className="h-4 w-4" />
            Chat with Restaurant
          </button>
        )}
        
        <button
          onClick={() => navigate("/customer/orders")}
          className="btn btn-secondary w-full"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg border border-neutral-200 bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 p-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-950">
                  Chat with Restaurant
                </h3>
                <p className="text-sm text-neutral-600">
                  Order #{order.id} - {order.restaurantName || "Restaurant"}
                </p>
              </div>
              <button
                onClick={closeChatModal}
                className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="max-h-96 flex-1 space-y-4 overflow-y-auto bg-neutral-50 p-6">
              {chatMessages.length === 0 ? (
                <div className="py-8 text-center text-neutral-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "customer" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs rounded-md px-4 py-2 ${
                        message.sender === "customer"
                          ? "bg-primary-600 text-white"
                          : "border border-neutral-200 bg-white text-neutral-800"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === "customer" ? "text-primary-100" : "text-neutral-500"
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-neutral-200 p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="input flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !sendingMessage) {
                      sendChatMessage();
                    }
                  }}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="btn btn-primary px-4 disabled:bg-neutral-300 disabled:text-neutral-500"
                >
                  <FiSend className="h-4 w-4" />
                  <span className="hidden sm:inline">{sendingMessage ? "Sending..." : "Send"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
