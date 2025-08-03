import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");

  const fetchAnalytics = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.RESTAURANT_ANALYTICS(restaurantId));
      console.log("Fetched analytics:", data);
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchAnalytics();
      setLoading(false);
    }
    if (restaurantId) {
      initialFetch();
    }
  }, [restaurantId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  if (!analytics) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Restaurant Analytics</h2>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No analytics data available yet.</div>
          <div className="text-sm text-gray-400">Analytics will appear here once you start receiving orders.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Restaurant Analytics</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalOrders || 0}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        
        {analytics.ordersByStatus && (
          <>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{analytics.ordersByStatus.Delivered || 0}</div>
              <div className="text-sm text-gray-600">Completed Orders</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{analytics.ordersByStatus.New || 0}</div>
              <div className="text-sm text-gray-600">New Orders</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{analytics.ordersByStatus.Preparing || 0}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </>
        )}
      </div>

      {/* Orders by Status */}
      {analytics.ordersByStatus && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-[#16213e] mb-4">Orders by Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
              <div key={status} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#16213e]">{status}</span>
                  <span className="text-2xl font-bold text-blue-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Trends */}
      {analytics.orderTrends && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-[#16213e] mb-4">Order Trends (Last 30 Days)</h3>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="grid grid-cols-6 md:grid-cols-15 gap-2">
              {Object.entries(analytics.orderTrends).map(([date, count]) => (
                <div key={date} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div className="text-sm font-semibold text-[#16213e]">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#16213e] mb-4">Performance Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Order Value:</span>
                              <span className="font-semibold">₹{analytics.averageOrderValue || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
                              <span className="font-semibold">₹{analytics.totalRevenue || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completion Rate:</span>
              <span className="font-semibold">{analytics.completionRate || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#16213e] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View Detailed Reports
            </button>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Export Data
            </button>
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Generate Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 