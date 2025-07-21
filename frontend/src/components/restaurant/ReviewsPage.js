import React, { useState, useEffect } from "react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");

  const fetchReviews = async () => {
    setError("");
    try {
      console.log("Fetching reviews for restaurant:", restaurantId);
      const res = await fetch(`/api/reviews/restaurant/${restaurantId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch reviews: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
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
    if (restaurantId && token) {
      initialFetch();
    }
  }, [restaurantId, token]);

  // Polling for new reviews
  useEffect(() => {
    if (!restaurantId || !token) return;

    const pollInterval = setInterval(() => {
      fetchReviews();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [restaurantId, token]);

  if (!restaurantId) {
    return (
      <div className="p-10 text-center text-red-600">
        Restaurant ID not found. Please try logging in again.
      </div>
    );
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Customer Reviews</h2>
      {reviews.length === 0 ? (
        <div className="text-gray-500 text-center">No reviews available.</div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-lg text-[#16213e]">{review.customerName || 'Anonymous'}</div>
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