import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384", "#A28CF6", "#FFB6B9", "#B5EAD7", "#C7CEEA"];

export default function PlatformAnalytics() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [ordersRes, restaurantsRes] = await Promise.all([
          fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch("/api/admin/restaurants", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]);
        setOrders(ordersRes);
        setRestaurants(restaurantsRes);
      } catch (err) {
        setError("Failed to fetch analytics data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Compute order and revenue trends (last 30 days)
  const today = new Date();
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  const ordersByDay = last30.map(date => ({
    date,
    orders: orders.filter(o => (o.createdAt || o.created_at || "").slice(0, 10) === date).length,
    revenue: orders.filter(o => (o.createdAt || o.created_at || "").slice(0, 10) === date).reduce((sum, o) => sum + (o.total || 0), 0)
  }));

  // Top users by order count
  const userOrderCounts = {};
  orders.forEach(o => {
    userOrderCounts[o.userId] = (userOrderCounts[o.userId] || 0) + 1;
  });
  const topUsers = Object.entries(userOrderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, count]) => ({ userId, count }));

  // Top restaurants by revenue
  const restRevenue = {};
  orders.forEach(o => {
    restRevenue[o.restaurantId] = (restRevenue[o.restaurantId] || 0) + (o.total || 0);
  });
  const topRestaurants = Object.entries(restRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([restaurantId, revenue]) => {
      const rest = restaurants.find(r => r.id === Number(restaurantId));
      return { name: rest?.name || `ID ${restaurantId}`, revenue };
    });

  if (loading) return <div className="p-10 text-center">Loading analytics...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Platform Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="font-bold mb-4">Orders Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ordersByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId={0} />
              <YAxis yAxisId={1} orientation="right" />
              <Tooltip formatter={(v, n) => n === "revenue" ? `₹${v}` : v} />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#0088FE" name="Orders" yAxisId={0} />
              <Line type="monotone" dataKey="revenue" stroke="#FF8042" name="Revenue" yAxisId={1} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="font-bold mb-4">Top Users by Order Count</h3>
          <BarChart width={400} height={250} data={topUsers} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="userId" type="category" />
            <Tooltip />
            <Bar dataKey="count" fill="#0088FE">
              {topUsers.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 md:col-span-2">
          <h3 className="font-bold mb-4">Top Restaurants by Revenue</h3>
          <BarChart width={600} height={250} data={topRestaurants}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={v => `₹${v}`} />
            <Bar dataKey="revenue" fill="#FF8042">
              {topRestaurants.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>
    </div>
  );
} 