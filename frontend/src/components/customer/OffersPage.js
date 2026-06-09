import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { api, API_ENDPOINTS } from "../../config/api";

const offerImageByType = {
  "free-delivery": "/offers/free-delivery.png",
  cashback: "/offers/cashback.png"
};

function getOfferImage(offer) {
  return offerImageByType[offer.type] || offer.image || offer.imageUrl;
}

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
    image: "/offers/free-delivery.png",
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
    image: "/offers/cashback.png",
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
      <div className="app-page">
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-1/3 rounded-md bg-neutral-200"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="surface-panel">
                <div className="mb-4 h-48 rounded-md bg-neutral-200"></div>
                <div className="mb-2 h-6 rounded bg-neutral-200"></div>
                <div className="mb-4 h-4 w-3/4 rounded bg-neutral-200"></div>
                <div className="mb-4 h-8 rounded-md bg-neutral-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="section-title">Exclusive Offers</h1>
          <p className="section-subtitle max-w-2xl">
            Browse active deals, copy coupon codes, and apply them when you check out.
          </p>
        </div>
        <button
          onClick={() => navigate('/customer/restaurants')}
          className="btn btn-primary w-full md:w-auto"
        >
          Browse Restaurants
        </button>
      </div>

      {/* Tabs */}
      <div className="surface-panel mb-6 overflow-x-auto">
        <div className="flex min-w-max gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"}`}>
              {tab.count}
            </span>
          </button>
        ))}
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredOffers.map(offer => (
          <article key={offer.id} className="card-hover overflow-hidden p-0">
            <div className="relative h-48 overflow-hidden bg-neutral-100">
              <img
                src={getOfferImage(offer)}
                alt={offer.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute left-3 top-3 rounded-md bg-neutral-950/90 px-3 py-1 text-sm font-bold text-white backdrop-blur">
                {offer.discount}
              </div>
              <div className="absolute right-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-primary-700 backdrop-blur">
                {getDaysUntilExpiry(offer.validUntil)} days left
              </div>
            </div>

            <div className="p-5">
              <h3 className="mb-2 text-xl font-bold text-neutral-950">{offer.title}</h3>
              <p className="mb-4 text-sm leading-6 text-neutral-600">{offer.description}</p>

              <div className="mb-4 flex items-center text-sm text-neutral-500">
                <FaUtensils className="mr-2 h-5 w-5 text-neutral-400" />
                {offer.restaurant}
              </div>

              <div className="mb-4 space-y-2 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-neutral-500">Min Order</span>
                  <span className="font-semibold text-neutral-900">{offer.minOrder}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-neutral-500">Max Discount</span>
                  <span className="font-semibold text-accent-700">{offer.maxDiscount}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-neutral-500">Valid Until</span>
                  <span className="font-semibold text-neutral-900">{new Date(offer.validUntil).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mb-4 rounded-md border border-dashed border-primary-300 bg-primary-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="mb-1 text-sm text-primary-700">Coupon Code</p>
                    <p className="font-mono text-lg font-bold text-neutral-950">{offer.code}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(offer.code)}
                    className="btn btn-secondary min-h-[36px] px-3 py-2"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate('/customer/restaurants')}
                className="btn btn-primary w-full"
              >
                Order Now
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {filteredOffers.length === 0 && (
        <div className="surface-panel py-12 text-center">
          <h3 className="mb-2 text-2xl font-bold text-neutral-900">No offers available</h3>
          <p className="mb-6 text-neutral-600">Check back later for new offers.</p>
          <button
            onClick={() => setActiveTab("all")}
            className="btn btn-primary"
          >
            View All Offers
          </button>
        </div>
      )}

      <div className="surface-panel mt-10">
        <h3 className="mb-5 text-xl font-bold text-neutral-950">How to use offers</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ["1", "Copy Code", "Copy the coupon code from any available offer."],
            ["2", "Place Order", "Browse restaurants and add items to your cart."],
            ["3", "Apply and Save", "Paste the code at checkout to receive the discount."]
          ].map(([step, title, text]) => (
            <div key={step} className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-neutral-950 text-sm font-bold text-white">
                {step}
              </div>
              <h4 className="mb-1 font-semibold text-neutral-900">{title}</h4>
              <p className="text-sm leading-6 text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
          </div>
  );
} 
