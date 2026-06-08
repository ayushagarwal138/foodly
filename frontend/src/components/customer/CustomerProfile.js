import React, { useState, useEffect } from "react";
import { FiEdit2, FiMail, FiMapPin, FiPhone, FiSave, FiUser, FiX } from "react-icons/fi";
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

  if (loading) return <div className="app-page-narrow surface-panel text-center">Loading...</div>;
  if (error) return <div className="app-page-narrow surface-panel text-center text-red-600">{error}</div>;

  return (
    <div className="app-page-narrow">
      <div className="surface-panel mb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100">
              <FiUser className="h-6 w-6" />
            </div>
            <div>
              <h2 className="section-title">My Profile</h2>
              <p className="section-subtitle">Manage your contact and delivery information.</p>
            </div>
          </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-secondary w-full sm:w-auto"
        >
          {isEditing ? <FiX className="h-4 w-4" /> : <FiEdit2 className="h-4 w-4" />}
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
        </div>
      </div>

      <div className="surface-panel space-y-5">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
            <FiUser className="h-4 w-4 text-neutral-400" />
            Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              className="input"
            />
          ) : (
            <p className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900">{profile.name || "Not added"}</p>
          )}
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
            <FiMail className="h-4 w-4 text-neutral-400" />
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              className="input"
            />
          ) : (
            <p className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900">{profile.email || "Not added"}</p>
          )}
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
            <FiPhone className="h-4 w-4 text-neutral-400" />
            Phone
          </label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              className="input"
            />
          ) : (
            <p className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900">{profile.phone || "Not added"}</p>
          )}
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
            <FiMapPin className="h-4 w-4 text-neutral-400" />
            Address
          </label>
          {isEditing ? (
            <textarea
              name="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              rows={3}
              className="input resize-none"
            />
          ) : (
            <p className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900">{profile.address || "Not added"}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row">
            <button
              onClick={updateProfile}
              className="btn btn-primary"
            >
              <FiSave className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(profile);
              }}
              className="btn btn-secondary"
            >
              <FiX className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
