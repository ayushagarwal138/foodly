import React, { useState, useEffect } from "react";
import Toast from "../Toast";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState({ message: "", type: "info" });
  // These will be used when implementing the offer creation/editing modal
  // const [selectedOffer, setSelectedOffer] = useState(null);
  // const [modalOpen, setModalOpen] = useState(false);
  // const [isCreating, setIsCreating] = useState(false);
  const token = localStorage.getItem("token");

  const fetchOffers = async () => {
    setError("");
    try {
      const res = await fetch("/api/offers/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch offers");
      const data = await res.json();
      setOffers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(search.toLowerCase()) ||
                         offer.code.toLowerCase().includes(search.toLowerCase()) ||
                         offer.restaurant.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || offer.type === filter;
    return matchesSearch && matchesFilter;
  });

  async function handleToggleStatus(offer) {
    try {
      const res = await fetch(`/api/offers/${offer.id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to toggle offer status");
      setToast({ message: `Offer ${offer.isActive ? 'deactivated' : 'activated'} successfully.`, type: "success" });
      fetchOffers();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }

  async function handleDelete(offer) {
    if (!window.confirm(`Delete offer "${offer.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete offer");
      setToast({ message: `Offer "${offer.title}" deleted successfully.`, type: "success" });
      fetchOffers();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }

  function openModal(offer = null) {
    // TODO: Implement offer creation/editing modal
    console.log("Opening modal for offer:", offer);
  }

  // function closeModal() {
  //   setModalOpen(false);
  //   setSelectedOffer(null);
  //   setIsCreating(false);
  // }

  const getStatusBadge = (offer) => {
    const now = new Date();
    const validUntil = new Date(offer.validUntil);
    const isExpired = validUntil < now;
    
    if (!offer.isActive) {
      return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">Inactive</span>;
    }
    if (isExpired) {
      return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">Expired</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 rounded-full">Active</span>;
  };

  const getTypeBadge = (type) => {
    const colors = {
      'discount': 'bg-blue-100 text-blue-600',
      'free-delivery': 'bg-green-100 text-green-600',
      'cashback': 'bg-orange-100 text-orange-600',
      'combo': 'bg-purple-100 text-purple-600',
      'free-item': 'bg-pink-100 text-pink-600'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[type] || 'bg-gray-100 text-gray-600'}`}>
        {type.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 shadow">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Offer Management</h2>
          <p className="text-gray-600">Manage promotional offers and coupon codes</p>
        </div>
        <button
          onClick={() => openModal()}
          className="mt-4 lg:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create New Offer
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search offers by title, code, or restaurant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="discount">Discount</option>
              <option value="free-delivery">Free Delivery</option>
              <option value="cashback">Cashback</option>
              <option value="combo">Combo</option>
              <option value="free-item">Free Item</option>
            </select>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : filteredOffers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No offers found</h3>
            <p className="text-gray-600 mb-6">Create your first promotional offer to get started!</p>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Offer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffers.map(offer => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                        <div className="text-sm text-gray-500">{offer.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{offer.code}</code>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(offer.type)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{offer.restaurant}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(offer)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(offer.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(offer)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(offer)}
                          className={`p-1 ${offer.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                          title={offer.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(offer)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {/* Toast */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "info" })}
        />
      )}
    </div>
  );
} 