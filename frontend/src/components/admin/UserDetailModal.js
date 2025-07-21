import React from "react";

export default function UserDetailModal({ user, open, onClose, onBlock, onUnblock, onDelete }) {
  if (!open || !user) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative animate-fade-in">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-[#16213e]">User Details</h2>
        <div className="mb-4">
          <div className="mb-2"><span className="font-semibold">ID:</span> {user.id}</div>
          <div className="mb-2"><span className="font-semibold">Username:</span> {user.username}</div>
          <div className="mb-2"><span className="font-semibold">Email:</span> {user.email}</div>
          <div className="mb-2"><span className="font-semibold">Role:</span> {user.role}</div>
        </div>
        <div className="flex gap-3 mt-6">
          {user.role !== "BLOCKED" ? (
            <button className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded" onClick={() => onBlock(user)}>Block</button>
          ) : (
            <button className="bg-green-100 text-green-800 px-4 py-2 rounded" onClick={() => onUnblock(user)}>Unblock</button>
          )}
          <button className="bg-red-100 text-red-800 px-4 py-2 rounded" onClick={() => onDelete(user)}>Delete</button>
        </div>
      </div>
    </div>
  );
} 