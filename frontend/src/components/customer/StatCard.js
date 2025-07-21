import React from "react";

export default function StatCard({ icon, label, value, sublabel }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-7 min-w-[140px] border border-gray-100 hover:shadow-2xl transition">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-extrabold text-[#16213e]">{value}</div>
      <div className="text-gray-500 text-sm font-medium">{label}</div>
      {sublabel && <div className="text-xs text-gray-400 mt-1">{sublabel}</div>}
    </div>
  );
} 