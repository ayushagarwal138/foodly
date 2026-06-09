import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPackage, FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiTruck, FiMessageCircle, FiStar, FiEye, FiDollarSign, FiAlertCircle, FiChevronRight } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";
import ReviewModal from "./ReviewModal";
import Button from "../ui/Button";
import { api, API_ENDPOINTS } from "../../config/api";
import { keepPreviousIfSame } from "../../utils/state";

const ACTIVE_STATUSES = new Set(["New", "Accepted", "Preparing", "Out for Delivery"]);

const STATUS_PRIORITY = {
  "New": 0,
  "Accepted": 1,
  "Preparing": 2,
  "Out for Delivery": 3,
  "Delivered": 4,
  "Cancelled": 5,
  "Refunded": 6
};

const STATUS_CONFIG = {
  "New": { icon: FiClock, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Accepted": { icon: FiCheckCircle, bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  "Preparing": { icon: FiPackage, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Out for Delivery": { icon: FiTruck, bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  "Delivered": { icon: FiCheckCircle, bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  "Cancelled": { icon: FiXCircle, bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "Refunded": { icon: FiDollarSign, bg: "bg-neutral-100", text: "text-neutral-700", border: "border-neutral-300" }
};

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `₹${amount.toFixed(2)}`;
}

function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

function orderItemSummary(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "Items unavailable";
  const quantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const names = items
    .map(item => item.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");
  const extra = items.length > 2 ? ` +${items.length - 2} more` : "";
  const count = quantity > 0 ? quantity : items.length;
  return `${count} ${count === 1 ? "item" : "items"}${names ? ` - ${names}${extra}` : ""}`;
}

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewOrder, setReviewOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const location = useLocation();
  const navigate = useNavigate();
  const focusedOrderId = new URLSearchParams(location.search).get("orderId");

  const fetchOrders = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setError("");
    try {
      const data = await api.get(API_ENDPOINTS.MY_ORDERS);
      console.log("Fetched orders:", data);
      const nextOrders = Array.isArray(data) ? data : [];
      setOrders(previous => keepPreviousIfSame(previous, nextOrders));
      if (!silent) setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (!silent) setError(err.message);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    }
    if (localStorage.getItem("userId")) {
      initialFetch();
    }
  }, [fetchOrders]);

  // Polling for new orders
  useEffect(() => {
    if (!localStorage.getItem("userId")) return;

    const pollInterval = setInterval(() => {
      fetchOrders({ silent: true });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [fetchOrders]);

  // Check for newly delivered orders that need reviews
  useEffect(() => {
    const justDelivered = orders.find(o => 
      o.status === "Delivered" && 
      !localStorage.getItem(`reviewed_order_${o.id}`)
    );
    if (justDelivered) {
      console.log("Found delivered order for review:", justDelivered);
      setReviewOrder(justDelivered);
    }
  }, [orders]);

  const handleReviewClose = async (orderId) => {
    localStorage.setItem(`reviewed_order_${orderId}`, 'true');
    setReviewOrder(null);
    // Refresh orders to get latest status
    await fetchOrders();
  };

  const orderStats = useMemo(() => {
    const active = orders.filter(order => ACTIVE_STATUSES.has(order.status)).length;
    const delivered = orders.filter(order => order.status === "Delivered").length;
    return {
      all: orders.length,
      active,
      delivered,
      totalSpent: orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
    };
  }, [orders]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const statusDiff = (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99);
      if (statusDiff !== 0) return statusDiff;

      const dateA = new Date(a.date || a.createdAt);
      const dateB = new Date(b.date || b.createdAt);
      return dateB - dateA;
    });
  }, [orders]);

  const visibleOrders = useMemo(() => {
    if (statusFilter === "active") {
      return sortedOrders.filter(order => ACTIVE_STATUSES.has(order.status));
    }
    if (statusFilter === "delivered") {
      return sortedOrders.filter(order => order.status === "Delivered");
    }
    return sortedOrders;
  }, [sortedOrders, statusFilter]);

  useEffect(() => {
    if (!focusedOrderId || loading || visibleOrders.length === 0) return;
    const target = document.getElementById(`customer-order-${focusedOrderId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusedOrderId, loading, visibleOrders.length]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="card text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            <p className="text-neutral-600 font-medium">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="card border-2 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-700">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary-100 bg-primary-50 text-primary-700">
            <FiPackage className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dark-primary md:text-3xl">My Orders</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Track current orders and review your order history.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-md border border-neutral-200 bg-white p-2 shadow-sm">
          <div className="min-w-[5.5rem] px-3 py-2">
            <div className="text-xs font-medium text-neutral-500">Total</div>
            <div className="text-lg font-bold text-neutral-950">{orderStats.all}</div>
          </div>
          <div className="min-w-[5.5rem] border-x border-neutral-200 px-3 py-2">
            <div className="text-xs font-medium text-neutral-500">Active</div>
            <div className="text-lg font-bold text-primary-700">{orderStats.active}</div>
          </div>
          <div className="min-w-[5.5rem] px-3 py-2">
            <div className="text-xs font-medium text-neutral-500">Spent</div>
            <div className="text-lg font-bold text-neutral-950">{formatCurrency(orderStats.totalSpent)}</div>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[
          { value: "all", label: "All", count: orderStats.all },
          { value: "active", label: "Active", count: orderStats.active },
          { value: "delivered", label: "Delivered", count: orderStats.delivered }
        ].map(filter => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={`inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              statusFilter === filter.value
                ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-primary-200 hover:bg-primary-50"
            }`}
          >
            {filter.label}
            <span className={`rounded px-1.5 py-0.5 text-xs ${
              statusFilter === filter.value ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {sortedOrders.length === 0 ? (
        <div className="rounded-md border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-md bg-neutral-100">
            <FiPackage className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-neutral-800">No orders yet</h3>
          <p className="mb-6 text-neutral-500">Start ordering from your favorite restaurants.</p>
          <Button variant="primary" onClick={() => navigate('/customer/restaurants')}>
            Browse Restaurants
          </Button>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="rounded-md border border-neutral-200 bg-white px-6 py-12 text-center shadow-sm">
          <FiPackage className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
          <h3 className="text-lg font-semibold text-neutral-800">No {statusFilter} orders</h3>
          <p className="mt-1 text-sm text-neutral-500">Try another filter to see more orders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((o) => {
            const restId = o.restaurantId || o.restaurant_id;
            const statusConfig = STATUS_CONFIG[o.status] || STATUS_CONFIG.New;
            const StatusIcon = statusConfig.icon;
            const isFocusedOrder = focusedOrderId && Number(focusedOrderId) === Number(o.id);
            const restaurantName = o.restaurant || o.restaurantName || "Restaurant";
            const canChat = o.id && restId && o.status !== "Delivered" && o.status !== "Cancelled" && o.status !== "Refunded";

            return (
              <article
                key={o.id}
                id={`customer-order-${o.id}`}
                className={`rounded-md border bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md md:p-5 ${
                  isFocusedOrder
                    ? "border-primary-400 ring-4 ring-primary-100"
                    : "border-neutral-200"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Order #{o.id}</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {o.status}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] md:items-center">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-neutral-950">{restaurantName}</h2>
                        <p className="mt-1 truncate text-sm text-neutral-500">{orderItemSummary(o.items)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-neutral-600 sm:flex sm:flex-wrap sm:items-center">
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <FiCalendar className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                          <span className="truncate">{formatOrderDate(o.date || o.createdAt)}</span>
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <FaUtensils className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                          <span className="truncate">Food order</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 md:justify-end">
                        <span className="text-xs font-medium text-neutral-500">Total</span>
                        <span className="text-lg font-bold text-neutral-950">{formatCurrency(o.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(`/customer/track?id=${o.id}`)}
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <FiEye className="h-4 w-4" />
                      Track
                    </button>
                    {canChat && (
                      <button
                        type="button"
                        onClick={() => navigate(`/customer/support?orderId=${o.id}&restaurantId=${restId}`)}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <FiMessageCircle className="h-4 w-4" />
                        Chat
                      </button>
                    )}
                    {o.status === "Delivered" && !localStorage.getItem(`reviewed_order_${o.id}`) && (
                      <button
                        type="button"
                        onClick={() => setReviewOrder(o)}
                        className="inline-flex h-10 items-center gap-2 rounded-md bg-primary-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <FiStar className="h-4 w-4" />
                        Review
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate(`/customer/track?id=${o.id}`)}
                      className="hidden h-10 w-10 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:inline-flex"
                      aria-label={`Open order ${o.id}`}
                    >
                      <FiChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {reviewOrder && (
        <ReviewModal
          isOpen={true}
          onClose={() => handleReviewClose(reviewOrder.id)}
          orderId={reviewOrder.id}
          restaurantId={reviewOrder.restaurantId || reviewOrder.restaurant_id}
          items={reviewOrder.items || []}
        />
      )}
    </div>
  );
}
