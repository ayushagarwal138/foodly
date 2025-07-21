import React from "react";

export default function OrderDetailModal({ order, open, onClose, onCancel, onRefund, onDelete }) {
  if (!open || !order) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative animate-fade-in">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-[#16213e]">Order Details</h2>
        <div className="mb-4">
          <div className="mb-2"><span className="font-semibold">ID:</span> {order.id}</div>
          <div className="mb-2"><span className="font-semibold">User ID:</span> {order.userId}</div>
          <div className="mb-2"><span className="font-semibold">Restaurant ID:</span> {order.restaurantId}</div>
          <div className="mb-2"><span className="font-semibold">Status:</span> {order.status}</div>
          <div className="mb-2"><span className="font-semibold">Total:</span> ₹{order.total}</div>
          <div className="mb-2"><span className="font-semibold">Created At:</span> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</div>
          {order.items && Array.isArray(order.items) && order.items.length > 0 && (
            <div className="mb-2">
              <span className="font-semibold">Items:</span>
              <ul className="list-disc ml-6 mt-1">
                {order.items.map((item, idx) => (
                  <li key={idx}>{item.name || item.menuItemName || `Item ${item.menuItemId}`}: {item.qty || item.quantity || 1} × ₹{item.price}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded" onClick={() => onCancel(order)}>Cancel</button>
          <button className="bg-green-100 text-green-800 px-4 py-2 rounded" onClick={() => onRefund(order)}>Refund</button>
          <button className="bg-red-100 text-red-800 px-4 py-2 rounded" onClick={() => onDelete(order)}>Delete</button>
        </div>
      </div>
    </div>
  );
} 