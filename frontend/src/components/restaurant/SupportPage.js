import React, { useState, useEffect, useCallback } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function SupportPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const fetchRestaurantId = useCallback(async () => {
    try {
      console.log("Fetching restaurant ID for support page, user:", userId);
      const data = await api.get(API_ENDPOINTS.RESTAURANT_BY_OWNER(userId));
      console.log("Fetched restaurant data for support:", data);
      if (data && data.id) {
        setRestaurantId(data.id);
        console.log("Set restaurant ID for support to:", data.id);
      } else {
        console.error("No restaurant ID found in response:", data);
        setError("Restaurant information not found");
      }
    } catch (err) {
      console.error("Error fetching restaurant ID for support:", err);
      setError("Failed to fetch restaurant information: " + err.message);
    }
  }, [userId]);

  const fetchMessages = useCallback(async () => {
    if (!restaurantId) {
      console.log("No restaurant ID available for fetching messages");
      return;
    }
    
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.SUPPORT_MESSAGES + `/restaurant/${restaurantId}`);
      console.log("Fetched support messages:", data);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching support messages:", err);
      setError(err.message);
    }
  }, [restaurantId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !restaurantId) return;
    
    setSending(true);
    try {
      const messageData = {
        restaurantId: restaurantId,
        sender: "restaurant",
        message: newMessage
      };
      
      const data = await api.post(API_ENDPOINTS.SUPPORT_MESSAGES, messageData);
      console.log("Sent support message:", data);
      setMessages(prev => [...prev, data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchRestaurantId();
      setLoading(false);
    }
    if (userId && token) {
      initialFetch();
    }
  }, [userId, token, fetchRestaurantId]);

  // Fetch messages when restaurant ID is available
  useEffect(() => {
    if (restaurantId) {
      fetchMessages();
    }
  }, [restaurantId, fetchMessages]);

  // Auto-refresh messages every 30 seconds
  useEffect(() => {
    if (!restaurantId) return;
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, [restaurantId, fetchMessages]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Customer Support</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">How to use Support</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Customers can send you messages about their orders</li>
          <li>• Respond promptly to maintain good customer service</li>
          <li>• Messages are automatically refreshed every 30 seconds</li>
          <li>• You can send messages to help resolve customer issues</li>
        </ul>
      </div>

      {/* Messages List */}
      <div className="mb-6 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No support messages yet.</div>
            <div className="text-sm text-gray-400">Customer messages will appear here when they contact you.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-xl border ${
                  message.senderType === "restaurant"
                    ? "bg-blue-50 border-blue-200 ml-8"
                    : "bg-gray-50 border-gray-200 mr-8"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      message.senderType === "restaurant"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {message.senderType === "restaurant" ? "You" : "Customer"}
                    </span>
                    {message.orderId && (
                      <span className="text-xs text-gray-500">Order #{message.orderId}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(message.createdAt || message.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800">{message.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Message Form */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-[#16213e] mb-4">Send Message</h3>
        <div className="flex gap-4">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message to the customer..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
} 