import React from "react";

export default function RestaurantDetailModal({ restaurant, open, onClose, onApprove, onDeactivate, onDelete }) {
  if (!open || !restaurant) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative animate-fade-in">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-[#16213e]">Restaurant Details</h2>
        <div className="mb-4">
          <div className="mb-2"><span className="font-semibold">ID:</span> {restaurant.id}</div>
          <div className="mb-2"><span className="font-semibold">Name:</span> {restaurant.name}</div>
          <div className="mb-2"><span className="font-semibold">Owner:</span> {restaurant.owner?.username || "-"}</div>
          <div className="mb-2"><span className="font-semibold">Email:</span> {restaurant.owner?.email || "-"}</div>
          <div className="mb-2"><span className="font-semibold">Status:</span> {restaurant.isActive ? "Active" : "Inactive"}</div>
          <div className="mb-2"><span className="font-semibold">Address:</span> {restaurant.address}</div>
          <div className="mb-2"><span className="font-semibold">Phone:</span> {restaurant.phone}</div>
          <div className="mb-2"><span className="font-semibold">Cuisine:</span> {restaurant.cuisineType}</div>
          <div className="mb-2"><span className="font-semibold">Description:</span> {restaurant.description}</div>
          <div className="mb-2"><span className="font-semibold">Opening Hours:</span> {restaurant.openingHours}</div>
        </div>
        <div className="flex gap-3 mt-6">
          {restaurant.isActive ? (
            <button className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded" onClick={() => onDeactivate(restaurant)}>Deactivate</button>
          ) : (
            <button className="bg-green-100 text-green-800 px-4 py-2 rounded" onClick={() => onApprove(restaurant)}>Approve</button>
          )}
          <button className="bg-red-100 text-red-800 px-4 py-2 rounded" onClick={() => onDelete(restaurant)}>Delete</button>
        </div>
      </div>
    </div>
  );
} 