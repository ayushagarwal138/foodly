import React, { useEffect, useState } from "react";
import Toast from "../Toast";
import ReviewDetailModal from "./ReviewDetailModal";

function renderStars(rating) {
  return (
    <span className="text-yellow-500">
      {Array.from({ length: rating }, (_, i) => <span key={i}>★</span>)}
      {Array.from({ length: 5 - rating }, (_, i) => <span key={i} className="text-gray-300">★</span>)}
    </span>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  const fetchReviews = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(fetchReviews, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const filtered = reviews.filter(r =>
    (r.userId + "").includes(search) ||
    (r.restaurantId + "").includes(search) ||
    (r.text || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleRemove(r) {
    if (!window.confirm(`Remove review #${r.id}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/reviews/${r.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to remove review");
      setToast({ message: `Review #${r.id} removed.`, type: "success" });
      fetchReviews();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }
  async function handleFlag(r) {
    if (!window.confirm(`Flag review #${r.id}?`)) return;
    try {
      const res = await fetch(`/api/admin/reviews/${r.id}/flag`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to flag review");
      setToast({ message: `Review #${r.id} flagged.`, type: "success" });
      fetchReviews();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }

  function openModal(review) {
    setSelectedReview(review);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setSelectedReview(null);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Review Moderation</h2>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="text"
          placeholder="Search by user, restaurant, or text..."
          className="border rounded px-4 py-2 w-full md:w-80"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />}
      <ReviewDetailModal
        review={selectedReview}
        open={modalOpen}
        onClose={closeModal}
        onRemove={handleRemove}
        onFlag={handleFlag}
      />
      {loading ? (
        <div className="p-10 text-center">Loading reviews...</div>
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
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Text</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr
                  key={r.id}
                  className="border-b hover:bg-purple-50 cursor-pointer transition"
                  onClick={e => {
                    if (e.target.tagName !== "BUTTON") openModal(r);
                  }}
                >
                  <td className="px-4 py-2">{r.id}</td>
                  <td className="px-4 py-2 font-semibold text-purple-900">{r.userId}</td>
                  <td className="px-4 py-2">{r.restaurantId}</td>
                  <td className="px-4 py-2">{renderStars(r.rating)}</td>
                  <td className="px-4 py-2">{r.text}</td>
                  <td className="px-4 py-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="bg-red-100 text-red-800 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleRemove(r); }}>Remove</button>
                    <button className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleFlag(r); }}>Flag</button>
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