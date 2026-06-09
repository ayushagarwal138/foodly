import React from "react";

export default function StatCard({ icon, label, value, sublabel, color = "primary", onClick, actionLabel }) {
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
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={actionLabel || (onClick ? `Open ${label}` : undefined)}
      className={`card-hover group flex min-h-[160px] flex-col justify-center p-5 text-left transition-all md:p-6 ${
        onClick ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.99]" : ""
      }`}
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-md ring-1 transition-transform duration-200 group-hover:scale-105 ${active.tile}`}>
        {icon}
      </div>
      <div className="mb-1 text-2xl font-extrabold text-neutral-950 md:text-3xl">{value}</div>
      <div className={`mb-1 text-sm font-semibold ${active.label}`}>{label}</div>
      {sublabel && (
        <div className="mt-1 text-xs text-neutral-500">{sublabel}</div>
      )}
    </Component>
  );
} 
