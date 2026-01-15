import React from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

export default function Toast({ message, type = "info", onClose }) {
  if (!message) return null;

  const config = {
    success: {
      bg: "bg-accent-500",
      icon: FiCheckCircle,
      border: "border-accent-600",
    },
    error: {
      bg: "bg-red-500",
      icon: FiAlertCircle,
      border: "border-red-600",
    },
    info: {
      bg: "bg-secondary-500",
      icon: FiInfo,
      border: "border-secondary-600",
    },
  };

  const { bg, icon: Icon, border } = config[type] || config.info;

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-xl shadow-large text-white ${bg} border-2 ${border} flex items-center gap-3 animate-slide-in-right min-w-[280px] max-w-md`}
      role="alert"
      aria-live="assertive"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        className="ml-2 text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1"
        onClick={onClose}
        aria-label="Close notification"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
} 