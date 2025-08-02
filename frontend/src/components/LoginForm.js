import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "./Toast";
import { api, API_ENDPOINTS } from "../config/api";

const ROLES = [
  { label: "Customer", value: "Customer", icon: "🛒" },
  { label: "Restaurant", value: "Restaurant", icon: "🍽️" },
  { label: "Admin", value: "Admin", icon: "⚙️" },
];

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [role, setRole] = useState("Customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToast({ message: "", type: "info" });
    
    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await api.post(API_ENDPOINTS.LOGIN, {
        username: formData.username,
        password: formData.password,
        role: role.toUpperCase() // send role in uppercase
      });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", role);
      if (data.id) localStorage.setItem("userId", data.id);
      // Clear previous info
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("restaurantName");
      localStorage.removeItem("restaurantId");
      // Fetch user profile and store username/email
      if (data.id && data.token) {
        try {
          let profile;
          if (role.toUpperCase() === "CUSTOMER") {
            profile = await api.get(API_ENDPOINTS.CUSTOMER_PROFILE(data.id));
          } else if (role.toUpperCase() === "RESTAURANT") {
            profile = await api.get(API_ENDPOINTS.RESTAURANT_BY_OWNER(data.id));
          }
          
          if (profile) {
            if (role.toUpperCase() === "CUSTOMER") {
              if (profile.username) localStorage.setItem("username", profile.username);
              if (profile.email) localStorage.setItem("email", profile.email);
            } else if (role.toUpperCase() === "RESTAURANT") {
              if (profile.id) localStorage.setItem("restaurantId", profile.id);
              if (profile.name) localStorage.setItem("restaurantName", profile.name);
              if (profile.owner) {
                if (profile.owner.username) localStorage.setItem("username", profile.owner.username);
                if (profile.owner.email) localStorage.setItem("email", profile.owner.email);
              }
            }
          }
        } catch (profileError) {
          console.warn("Failed to fetch profile:", profileError);
        }
      }
      setToast({ message: "Login successful!", type: "success" });
      setTimeout(() => navigate(`/${role.toLowerCase()}`), 1000);
    } catch (err) {
      setError(err.message);
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    const found = ROLES.find(r => r.value === role);
    return found ? found.icon : "👤";
  };

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Role Switcher */}
            <div className="flex justify-center mb-6">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  className={`flex items-center px-4 py-2 mx-1 rounded-full border transition-colors duration-200 text-sm font-medium focus:outline-none ${role === r.value ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}`}
                  onClick={() => setRole(r.value)}
                >
                  <span className="mr-2">{r.icon}</span> {r.label}
                </button>
              ))}
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">{getRoleIcon()}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to your {role.toLowerCase()} account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-400">👤</span>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="text-gray-400">
                      {showPassword ? "🙈" : "👁️"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-400">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 