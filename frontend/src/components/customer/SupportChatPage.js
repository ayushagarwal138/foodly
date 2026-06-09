import React, { useCallback, useState, useEffect, useRef } from "react";
import { FiMessageCircle, FiSend } from "react-icons/fi";
import { api, API_ENDPOINTS } from "../../config/api";
import { keepPreviousIfSame } from "../../utils/state";

export default function SupportChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const userId = localStorage.getItem("userId");
  const messagesEndRef = useRef(null);
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");
  const restaurantId = params.get("restaurantId");

  const fetchMessages = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setError("");
      setRefreshError("");
    }

    try {
      const data = await api.get(`${API_ENDPOINTS.SUPPORT_MESSAGES}?orderId=${orderId}&customerId=${userId}&restaurantId=${restaurantId}`);
      const nextMessages = Array.isArray(data) ? data : [];
      setMessages(previous => keepPreviousIfSame(previous, nextMessages));
      setRefreshError("");
    } catch (err) {
      console.error("Error fetching messages:", err);
      if (silent) {
        setRefreshError("Could not refresh messages. Retrying in the background.");
      } else {
        setRefreshError(err.message || "Unable to load messages. Retrying in the background.");
      }
    }
  }, [orderId, restaurantId, userId]);

  const markRestaurantMessagesRead = useCallback(async () => {
    if (!userId || !orderId || !restaurantId) return;

    try {
      await api.put(
        `${API_ENDPOINTS.SUPPORT_MARK_ALL_READ}?orderId=${orderId}&customerId=${userId}&restaurantId=${restaurantId}`,
        {}
      );
      window.dispatchEvent(new CustomEvent("foodlyNotificationsChanged"));
    } catch (err) {
      console.error("Error marking support messages as read:", err);
    }
  }, [orderId, restaurantId, userId]);

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchMessages();
      await markRestaurantMessagesRead();
      setLoading(false);
    }
    if (userId && orderId && restaurantId) {
      initialFetch();
    }
  }, [userId, orderId, restaurantId, fetchMessages, markRestaurantMessagesRead]);

  // Polling for new messages
  useEffect(() => {
    if (!userId || !orderId || !restaurantId) return;
    const interval = setInterval(() => fetchMessages({ silent: true }), 5000);
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [userId, orderId, restaurantId, fetchMessages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    
    try {
      const messageData = {
        customerId: userId,
        sender: "customer",
        orderId: orderId,
        restaurantId: restaurantId,
        message: input
      };
      
      const newMsg = await api.post(API_ENDPOINTS.SUPPORT_MESSAGES, messageData);
      setMessages(prev => [...prev, newMsg]);
      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message: " + err.message);
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!orderId || !restaurantId) {
    return <div className="app-page-narrow surface-panel text-center text-red-600">Open support from an order or notification.</div>;
  }

  if (loading) return <div className="app-page-narrow surface-panel text-center">Loading...</div>;

  return (
    <div className="app-page-narrow">
      <div className="surface-panel flex h-[72vh] min-h-[560px] flex-col p-0">
        <div className="border-b border-neutral-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100">
              <FiMessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Support Chat</h2>
              <p className="text-sm text-neutral-600">Order #{orderId}</p>
            </div>
          </div>
          {(refreshError || error) && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error || refreshError}
            </div>
          )}
        </div>
      <div className="flex-1 overflow-y-auto bg-neutral-50 p-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-neutral-500">
            <div>
              <FiMessageCircle className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
              <p className="font-medium text-neutral-700">No messages yet</p>
              <p className="mt-1 text-sm">Start the conversation with the restaurant.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`mb-3 flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`} >
              <div className={`max-w-[78%] rounded-md px-4 py-2 text-sm shadow-sm ${msg.sender === 'customer' ? 'bg-primary-600 text-white' : 'border border-neutral-200 bg-white text-neutral-800'}`}>{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="flex gap-2 border-t border-neutral-200 p-4" onSubmit={sendMessage}>
        <input
          className="input flex-1"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button className="btn btn-primary px-4" type="submit">
          <FiSend className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
      </div>
    </div>
  );
} 
