import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.ADMIN_USERS);
      console.log("Fetched users:", data);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    }
  };

  const blockUser = async (user) => {
    try {
      const data = await api.post(API_ENDPOINTS.ADMIN_USER_BLOCK(user.id));
      console.log("Blocked user:", data);
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, isBlocked: true } : u
      ));
    } catch (err) {
      console.error("Error blocking user:", err);
      setError(err.message);
    }
  };

  const unblockUser = async (user) => {
    try {
      const data = await api.post(API_ENDPOINTS.ADMIN_USER_UNBLOCK(user.id));
      console.log("Unblocked user:", data);
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, isBlocked: false } : u
      ));
    } catch (err) {
      console.error("Error unblocking user:", err);
      setError(err.message);
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user '${user.username}'?`)) return;
    
    try {
      await api.delete(API_ENDPOINTS.ADMIN_USER_DELETE(user.id));
      console.log("Deleted user:", user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    }
    initialFetch();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.isBlocked).length;
  const blockedUsers = users.filter(u => u.isBlocked).length;
  const adminUsers = users.filter(u => u.role === 'ADMIN').length;

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">User Management</h2>
      <p className="text-gray-600 mb-8">Manage platform users, their roles, and account status</p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="text-2xl font-bold text-red-600">{blockedUsers}</div>
          <div className="text-sm text-gray-600">Blocked Users</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{adminUsers}</div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          <span className="text-sm text-gray-600">
            {filteredUsers.length} of {users.length} users
          </span>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No users found.</div>
          <div className="text-sm text-gray-400">
            {searchTerm ? "Try adjusting your search terms." : "Users will appear here once they register."}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 font-semibold border-b">
                <th className="pb-3 px-4">User</th>
                <th className="pb-3 px-4">Email</th>
                <th className="pb-3 px-4">Role</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Joined</th>
                <th className="pb-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-600">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-[#16213e]">{user.username}</div>
                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'RESTAURANT' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(user.createdAt || user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {user.isBlocked ? (
                        <button
                          onClick={() => unblockUser(user)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => blockUser(user)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                        >
                          Block
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user)}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                      >
                        Delete
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
  );
} 