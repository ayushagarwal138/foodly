import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiCalendar, FiDollarSign, FiPackage, FiPieChart } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";
import Button from "../ui/Button";
import { api, API_ENDPOINTS } from "../../config/api";
import { keepPreviousIfSame } from "../../utils/state";

const ACTIVE_STATUSES = new Set(["New", "Accepted", "Preparing", "Out for Delivery"]);
const FINAL_STATUSES = new Set(["Delivered", "Cancelled", "Refunded"]);

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `₹${amount.toFixed(2)}`;
}

function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

function orderItemsLabel(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "Items unavailable";
  const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || items.length;
  return `${count} ${count === 1 ? "item" : "items"}`;
}

function percentWidthClass(percent) {
  if (percent >= 90) return "w-full";
  if (percent >= 75) return "w-3/4";
  if (percent >= 66) return "w-2/3";
  if (percent >= 50) return "w-1/2";
  if (percent >= 33) return "w-1/3";
  if (percent >= 25) return "w-1/4";
  if (percent >= 16) return "w-1/6";
  if (percent > 0) return "w-[10%]";
  return "w-0";
}

export default function CustomerSpending() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchOrders = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const data = await api.get(API_ENDPOINTS.MY_ORDERS);
      setOrders(previous => keepPreviousIfSame(previous, Array.isArray(data) ? data : []));
      if (!silent) setError("");
    } catch (err) {
      if (!silent) setError(err.message || "Unable to load spending summary");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders({ silent: true });
    }, 10000);
    const refresh = () => fetchOrders({ silent: true });
    window.addEventListener("foodlyNotificationsChanged", refresh);
    window.addEventListener("foodlyOrdersChanged", refresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("foodlyNotificationsChanged", refresh);
      window.removeEventListener("foodlyOrdersChanged", refresh);
    };
  }, [fetchOrders]);

  const summary = useMemo(() => {
    const total = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const delivered = orders
      .filter(order => order.status === "Delivered")
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const active = orders
      .filter(order => ACTIVE_STATUSES.has(order.status))
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const finalOrderCount = orders.filter(order => FINAL_STATUSES.has(order.status)).length;

    const byRestaurant = orders.reduce((acc, order) => {
      const name = order.restaurant || order.restaurantName || "Restaurant";
      if (!acc[name]) {
        acc[name] = { name, total: 0, count: 0 };
      }
      acc[name].total += Number(order.total || 0);
      acc[name].count += 1;
      return acc;
    }, {});

    return {
      total,
      delivered,
      active,
      average: orders.length ? total / orders.length : 0,
      finalOrderCount,
      byRestaurant: Object.values(byRestaurant)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
    };
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 8);
  }, [orders]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6 md:p-8">
        <div className="rounded-md border border-neutral-200 bg-white py-12 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary-500" />
          <p className="font-medium text-neutral-600">Loading spending summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6 md:p-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-5 text-red-700">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
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
            <FiDollarSign className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dark-primary md:text-3xl">Total Spent</h1>
            <p className="mt-1 text-sm text-neutral-600">Your order totals and restaurant spend history.</p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate("/customer/orders")}
          rightIcon={<FiArrowRight className="h-4 w-4" />}
        >
          View Orders
        </Button>
      </div>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Spent", value: formatCurrency(summary.total), icon: FiDollarSign, tone: "primary" },
          { label: "Delivered Spend", value: formatCurrency(summary.delivered), icon: FiPackage, tone: "green" },
          { label: "Active Order Value", value: formatCurrency(summary.active), icon: FiCalendar, tone: "blue" },
          { label: "Average Order", value: formatCurrency(summary.average), icon: FiPieChart, tone: "neutral" }
        ].map(item => {
          const Icon = item.icon;
          const toneClass = item.tone === "green"
            ? "bg-green-50 text-green-700 ring-green-100"
            : item.tone === "blue"
              ? "bg-blue-50 text-blue-700 ring-blue-100"
              : item.tone === "neutral"
                ? "bg-neutral-100 text-neutral-700 ring-neutral-200"
                : "bg-primary-50 text-primary-700 ring-primary-100";

          return (
            <div key={item.label} className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-md ring-1 ${toneClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-extrabold text-neutral-950">{item.value}</div>
              <div className="mt-1 text-sm font-semibold text-neutral-600">{item.label}</div>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)]">
        <section className="rounded-md border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-lg font-bold text-neutral-950">Recent Spending</h2>
            <p className="mt-1 text-sm text-neutral-500">{orders.length} total orders</p>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-5 py-12 text-center text-neutral-500">
              <FiPackage className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
              <p>No spending history yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentOrders.map(order => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => navigate(`/customer/track?id=${order.id}`)}
                  className="flex w-full flex-col gap-3 px-5 py-4 text-left transition-colors hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-neutral-950">
                      {order.restaurant || order.restaurantName || "Restaurant"}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                      <span>Order #{order.id}</span>
                      <span>{formatOrderDate(order.date || order.createdAt)}</span>
                      <span>{orderItemsLabel(order.items)}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-3 sm:justify-end">
                    <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                      {order.status}
                    </span>
                    <span className="text-lg font-bold text-neutral-950">{formatCurrency(order.total)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-md border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-lg font-bold text-neutral-950">Top Restaurants</h2>
            <p className="mt-1 text-sm text-neutral-500">{summary.finalOrderCount} completed, cancelled, or refunded orders</p>
          </div>

          {summary.byRestaurant.length === 0 ? (
            <div className="px-5 py-12 text-center text-neutral-500">
              <FaUtensils className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
              <p>No restaurant spend yet.</p>
            </div>
          ) : (
            <div className="space-y-3 p-5">
              {summary.byRestaurant.map(restaurant => {
                const percent = summary.total > 0 ? Math.min(100, Math.round((restaurant.total / summary.total) * 100)) : 0;
                return (
                  <div key={restaurant.name} className="rounded-md border border-neutral-200 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-neutral-950">{restaurant.name}</div>
                        <div className="text-xs text-neutral-500">{restaurant.count} {restaurant.count === 1 ? "order" : "orders"}</div>
                      </div>
                      <div className="font-bold text-neutral-950">{formatCurrency(restaurant.total)}</div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div className={`h-full rounded-full bg-primary-600 ${percentWidthClass(percent)}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
