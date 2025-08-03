import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOffers = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.ADMIN_OFFERS);
      console.log("Fetched offers:", data);
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError(err.message);
    }
  };

  const toggleOffer = async (offer) => {
    try {
      const data = await api.post(API_ENDPOINTS.OFFER_TOGGLE(offer.id));
      console.log("Toggled offer:", data);
      setOffers(prev => prev.map(o => 
        o.id === offer.id ? { ...o, isActive: !o.isActive } : o
      ));
    } catch (err) {
      console.error("Error toggling offer:", err);
      setError(err.message);
    }
  };

  const deleteOffer = async (offer) => {
    if (!window.confirm(`Are you sure you want to delete offer '${offer.title}'?`)) return;
    
    try {
      await api.delete(API_ENDPOINTS.OFFER_DELETE(offer.id));
      console.log("Deleted offer:", offer.id);
      setOffers(prev => prev.filter(o => o.id !== offer.id));
    } catch (err) {
      console.error("Error deleting offer:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchOffers();
      setLoading(false);
    }
    initialFetch();
  }, []);

  const filteredOffers = offers.filter(offer =>
    offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOffers = offers.length;
  const activeOffers = offers.filter(o => o.isActive).length;
  const inactiveOffers = offers.filter(o => !o.isActive).length;
  const restaurantOffers = offers.filter(o => o.restaurantId).length;

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#16213e]">Offer Management</h2>
          <p className="text-gray-600">Manage promotional offers and coupon codes</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Create New Offer
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{totalOffers}</div>
          <div className="text-sm text-gray-600">Total Offers</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{activeOffers}</div>
          <div className="text-sm text-gray-600">Active Offers</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{inactiveOffers}</div>
          <div className="text-sm text-gray-600">Inactive Offers</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{restaurantOffers}</div>
          <div className="text-sm text-gray-600">Restaurant Offers</div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search offers by title, code, or restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Types</option>
            <option>Platform Offers</option>
            <option>Restaurant Offers</option>
          </select>
          <button
            onClick={fetchOffers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          <span className="text-sm text-gray-600">
            {filteredOffers.length} of {offers.length} offers
          </span>
        </div>
      </div>

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No offers found.</div>
          <div className="text-sm text-gray-400">
            {searchTerm ? "Try adjusting your search terms." : "Offers will appear here once they are created."}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => (
            <div key={offer.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#16213e]">{offer.title}</h3>
                  <p className="text-sm text-gray-600">{offer.restaurantName || "Platform Offer"}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  offer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {offer.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Code</div>
                  <div className="font-mono font-semibold text-lg text-[#16213e]">{offer.code}</div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-[#16213e]">{offer.discountPercentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Min Order:</span>
                  <span className="font-semibold text-[#16213e]">₹{offer.minOrderAmount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Discount:</span>
                  <span className="font-semibold text-[#16213e]">₹{offer.maxDiscountAmount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="font-semibold text-[#16213e]">
                    {new Date(offer.validUntil || offer.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-4">{offer.description}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => toggleOffer(offer)}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    offer.isActive
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {offer.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => deleteOffer(offer)}
                  className="px-3 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 