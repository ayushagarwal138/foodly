import React from "react";

export default function ReviewDetailModal({ review, open, onClose, onRemove, onFlag }) {
  if (!open || !review) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative animate-fade-in">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-[#16213e]">Review Details</h2>
        <div className="mb-4">
          <div className="mb-2"><span className="font-semibold">ID:</span> {review.id}</div>
          <div className="mb-2"><span className="font-semibold">User ID:</span> {review.userId}</div>
          <div className="mb-2"><span className="font-semibold">Restaurant ID:</span> {review.restaurantId}</div>
          <div className="mb-2"><span className="font-semibold">Rating:</span> {review.rating}</div>
          <div className="mb-2"><span className="font-semibold">Text:</span> {review.text}</div>
          <div className="mb-2"><span className="font-semibold">Created At:</span> {review.createdAt ? new Date(review.createdAt).toLocaleString() : "-"}</div>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="bg-red-100 text-red-800 px-4 py-2 rounded" onClick={() => onRemove(review)}>Remove</button>
          <button className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded" onClick={() => onFlag(review)}>Flag</button>
        </div>
      </div>
    </div>
  );
} 