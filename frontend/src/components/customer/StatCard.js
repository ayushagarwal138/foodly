import React from "react";

export default function StatCard({ icon, label, value, sublabel, color = "primary" }) {
  return (
    <div className="card-hover flex flex-col items-center justify-center p-6 md:p-8 text-center group">
      <div className={`mb-4 p-3 rounded-xl bg-${color}-50 border-2 border-${color}-100 group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-extrabold text-dark-primary mb-2">{value}</div>
      <div className={`text-${color}-600 text-sm font-semibold mb-1`}>{label}</div>
      {sublabel && (
        <div className="text-xs text-neutral-500 mt-1">{sublabel}</div>
      )}
    </div>
  );
} 