import React, { useEffect, useState } from "react";
import Toast from "../Toast";
import OrderDetailModal from "./OrderDetailModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const filtered = orders.filter(o =>
    (o.userId + "").includes(search) ||
    (o.restaurantId + "").includes(search) ||
    (o.status || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleCancel(o) {
    if (!window.confirm(`Cancel order #${o.id}?`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${o.id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to cancel order");
      setToast({ message: `Order #${o.id} cancelled.`, type: "success" });
      fetchOrders();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }
  async function handleRefund(o) {
    if (!window.confirm(`Refund order #${o.id}?`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${o.id}/refund`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to refund order");
      setToast({ message: `Order #${o.id} refunded.`, type: "success" });
      fetchOrders();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }
  async function handleDelete(o) {
    if (!window.confirm(`Delete order #${o.id}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${o.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete order");
      setToast({ message: `Order #${o.id} deleted.`, type: "success" });
      fetchOrders();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }

  function openModal(order) {
    setSelectedOrder(order);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setSelectedOrder(null);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Order Monitoring</h2>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="text"
          placeholder="Search by user, restaurant, or status..."
          className="border rounded px-4 py-2 w-full md:w-80"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />}
      <OrderDetailModal
        order={selectedOrder}
        open={modalOpen}
        onClose={closeModal}
        onCancel={handleCancel}
        onRefund={handleRefund}
        onDelete={handleDelete}
      />
      {loading ? (
        <div className="p-10 text-center">Loading orders...</div>
      ) : error ? (
        <div className="p-10 text-center text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-2xl shadow border border-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Restaurant</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr
                  key={o.id}
                  className="border-b hover:bg-yellow-50 cursor-pointer transition"
                  onClick={e => {
                    if (e.target.tagName !== "BUTTON") openModal(o);
                  }}
                >
                  <td className="px-4 py-2">{o.id}</td>
                  <td className="px-4 py-2 font-semibold text-yellow-900">{o.userId}</td>
                  <td className="px-4 py-2">{o.restaurantId}</td>
                  <td className="px-4 py-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${o.status === "Cancelled" ? "bg-red-100 text-red-700" : o.status === "Refunded" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">₹{o.total}</td>
                  <td className="px-4 py-2">{o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleCancel(o); }}>Cancel</button>
                    <button className="bg-green-100 text-green-800 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleRefund(o); }}>Refund</button>
                    <button className="bg-red-100 text-red-800 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleDelete(o); }}>Delete</button>
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