import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiCoffee, FiSettings, FiUser, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import Toast from "./Toast";
import Button from "./ui/Button";
import { api, API_ENDPOINTS } from "../config/api";

const ROLES = [
  { label: "Customer", value: "Customer", icon: FiShoppingCart, color: "primary" },
  { label: "Restaurant", value: "Restaurant", icon: FiCoffee, color: "accent" },
  { label: "Admin", value: "Admin", icon: FiSettings, color: "secondary" },
];

export default function LoginForm({ role: initialRole = "Customer" }) {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [role, setRole] = useState(initialRole);
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
      
      // Check if response contains an error
      if (data.error) {
        // Clear any existing authentication data on login failure
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('restaurantId');
        setError(data.error);
        setToast({ message: data.error, type: "error" });
        setLoading(false);
        return;
      }
      
      // Check if token exists (required for successful login)
      if (!data.token) {
        // Clear any existing authentication data on login failure
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('restaurantId');
        setError("Login failed: No token received");
        setToast({ message: "Login failed: No token received", type: "error" });
        setLoading(false);
        return;
      }
      
      // Store authentication data
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", role.toUpperCase());
      if (data.id) localStorage.setItem("userId", data.id);
      
      // Clear previous info
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("restaurantName");
      localStorage.removeItem("restaurantId");
      
      // Set basic info from login response
      localStorage.setItem("username", formData.username);
      if (data.restaurantId) {
        localStorage.setItem("restaurantId", data.restaurantId);
      }
      
      setToast({ message: "Login successful!", type: "success" });
      
      // Redirect immediately after successful login
      // Map role to correct route
      let redirectPath = `/${role.toLowerCase()}`;
      if (role.toLowerCase() === "restaurant") {
        redirectPath = "/restaurant";
      } else if (role.toLowerCase() === "admin") {
        redirectPath = "/admin";
      } else if (role.toLowerCase() === "customer") {
        redirectPath = "/customer";
      }
      
      console.log("Login successful, redirecting to:", redirectPath);
      setTimeout(() => {
        console.log("Executing navigation to:", redirectPath);
        navigate(redirectPath);
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getRoleConfig = () => {
    return ROLES.find(r => r.value === role) || ROLES[0];
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full animate-fade-in">
          <div className="bg-white rounded-3xl shadow-large border border-neutral-100 p-8 md:p-10">
            {/* Role Switcher */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {ROLES.map(r => {
                const Icon = r.icon;
                const isActive = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isActive
                        ? `bg-${r.color}-500 text-white border-${r.color}-500 shadow-md scale-105`
                        : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                    onClick={() => setRole(r.value)}
                    aria-pressed={isActive}
                    aria-label={`Switch to ${r.label} login`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 mb-6 animate-scale-in">
                <RoleIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
                Welcome Back
              </h1>
              <p className="text-neutral-600 text-base">
                Sign in to your {role.toLowerCase()} account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username/Email Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="w-5 h-5 text-neutral-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="input pl-12 pr-4"
                    placeholder="Enter your username or email"
                    value={formData.username}
                    onChange={handleChange}
                    aria-label="Username or email"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="input pl-12 pr-12"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    aria-label="Password"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none focus:text-primary-500"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-slide-in" role="alert">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                className="mt-6"
              >
                Sign In
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
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