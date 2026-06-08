import React from "react";

export default function StatCard({ icon, label, value, sublabel, color = "primary" }) {
  const styles = {
    primary: {
      tile: "bg-primary-50 text-primary-600 ring-primary-100",
      label: "text-primary-600"
    },
    secondary: {
      tile: "bg-secondary-50 text-secondary-600 ring-secondary-100",
      label: "text-secondary-600"
    },
    accent: {
      tile: "bg-accent-50 text-accent-600 ring-accent-100",
      label: "text-accent-600"
    }
  };
  const active = styles[color] || styles.primary;

  return (
    <div className="card-hover group flex flex-col justify-center p-5 md:p-6">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-md ring-1 transition-transform duration-200 group-hover:scale-105 ${active.tile}`}>
        {icon}
      </div>
      <div className="mb-1 text-2xl font-extrabold text-neutral-950 md:text-3xl">{value}</div>
      <div className={`mb-1 text-sm font-semibold ${active.label}`}>{label}</div>
      {sublabel && (
        <div className="mt-1 text-xs text-neutral-500">{sublabel}</div>
      )}
    </div>
  );
} 
