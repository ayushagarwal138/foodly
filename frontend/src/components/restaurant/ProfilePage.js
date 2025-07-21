import React, { useState, useEffect } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          cuisine: data.cuisineType || data.cuisine || "",
          openingHours: data.openingHours || "",
          ownerName: data.owner?.username || data.owner?.name || "",
          ownerEmail: data.owner?.email || ""
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (restaurantId && token) fetchProfile();
  }, [restaurantId, token]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Send restaurant info update
      const res = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          cuisine: form.cuisine,
          openingHours: form.openingHours,
          owner: {
            username: form.ownerName,
            email: form.ownerEmail
          }
        })
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setProfile(updated);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Profile / Settings</h2>
      {!profile ? (
        <div className="text-gray-500 text-center">No profile information available.</div>
      ) : editMode ? (
        <form className="flex flex-col gap-6" onSubmit={handleSave}>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Restaurant Name</label>
            <input className="w-full px-4 py-2 border rounded-xl" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Email</label>
            <input className="w-full px-4 py-2 border rounded-xl" name="email" value={form.email} onChange={handleChange} required type="email" />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Phone</label>
            <input className="w-full px-4 py-2 border rounded-xl" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Address</label>
            <input className="w-full px-4 py-2 border rounded-xl" name="address" value={form.address} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Cuisine</label>
            <input className="w-full px-4 py-2 border rounded-xl" name="cuisine" value={form.cuisine} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Opening Hours</label>
            <input className="w-full px-4 py-2 border rounded-xl" name="openingHours" value={form.openingHours} onChange={handleChange} required />
          </div>
          {/* Owner Details */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-bold mb-4 text-[#16213e]">Owner Details</h3>
            <div className="flex flex-col gap-2">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Owner Name</label>
                <input className="w-full px-4 py-2 border rounded-xl" name="ownerName" value={form.ownerName} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Owner Email</label>
                <input className="w-full px-4 py-2 border rounded-xl" name="ownerEmail" value={form.ownerEmail} onChange={handleChange} required type="email" />
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow hover:bg-blue-700 transition-all duration-200 text-lg" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full font-bold shadow hover:bg-gray-300 transition-all duration-200 text-lg" type="button" onClick={() => setEditMode(false)} disabled={saving}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Restaurant Name</label>
            <div className="text-lg font-semibold text-[#16213e]">{profile.name}</div>
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Email</label>
            <div className="text-lg font-semibold text-[#16213e]">{profile.email}</div>
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Phone</label>
            <div className="text-lg font-semibold text-[#16213e]">{profile.phone}</div>
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Address</label>
            <div className="text-lg font-semibold text-[#16213e]">{profile.address}</div>
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Cuisine</label>
            <div className="text-lg font-semibold text-[#16213e]">{profile.cuisineType || profile.cuisine}</div>
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Opening Hours</label>
            <div className="text-lg font-semibold text-[#16213e]">{profile.openingHours}</div>
          </div>
          {/* Owner Details */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-bold mb-4 text-[#16213e]">Owner Details</h3>
            {profile.owner ? (
              <div className="flex flex-col gap-2">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Owner Name</label>
                  <div className="text-lg font-semibold text-[#16213e]">{profile.owner.username || profile.owner.name}</div>
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Owner Email</label>
                  <div className="text-lg font-semibold text-[#16213e]">{profile.owner.email}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No owner information available.</div>
            )}
          </div>
          <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow hover:bg-blue-700 transition-all duration-200 text-lg w-40" onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
} 