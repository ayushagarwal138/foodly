import React, { useEffect, useState } from "react";
import Toast from "../Toast";
import UserDetailModal from "./UserDetailModal";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleBlock(user) {
    if (!window.confirm(`Block user ${user.username}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}/block`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to block user");
      setToast({ message: `User ${user.username} blocked.`, type: "success" });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }
  async function handleUnblock(user) {
    if (!window.confirm(`Unblock user ${user.username}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}/unblock`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to unblock user");
      setToast({ message: `User ${user.username} unblocked.`, type: "success" });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }
  async function handleDelete(user) {
    if (!window.confirm(`Delete user ${user.username}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setToast({ message: `User ${user.username} deleted.`, type: "success" });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }

  function openModal(user) {
    setSelectedUser(user);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setSelectedUser(null);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">User Management</h2>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="text"
          placeholder="Search by username or email..."
          className="border rounded px-4 py-2 w-full md:w-80"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />}
      <UserDetailModal
        user={selectedUser}
        open={modalOpen}
        onClose={closeModal}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        onDelete={handleDelete}
      />
      {loading ? (
        <div className="p-10 text-center">Loading users...</div>
      ) : error ? (
        <div className="p-10 text-center text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-2xl shadow border border-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-blue-50 cursor-pointer transition"
                  onClick={e => {
                    // Only open modal if not clicking a button
                    if (e.target.tagName !== "BUTTON") openModal(user);
                  }}
                >
                  <td className="px-4 py-2">{user.id}</td>
                  <td className="px-4 py-2 font-semibold text-blue-900">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === "BLOCKED" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {user.role === "BLOCKED" ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    {user.role !== "BLOCKED" ? (
                      <button className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleBlock(user); }}>Block</button>
                    ) : (
                      <button className="bg-green-100 text-green-800 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleUnblock(user); }}>Unblock</button>
                    )}
                    <button className="bg-red-100 text-red-800 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); handleDelete(user); }}>Delete</button>
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