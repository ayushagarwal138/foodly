import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");

  const fetchReviews = async () => {
    setError("");
    try {
      console.log("Fetching reviews for restaurant:", restaurantId);
      const data = await api.get(API_ENDPOINTS.RESTAURANT_REVIEWS(restaurantId));
      console.log("Fetched reviews:", data);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
    }
  };

  // Initial fetch
  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchReviews();
      setLoading(false);
    }
    if (restaurantId) {
      initialFetch();
    }
  }, [restaurantId]);

  // Polling for new reviews
  useEffect(() => {
    if (!restaurantId) return;

    const pollInterval = setInterval(() => {
      fetchReviews();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [restaurantId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  // Sort reviews by timestamp (latest first)
  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.createdAt || 0);
    const dateB = new Date(b.timestamp || b.createdAt || 0);
    return dateB - dateA;
  });

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#16213e]">Restaurant Reviews</h2>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#16213e]">{getAverageRating()}★</div>
          <div className="text-sm text-gray-600">{reviews.length} reviews</div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No reviews yet.</div>
          <div className="text-sm text-gray-400">Reviews will appear here once customers start rating your restaurant.</div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedReviews.map((review, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-lg text-[#16213e]">{review.customerName || "Anonymous"}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.timestamp || review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl text-yellow-400">{review.rating}★</span>
                </div>
              </div>
              
              {review.itemName && (
                <div className="mb-2">
                  <span className="font-medium text-[#16213e]">Ordered Item:</span> {review.itemName}
                </div>
              )}
              
              <p className="text-gray-700">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 