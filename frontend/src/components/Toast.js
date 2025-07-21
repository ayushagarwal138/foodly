import React from "react";

export default function Toast({ message, type = "info", onClose }) {
  if (!message) return null;
  let bg = "bg-blue-500";
  if (type === "success") bg = "bg-green-500";
  if (type === "error") bg = "bg-red-500";
  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white ${bg} flex items-center animate-fade-in`}
         style={{ minWidth: 200 }}>
      <span className="flex-1">{message}</span>
      <button className="ml-4 text-white font-bold" onClick={onClose}>&times;</button>
    </div>
  );
} 