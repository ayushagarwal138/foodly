import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReviews = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.ADMIN_REVIEWS);
      console.log("Fetched reviews:", data);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
    }
  };

  const flagReview = async (review) => {
    try {
      const data = await api.post(API_ENDPOINTS.ADMIN_REVIEW_FLAG(review.id));
      console.log("Flagged review:", data);
      setReviews(prev => prev.map(r => 
        r.id === review.id ? { ...r, isFlagged: true } : r
      ));
    } catch (err) {
      console.error("Error flagging review:", err);
      setError(err.message);
    }
  };

  const deleteReview = async (review) => {
    if (!window.confirm(`Are you sure you want to delete this review?`)) return;
    
    try {
      await api.delete(API_ENDPOINTS.ADMIN_REVIEW_DELETE(review.id));
      console.log("Deleted review:", review.id);
      setReviews(prev => prev.filter(r => r.id !== review.id));
    } catch (err) {
      console.error("Error deleting review:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchReviews();
      setLoading(false);
    }
    initialFetch();
  }, []);

  const filteredReviews = reviews.filter(review =>
    review.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReviews = reviews.length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;
  const flaggedReviews = reviews.filter(r => r.isFlagged).length;
  const recentReviews = reviews.filter(r => {
    const reviewDate = new Date(r.createdAt || r.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return reviewDate > weekAgo;
  }).length;

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Review Moderation</h2>
      <p className="text-gray-600 mb-8">Monitor and moderate customer reviews and ratings</p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{totalReviews}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{averageRating}</div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="text-2xl font-bold text-red-600">{flaggedReviews}</div>
          <div className="text-sm text-gray-600">Flagged Reviews</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{recentReviews}</div>
          <div className="text-sm text-gray-600">This Week</div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by user, restaurant, or text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchReviews}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          <span className="text-sm text-gray-600">
            {filteredReviews.length} of {reviews.length} reviews
          </span>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No reviews found.</div>
          <div className="text-sm text-gray-400">
            {searchTerm ? "Try adjusting your search terms." : "Reviews will appear here once customers submit them."}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {review.customerName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#16213e]">{review.customerName}</div>
                    <div className="text-sm text-gray-500">{review.restaurantName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">({review.rating}/5)</span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{review.text}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{new Date(review.createdAt || review.created_at).toLocaleDateString()}</span>
                  {review.isFlagged && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Flagged
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!review.isFlagged && (
                    <button
                      onClick={() => flagReview(review)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                    >
                      Flag
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review)}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 