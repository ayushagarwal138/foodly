import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function RatingsReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const fetchReviews = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.MY_REVIEWS);
      console.log("Received reviews:", data);
      setReviews(data);
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
    if (userId && token) {
      initialFetch();
    }
  }, [userId, token]);

  // Polling for new reviews
  useEffect(() => {
    if (!userId || !token) return;

    const pollInterval = setInterval(() => {
      fetchReviews();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [userId, token]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  // Sort reviews by timestamp (latest first)
  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.createdAt || 0);
    const dateB = new Date(b.timestamp || b.createdAt || 0);
    return dateB - dateA;
  });

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Ratings & Reviews</h2>
      {reviews.length === 0 ? (
        <div className="text-gray-500 text-center">You haven't written any reviews yet.</div>
      ) : (
        <div className="space-y-6">
          {sortedReviews.map((review, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-lg text-[#16213e]">{review.restaurantName}</div>
                  <div className="text-sm text-gray-500">{new Date(review.timestamp).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl text-yellow-400">{review.rating}★</span>
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium text-[#16213e]">Ordered Item:</span> {review.itemName}
              </div>
              <p className="text-gray-700">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 