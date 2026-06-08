import React, { useState } from "react";
import { FiBell, FiEye, FiMail, FiMessageSquare, FiTrash2, FiX } from "react-icons/fi";

function ToggleRow({ icon: Icon, title, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-neutral-200 bg-white p-4 transition-colors hover:bg-neutral-50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-neutral-900">{title}</p>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${checked ? "bg-primary-600" : "bg-neutral-300"}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </span>
    </label>
  );
}

export default function CustomerSettings() {
  // Local state for settings (replace with real API integration)
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  return (
    <div className="app-page-narrow">
      <div className="mb-6">
        <h2 className="section-title">Settings</h2>
        <p className="section-subtitle">Control notifications, privacy, and account-level actions.</p>
      </div>
      <div className="flex flex-col gap-6">
        {/* Notification Preferences */}
        <section className="surface-panel">
          <h3 className="mb-4 text-lg font-semibold text-neutral-950">Notification Preferences</h3>
          <div className="flex flex-col gap-3">
            <ToggleRow
              icon={FiMail}
              title="Email Notifications"
              description="Receive receipts, order updates, and offer summaries."
              checked={emailNotif}
              onChange={setEmailNotif}
            />
            <ToggleRow
              icon={FiMessageSquare}
              title="SMS Notifications"
              description="Get urgent order updates by text message."
              checked={smsNotif}
              onChange={setSmsNotif}
            />
            <ToggleRow
              icon={FiBell}
              title="Push Notifications"
              description="Allow app-style alerts for live order changes."
              checked={pushNotif}
              onChange={setPushNotif}
            />
          </div>
        </section>
        {/* Privacy Settings */}
        <section className="surface-panel">
          <h3 className="mb-4 text-lg font-semibold text-neutral-950">Privacy</h3>
          <ToggleRow
            icon={FiEye}
            title="Profile visible to restaurants"
            description="Let restaurants see the basic profile details needed to fulfil orders."
            checked={profileVisible}
            onChange={setProfileVisible}
          />
        </section>
        {/* Danger Zone */}
        <section className="surface-panel border-red-200 bg-red-50/40">
          <h3 className="mb-2 text-lg font-semibold text-red-700">Danger Zone</h3>
          <p className="mb-4 text-sm text-red-700/80">Account deletion is destructive and cannot be undone.</p>
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <FiTrash2 className="h-4 w-4" />
            Delete Account
          </button>
          {showDeleteConfirm && (
            <div className="mt-4 rounded-md border border-red-200 bg-white p-4">
              <div className="mb-3 font-semibold text-red-700">Are you sure you want to delete your account?</div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="btn btn-danger text-xs" onClick={() => { setShowDeleteConfirm(false); alert('Account deleted (demo only)'); }}>
                  <FiTrash2 className="h-4 w-4" />
                  Yes, Delete
                </button>
                <button className="btn btn-secondary text-xs" onClick={() => setShowDeleteConfirm(false)}>
                  <FiX className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 
