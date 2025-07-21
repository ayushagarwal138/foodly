import React, { useState } from "react";

export default function CustomerSettings() {
  // Local state for settings (replace with real API integration)
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Settings</h2>
      <div className="flex flex-col gap-8">
        {/* Notification Preferences */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Notification Preferences</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={emailNotif} onChange={e => setEmailNotif(e.target.checked)} />
              <span>Email Notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={smsNotif} onChange={e => setSmsNotif(e.target.checked)} />
              <span>SMS Notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={pushNotif} onChange={e => setPushNotif(e.target.checked)} />
              <span>Push Notifications</span>
            </label>
          </div>
        </div>
        {/* Privacy Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Privacy</h3>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={profileVisible} onChange={e => setProfileVisible(e.target.checked)} />
            <span>Profile visible to restaurants</span>
          </label>
        </div>
        {/* Danger Zone */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">Danger Zone</h3>
          <button
            className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-red-600 transition"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </button>
          {showDeleteConfirm && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="mb-2 text-red-700 font-semibold">Are you sure you want to delete your account? This action cannot be undone.</div>
              <div className="flex gap-4">
                <button className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-red-700 transition text-xs" onClick={() => { setShowDeleteConfirm(false); alert('Account deleted (demo only)'); }}>Yes, Delete</button>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow hover:bg-gray-300 transition text-xs" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 