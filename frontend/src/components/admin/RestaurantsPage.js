import React, { useEffect, useState } from "react";
import Toast from "../Toast";
import RestaurantDetailModal from "./RestaurantDetailModal";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  const fetchRestaurants = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/restaurants", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    const interval = setInterval(fetchRestaurants, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.owner?.username || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleApprove(r) {
    if (!window.confirm(`Approve restaurant ${r.name}?`)) return;
    try {
      const res = await fetch(`/api/admin/restaurants/${r.id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to approve restaurant");
      setToast({ message: `Restaurant ${r.name} approved.`, type: "success" });
      fetchRestaurants();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }
  async function handleDeactivate(r) {
    if (!window.confirm(`Deactivate restaurant ${r.name}?`)) return;
    try {
      const res = await fetch(`/api/admin/restaurants/${r.id}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to deactivate restaurant");
      setToast({ message: `Restaurant ${r.name} deactivated.`, type: "success" });
      fetchRestaurants();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }
  async function handleDelete(r) {
    if (!window.confirm(`Delete restaurant ${r.name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/restaurants/${r.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete restaurant");
      setToast({ message: `Restaurant ${r.name} deleted.`, type: "success" });
      fetchRestaurants();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }

  function openModal(restaurant) {
    setSelectedRestaurant(restaurant);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setSelectedRestaurant(null);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Restaurant Management</h2>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or owner..."
          className="border rounded px-4 py-2 w-full md:w-80"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />}
      <RestaurantDetailModal
        restaurant={selectedRestaurant}
        open={modalOpen}
        onClose={closeModal}
        onApprove={handleApprove}
        onDeactivate={handleDeactivate}
        onDelete={handleDelete}
      />
      {loading ? (
        <div className="p-10 text-center">Loading restaurants...</div>
      ) : error ? (
        <div className="p-10 text-center text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-2xl shadow border border-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr
                  key={r.id}
                  className="border-b hover:bg-green-50 cursor-pointer transition"
                  onClick={e => {
                    if (e.target.tagName !== "BUTTON") openModal(r);
                  }}
                >
                  <td className="px-4 py-2">{r.id}</td>
                  <td className="px-4 py-2 font-semibold text-green-900">{r.name}</td>
                  <td className="px-4 py-2">{r.owner?.username || "-"}</td>
                  <td className="px-4 py-2">{r.owner?.email || "-"}</td>
                  <td className="px-4 py-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    {r.isActive ? (
                      <button className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleDeactivate(r); }}>Deactivate</button>
                    ) : (
                      <button className="bg-green-100 text-green-800 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleApprove(r); }}>Approve</button>
                    )}
                    <button className="bg-red-100 text-red-800 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleDelete(r); }}>Delete</button>
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