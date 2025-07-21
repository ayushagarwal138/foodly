import React, { useState, useEffect } from "react";

export default function CustomerProfile() {
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showAddressSection, setShowAddressSection] = useState(false);
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  // Address management state
  const [addresses, setAddresses] = useState([
    "123 Main St, Springfield",
    "456 Oak Ave, Metropolis"
  ]);
  const [newAddress, setNewAddress] = useState("");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/customers/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUsername(data.username);
        setEmail(data.email);
        setTempUsername(data.username);
        setTempEmail(data.email);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (userId && token) fetchProfile();
  }, [userId, token]);

  const handleEdit = () => {
    setTempUsername(username);
    setTempEmail(email);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: tempUsername,
          email: tempEmail
        })
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setUsername(tempUsername);
      setEmail(tempEmail);
      localStorage.setItem("username", tempUsername);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Password change logic (local only)
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordMsg("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("New passwords do not match.");
      return;
    }
    // Simulate password change
    setPasswordMsg("Password changed successfully (demo only)");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Address management logic (local only)
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    setAddresses([...addresses, newAddress.trim()]);
    setNewAddress("");
  };
  const handleRemoveAddress = (idx) => {
    setAddresses(addresses.filter((_, i) => i !== idx));
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">My Profile</h2>
      <div className="flex flex-col gap-6">
        {/* Basic Info */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">Username</label>
          {editMode ? (
            <input
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={tempUsername}
              onChange={e => setTempUsername(e.target.value)}
            />
          ) : (
            <div className="text-lg font-semibold text-[#16213e]">{username}</div>
          )}
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Email</label>
          {editMode ? (
            <input
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={tempEmail}
              onChange={e => setTempEmail(e.target.value)}
            />
          ) : (
            <div className="text-lg font-semibold text-[#16213e]">{email}</div>
          )}
        </div>
        <div className="flex gap-4 mt-4">
          {editMode ? (
            <>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition"
                onClick={handleSave}
                disabled={loading}
              >
                Save
              </button>
              <button
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold shadow hover:bg-gray-300 transition"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-orange-600 transition"
              onClick={handleEdit}
            >
              Edit Profile
            </button>
          )}
        </div>
        {/* Password Change Section */}
        <div className="mt-8">
          <button
            className="text-blue-600 font-semibold hover:underline text-sm mb-2"
            onClick={() => setShowPasswordSection(v => !v)}
          >
            {showPasswordSection ? "Hide" : "Change Password"}
          </button>
          {showPasswordSection && (
            <form className="flex flex-col gap-3 mt-2" onSubmit={handlePasswordChange}>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition mt-2" type="submit">
                Change Password
              </button>
              {passwordMsg && <div className={`text-sm mt-1 ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{passwordMsg}</div>}
            </form>
          )}
        </div>
        {/* Address Management Section */}
        <div className="mt-8">
          <button
            className="text-blue-600 font-semibold hover:underline text-sm mb-2"
            onClick={() => setShowAddressSection(v => !v)}
          >
            {showAddressSection ? "Hide" : "Manage Addresses"}
          </button>
          {showAddressSection && (
            <div className="flex flex-col gap-3 mt-2">
              <ul className="mb-2">
                {addresses.map((addr, idx) => (
                  <li key={idx} className="flex items-center gap-2 mb-1">
                    <span className="flex-1 text-gray-700">{addr}</span>
                    <button className="text-red-500 text-xs hover:underline" onClick={() => handleRemoveAddress(idx)}>Remove</button>
                  </li>
                ))}
              </ul>
              <form className="flex gap-2" onSubmit={handleAddAddress}>
                <input
                  className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Add new address"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                />
                <button className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-orange-600 transition text-xs" type="submit">
                  Add
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 