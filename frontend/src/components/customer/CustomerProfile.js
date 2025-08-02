import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function CustomerProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    preferences: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const userId = localStorage.getItem("userId");

  const fetchProfile = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.CUSTOMER_PROFILE(userId));
      console.log("Fetched profile:", data);
      setProfile(data);
      setFormData(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message);
    }
  };

  const updateProfile = async () => {
    try {
      const data = await api.put(API_ENDPOINTS.CUSTOMER_PROFILE(userId), formData);
      setProfile(data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    }
    if (userId) {
      initialFetch();
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#16213e]">My Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          {isEditing ? (
            <textarea
              name="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.address}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-4">
            <button
              onClick={updateProfile}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(profile);
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 