import React, { useState } from 'react';
import { api, API_ENDPOINTS } from '../../config/api';

export default function ReviewModal({ isOpen, onClose, orderId, restaurantId, items }) {
  const [reviews, setReviews] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    setError("");
    
    try {
      console.log("Submitting reviews with data:", {
        orderId,
        restaurantId,
        items,
        reviews
      });
      
      // Submit each review
      for (const [menuItemId, review] of Object.entries(reviews)) {
        if (review.rating && review.text) {
          const reviewData = {
            orderId: orderId,
            restaurantId: restaurantId,
            menuItemId: menuItemId,
            rating: review.rating,
            text: review.text
          };
          
          console.log("Submitting review data:", reviewData);
          const data = await api.post(API_ENDPOINTS.REVIEWS, reviewData);
          console.log("Review submitted successfully:", data);
        }
      }
      onClose();
    } catch (error) {
      console.error("Failed to submit reviews:", error);
      setError("Failed to submit reviews. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  console.log("ReviewModal received items:", items);

  // Ensure items have the correct menu_item_id field
  const normalizedItems = items.map(item => ({
    ...item,
    menu_item_id: item.menu_item_id || item.menuItemId || item.id
  }));
  
  console.log("ReviewModal normalized items:", normalizedItems);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#16213e]">Rate Your Order</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}
        <div className="space-y-6">
          {normalizedItems.map((item) => (
            <div key={item.menu_item_id} className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">{item.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                {[1,2,3,4,5].map(star => (
                  <span
                    key={star}
                    className={`cursor-pointer text-2xl ${(reviews[item.menu_item_id]?.rating || 0) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => setReviews(prev => ({
                      ...prev,
                      [item.menu_item_id]: { ...prev[item.menu_item_id], rating: star }
                    }))}
                  >★</span>
                ))}
              </div>
              <textarea
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Write your review..."
                value={reviews[item.menu_item_id]?.text || ""}
                onChange={(e) => setReviews(prev => ({
                  ...prev,
                  [item.menu_item_id]: { ...prev[item.menu_item_id], text: e.target.value }
                }))}
                rows={2}
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            className="px-6 py-2 rounded-full font-bold text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            Skip
          </button>
          <button
            className={`px-6 py-2 rounded-full font-bold shadow transition ${
              submitting 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Reviews'}
          </button>
        </div>
      </div>
    </div>
  );
} 