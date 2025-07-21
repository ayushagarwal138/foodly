import React, { useState, useEffect, useRef } from "react";

export default function SupportChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");
  const restaurantId = params.get("restaurantId");

  const fetchMessages = async () => {
    // No setLoading here to avoid UI flicker during polling
    setError("");
    try {
      const res = await fetch(`/api/support/messages?orderId=${orderId}&customerId=${userId}&restaurantId=${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchMessages();
      setLoading(false);
    }
    if (userId && token && orderId && restaurantId) {
      initialFetch();
    }
  }, [userId, token, orderId, restaurantId]);

  // Polling for new messages
  useEffect(() => {
    if (!userId || !token || !orderId || !restaurantId) return;
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [userId, token, orderId, restaurantId]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await fetch(`/api/support/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ customerId: userId, sender: "customer", orderId, restaurantId, message: input })
      });
      if (!res.ok) throw new Error("Failed to send message");
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);
      setInput("");
      await fetchMessages(); // Immediately fetch after sending
    } catch (err) {
      setError("Failed to send message");
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100 flex flex-col h-[70vh]">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Support Chat for Order #{orderId}</h2>
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center">No messages yet.</div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`mb-3 flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`} >
              <div className={`px-4 py-2 rounded-xl shadow ${msg.sender === 'customer' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-700'}`}>{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="flex gap-2" onSubmit={sendMessage}>
        <input
          className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition" type="submit">Send</button>
      </form>
    </div>
  );
} 