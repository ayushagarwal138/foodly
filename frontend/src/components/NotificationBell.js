import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheckCircle, FiMessageCircle, FiPackage, FiRefreshCw } from "react-icons/fi";
import { api, API_ENDPOINTS } from "../config/api";

function formatNotificationTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function truncateMessage(message) {
  if (!message) return "New support message";
  return message.length > 86 ? `${message.slice(0, 83)}...` : message;
}

export default function NotificationBell({ audience = "customer" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.length;
  const isRestaurantAudience = audience === "restaurant";

  const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const data = await api.get(API_ENDPOINTS.SUPPORT_NOTIFICATIONS);
      const nextNotifications = Array.isArray(data?.notifications) ? data.notifications : [];
      setNotifications(nextNotifications);
      setError("");
    } catch (err) {
      console.error("Error fetching notifications:", err);
      if (!silent) setError(err.message || "Unable to load notifications");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("userId")) return;

    fetchNotifications({ silent: true });
    const interval = setInterval(() => {
      fetchNotifications({ silent: true });
    }, 10000);
    const refresh = () => fetchNotifications({ silent: true });
    window.addEventListener("foodlyNotificationsChanged", refresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("foodlyNotificationsChanged", refresh);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) fetchNotifications();
  };

  const openNotification = async (notification) => {
    setNotifications(previous => previous.filter(item => item.messageId !== notification.messageId));
    setOpen(false);

    try {
      await api.put(API_ENDPOINTS.SUPPORT_MARK_READ(notification.messageId), {});
      window.dispatchEvent(new CustomEvent("foodlyNotificationsChanged"));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }

    if (notification.targetPath) {
      navigate(notification.targetPath);
      return;
    }

    if (notification.orderId) {
      navigate(isRestaurantAudience
        ? `/restaurant/orders?orderId=${notification.orderId}`
        : `/customer/support?orderId=${notification.orderId}&restaurantId=${notification.restaurantId}`
      );
    }
  };

  const markAllRead = async () => {
    const pending = [...notifications];
    setNotifications([]);

    await Promise.allSettled(
      pending.map(notification => api.put(API_ENDPOINTS.SUPPORT_MARK_READ(notification.messageId), {}))
    );
    window.dispatchEvent(new CustomEvent("foodlyNotificationsChanged"));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="group relative rounded-md bg-neutral-100 p-2.5 text-neutral-900 transition-all duration-200 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        title="Notifications"
      >
        <FiBell className="h-6 w-6 transition-transform group-hover:scale-110" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-neutral-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-950">Notifications</h3>
              <p className="text-xs text-neutral-500">
                {unreadCount === 0 ? "No unread messages" : `${unreadCount} unread support ${unreadCount === 1 ? "message" : "messages"}`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => fetchNotifications()}
                aria-label="Refresh notifications"
                title="Refresh"
              >
                <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="rounded-md p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={markAllRead}
                  aria-label="Mark all notifications as read"
                  title="Mark all read"
                >
                  <FiCheckCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-neutral-500">Loading notifications...</div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-sm text-red-600">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <FiBell className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                <p className="text-sm font-medium text-neutral-700">All caught up</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {isRestaurantAudience ? "New customer messages will appear here." : "New restaurant replies will appear here."}
                </p>
              </div>
            ) : (
              notifications.map(notification => (
                <button
                  type="button"
                  key={notification.messageId}
                  className="flex w-full gap-3 border-b border-neutral-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
                  onClick={() => openNotification(notification)}
                >
                  <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                    <FiMessageCircle className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-neutral-950">
                        {isRestaurantAudience
                          ? notification.customerName || "Customer"
                          : notification.restaurantName || "Restaurant"}
                      </span>
                      <span className="flex-shrink-0 text-[11px] text-neutral-500">
                        {formatNotificationTime(notification.timestamp)}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-neutral-700">
                      {truncateMessage(notification.message)}
                    </span>
                    <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                      <FiPackage className="h-3.5 w-3.5" />
                      Order #{notification.orderId}
                      {notification.orderStatus ? ` - ${notification.orderStatus}` : ""}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
