import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, API_ENDPOINTS } from "../../config/api";

// Sample offers data - in a real app, this would come from an API
const sampleOffers = [
  {
    id: 1,
    type: "discount",
    title: "First Order Special",
    description: "Get 50% off on your first order up to ₹200",
    discount: "50% OFF",
    maxDiscount: "₹200",
    code: "FIRST50",
    validUntil: "2024-12-31",
    minOrder: "₹100",
    category: "new-user",
    restaurant: "All Restaurants",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    color: "bg-gradient-to-r from-purple-500 to-pink-500"
  },
  {
    id: 2,
    type: "free-delivery",
    title: "Free Delivery Weekend",
    description: "Free delivery on all orders above ₹150 this weekend",
    discount: "FREE DELIVERY",
    maxDiscount: "₹50",
    code: "FREEDEL",
    validUntil: "2024-12-15",
    minOrder: "₹150",
    category: "delivery",
    restaurant: "All Restaurants",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    color: "bg-gradient-to-r from-green-500 to-teal-500"
  },
  {
    id: 3,
    type: "cashback",
    title: "Cashback Bonanza",
    description: "Get 10% cashback on orders above ₹300",
    discount: "10% CASHBACK",
    maxDiscount: "₹100",
    code: "CASHBACK10",
    validUntil: "2024-12-20",
    minOrder: "₹300",
    category: "cashback",
    restaurant: "All Restaurants",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    color: "bg-gradient-to-r from-orange-500 to-red-500"
  },
  {
    id: 4,
    type: "combo",
    title: "Pizza + Drink Combo",
    description: "Buy any large pizza and get a soft drink free",
    discount: "COMBO OFFER",
    maxDiscount: "₹80",
    code: "PIZZACOMBO",
    validUntil: "2024-12-25",
    minOrder: "₹200",
    category: "combo",
    restaurant: "Pizza Palace",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    color: "bg-gradient-to-r from-yellow-500 to-orange-500"
  },
  {
    id: 5,
    type: "discount",
    title: "Weekday Special",
    description: "20% off on all orders from Monday to Thursday",
    discount: "20% OFF",
    maxDiscount: "₹150",
    code: "WEEKDAY20",
    validUntil: "2024-12-31",
    minOrder: "₹200",
    category: "weekday",
    restaurant: "All Restaurants",
    image: "https://images.unsplash.com/photo-1504674900240-9a9049b3d378?w=400&h=300&fit=crop",
    color: "bg-gradient-to-r from-blue-500 to-indigo-500"
  },
  {
    id: 6,
    type: "free-item",
    title: "Buy 2 Get 1 Free",
    description: "Buy any 2 main course items and get 1 free",
    discount: "BUY 2 GET 1",
    maxDiscount: "₹200",
    code: "B2G1",
    validUntil: "2024-12-18",
    minOrder: "₹250",
    category: "free-item",
    restaurant: "All Restaurants",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    color: "bg-gradient-to-r from-pink-500 to-rose-500"
  }
];

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOffers() {
      setLoading(true);
      try {
        const data = await api.get(API_ENDPOINTS.OFFERS);
        setOffers(data);
      } catch (error) {
        console.error("Error fetching offers:", error);
        // Fallback to sample data
        setOffers(sampleOffers);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOffers();
  }, []);

  const tabs = [
    { id: "all", label: "All Offers", count: offers.length },
    { id: "discount", label: "Discounts", count: offers.filter(o => o.type === "discount").length },
    { id: "delivery", label: "Free Delivery", count: offers.filter(o => o.type === "free-delivery").length },
    { id: "cashback", label: "Cashback", count: offers.filter(o => o.type === "cashback").length },
    { id: "combo", label: "Combo Deals", count: offers.filter(o => o.type === "combo").length },
    { id: "free-item", label: "Free Items", count: offers.filter(o => o.type === "free-item").length }
  ];

  const filteredOffers = activeTab === "all" 
    ? offers 
    : offers.filter(offer => offer.type === activeTab);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
    alert(`Coupon code "${code}" copied to clipboard!`);
  };

  const getDaysUntilExpiry = (validUntil) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded-lg mb-8 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="h-48 bg-gray-300 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded-lg mb-4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🎉 Exclusive Offers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals, discounts, and promotions to make your dining experience even better!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => (
            <div key={offer.id} className="group">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                {/* Offer Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white font-bold text-sm ${offer.color}`}>
                    {offer.discount}
                  </div>
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {getDaysUntilExpiry(offer.validUntil)} days left
                  </div>
                </div>

                {/* Offer Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {offer.description}
                  </p>

                  {/* Restaurant */}
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm text-gray-500">{offer.restaurant}</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Min Order:</span>
                      <span className="font-semibold">{offer.minOrder}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Max Discount:</span>
                      <span className="font-semibold text-green-600">{offer.maxDiscount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Valid Until:</span>
                      <span className="font-semibold">{new Date(offer.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Coupon Code</p>
                        <p className="font-mono font-bold text-lg text-gray-800">{offer.code}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(offer.code)}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate('/customer')}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No offers available</h3>
            <p className="text-gray-600 mb-6">Check back later for new exciting offers!</p>
            <button
              onClick={() => setActiveTab("all")}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
            >
              View All Offers
            </button>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">💡 How to Use Offers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  1
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Copy Code</h4>
                <p className="text-gray-600 text-sm">Click the "Copy" button to copy the coupon code to your clipboard</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  2
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Place Order</h4>
                <p className="text-gray-600 text-sm">Browse restaurants and add items to your cart</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  3
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Apply & Save</h4>
                <p className="text-gray-600 text-sm">Paste the code at checkout and enjoy your discount!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 