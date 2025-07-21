import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384"];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const analytics = await res.json();
        setData(analytics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (restaurantId && token) fetchAnalytics();
  }, [restaurantId, token]);

  if (loading) return <div className="p-10 text-center">Loading analytics...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!data) return null;

  // Prepare chart data
  const orderTrends = Object.entries(data.orderTrends || {}).map(([date, value]) => ({ date, value }));
  const revenueTrends = Object.entries(data.revenueTrends || {}).map(([date, value]) => ({ date, value }));
  const ordersByStatus = Object.entries(data.ordersByStatus || {}).map(([status, value]) => ({ status, value }));
  const topDishes = (data.topDishes || []).map(item => ({ name: item.key, value: item.value }));
  const leastDishes = (data.leastDishes || []).map(item => ({ name: item.key, value: item.value }));
  const avgRatingPerDish = Object.entries(data.avgRatingPerDish || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-[#16213e]">Restaurant Analytics Dashboard</h2>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-blue-50 rounded-2xl shadow p-6 flex flex-col items-center border border-blue-100">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-2xl font-bold text-[#16213e]">{data.totalOrders}</div>
          <div className="text-gray-500">Total Orders</div>
        </div>
        <div className="bg-green-50 rounded-2xl shadow p-6 flex flex-col items-center border border-green-100">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-[#16213e]">₹{data.totalRevenue ? data.totalRevenue.toFixed(2) : '0.00'}</div>
          <div className="text-gray-500">Total Revenue</div>
        </div>
        <div className="bg-yellow-50 rounded-2xl shadow p-6 flex flex-col items-center border border-yellow-100">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-[#16213e]">{data.uniqueCustomers}</div>
          <div className="text-gray-500">Unique Customers</div>
        </div>
        <div className="bg-purple-50 rounded-2xl shadow p-6 flex flex-col items-center border border-purple-100">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-[#16213e]">{data.averageRating.toFixed(2)}</div>
          <div className="text-gray-500">Avg. Rating</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-[#16213e]">Order Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={orderTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0088FE" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-[#16213e]">Revenue Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Line type="monotone" dataKey="value" stroke="#00C49F" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-[#16213e]">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ordersByStatus} dataKey="value" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                {ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-[#16213e]">Top 5 Selling Dishes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topDishes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-[#16213e]">Least Selling Dishes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={leastDishes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#FF6384" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-[#16213e]">Average Rating per Dish</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={avgRatingPerDish}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 mb-10">
        <h3 className="text-lg font-bold mb-4 text-[#16213e]">Recent Reviews</h3>
        {(!data.recentReviews || data.recentReviews.length === 0) ? (
          <div className="text-gray-500">No reviews yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 font-semibold">
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Dish</th>
                  <th className="pb-2">Rating</th>
                  <th className="pb-2">Review</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentReviews.map((r, idx) => (
                  <tr key={idx} className="border-t last:border-b-0">
                    <td className="py-2">{r.customer ? r.customer.username : "Anonymous"}</td>
                    <td className="py-2">{r.menuItemName}</td>
                    <td className="py-2">{r.rating}★</td>
                    <td className="py-2">{r.text}</td>
                    <td className="py-2">{new Date(r.createdAt || r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 