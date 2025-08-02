import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRestaurants = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.ADMIN_RESTAURANTS);
      console.log("Fetched restaurants:", data);
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError(err.message);
    }
  };

  const approveRestaurant = async (restaurant) => {
    try {
      const data = await api.post(API_ENDPOINTS.ADMIN_RESTAURANT_APPROVE(restaurant.id));
      console.log("Approved restaurant:", data);
      setRestaurants(prev => prev.map(r => 
        r.id === restaurant.id ? { ...r, isApproved: true } : r
      ));
    } catch (err) {
      console.error("Error approving restaurant:", err);
      setError(err.message);
    }
  };

  const deactivateRestaurant = async (restaurant) => {
    try {
      const data = await api.post(API_ENDPOINTS.ADMIN_RESTAURANT_DEACTIVATE(restaurant.id));
      console.log("Deactivated restaurant:", data);
      setRestaurants(prev => prev.map(r => 
        r.id === restaurant.id ? { ...r, isActive: false } : r
      ));
    } catch (err) {
      console.error("Error deactivating restaurant:", err);
      setError(err.message);
    }
  };

  const deleteRestaurant = async (restaurant) => {
    if (!window.confirm(`Are you sure you want to delete restaurant '${restaurant.name}'?`)) return;
    
    try {
      await api.delete(API_ENDPOINTS.ADMIN_RESTAURANT_DELETE(restaurant.id));
      console.log("Deleted restaurant:", restaurant.id);
      setRestaurants(prev => prev.filter(r => r.id !== restaurant.id));
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchRestaurants();
      setLoading(false);
    }
    initialFetch();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisineType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRestaurants = restaurants.length;
  const approvedRestaurants = restaurants.filter(r => r.isApproved).length;
  const pendingRestaurants = restaurants.filter(r => !r.isApproved).length;
  const activeRestaurants = restaurants.filter(r => r.isActive).length;

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Restaurant Management</h2>
      <p className="text-gray-600 mb-8">Manage restaurant registrations, approvals, and status</p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{totalRestaurants}</div>
          <div className="text-sm text-gray-600">Total Restaurants</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{approvedRestaurants}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{pendingRestaurants}</div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{activeRestaurants}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search restaurants by name, cuisine, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchRestaurants}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          <span className="text-sm text-gray-600">
            {filteredRestaurants.length} of {restaurants.length} restaurants
          </span>
        </div>
      </div>

      {/* Restaurants List */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No restaurants found.</div>
          <div className="text-sm text-gray-400">
            {searchTerm ? "Try adjusting your search terms." : "Restaurants will appear here once they register."}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#16213e]">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600">{restaurant.cuisineType}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {restaurant.isApproved ? "Approved" : "Pending"}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.isActive ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                  }`}>
                    {restaurant.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2 text-gray-800">{restaurant.address}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 text-gray-800">{restaurant.phone}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Owner:</span>
                  <span className="ml-2 text-gray-800">{restaurant.ownerName || restaurant.owner?.username}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Registered:</span>
                  <span className="ml-2 text-gray-800">
                    {new Date(restaurant.createdAt || restaurant.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-4">{restaurant.description}</p>
              
              <div className="flex gap-2">
                {!restaurant.isApproved && (
                  <button
                    onClick={() => approveRestaurant(restaurant)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                )}
                {restaurant.isActive && (
                  <button
                    onClick={() => deactivateRestaurant(restaurant)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Deactivate
                  </button>
                )}
                <button
                  onClick={() => deleteRestaurant(restaurant)}
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