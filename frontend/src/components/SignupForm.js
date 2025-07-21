import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "./Toast";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",
    // Restaurant-specific fields
    restaurantName: "",
    restaurantAddress: "",
    restaurantPhone: "",
    cuisineType: "",
    description: "",
    openingHours: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: "", type: "info" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error when user starts typing
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, color: "gray", text: "" };
    
    const validation = validatePassword(password);
    const validCount = Object.values(validation).filter(Boolean).length - 1; // -1 for isValid
    
    if (validCount <= 2) return { strength: 1, color: "red", text: "Weak" };
    if (validCount <= 3) return { strength: 2, color: "orange", text: "Fair" };
    if (validCount <= 4) return { strength: 3, color: "yellow", text: "Good" };
    return { strength: 4, color: "green", text: "Strong" };
  };

  const validateRestaurantFields = () => {
    if (formData.role === "RESTAURANT") {
      if (!formData.restaurantName.trim() || !formData.restaurantAddress.trim() || 
          !formData.restaurantPhone.trim() || !formData.cuisineType.trim()) {
        setError("Please fill in all restaurant fields");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToast({ message: "", type: "info" });
    
    // Validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError("Password must be at least 8 characters with uppercase, lowercase, number, and special character");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validateRestaurantFields()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          role: formData.role,
          restaurantName: formData.restaurantName,
          restaurantAddress: formData.restaurantAddress,
          restaurantPhone: formData.restaurantPhone,
          cuisineType: formData.cuisineType,
          description: formData.description,
          openingHours: formData.openingHours
        })
      });
      
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || "Signup failed");
      }
      if (data.id) localStorage.setItem("userId", data.id);
      // Fetch user profile and store username/email
      if (data.id && data.token) {
        let url = "";
        if (formData.role.toUpperCase() === "CUSTOMER") {
          url = `/api/customers/${data.id}`;
        } else if (formData.role.toUpperCase() === "RESTAURANT") {
          url = `/api/restaurants/${data.id}`;
        }
        if (url) {
          const profileRes = await fetch(url, {
            headers: { Authorization: `Bearer ${data.token}` }
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (profile.username || profile.name) localStorage.setItem("username", profile.username || profile.name);
            if (profile.email) localStorage.setItem("email", profile.email);
          }
        }
      }
      setToast({ message: "Registration successful!", type: "success" });
      setTimeout(() => navigate(`/${formData.role.toLowerCase()}/login`), 1000);
    } catch (err) {
      setError(err.message);
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (formData.role) {
      case "CUSTOMER": return "🛒";
      case "RESTAURANT": return "🍽️";
      default: return "👤";
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">{getRoleIcon()}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600">
                Join us as a {formData.role.toLowerCase()}
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
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-400">👤</span>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-400">📧</span>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="RESTAURANT">Restaurant</option>
                </select>
              </div>

              {/* Restaurant-specific fields */}
              {formData.role === "RESTAURANT" && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Restaurant Information</h3>
                  
                  {/* Restaurant Name */}
                  <div>
                    <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      id="restaurantName"
                      name="restaurantName"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Enter restaurant name"
                      value={formData.restaurantName}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Restaurant Address */}
                  <div>
                    <label htmlFor="restaurantAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Address *
                    </label>
                    <textarea
                      id="restaurantAddress"
                      name="restaurantAddress"
                      required
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Enter restaurant address"
                      value={formData.restaurantAddress}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Restaurant Phone */}
                  <div>
                    <label htmlFor="restaurantPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Phone *
                    </label>
                    <input
                      id="restaurantPhone"
                      name="restaurantPhone"
                      type="tel"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Enter restaurant phone"
                      value={formData.restaurantPhone}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Cuisine Type */}
                  <div>
                    <label htmlFor="cuisineType" className="block text-sm font-medium text-gray-700 mb-2">
                      Cuisine Type *
                    </label>
                    <select
                      id="cuisineType"
                      name="cuisineType"
                      value={formData.cuisineType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    >
                      <option value="">Select cuisine type</option>
                      <option value="Italian">Italian</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Indian">Indian</option>
                      <option value="Mexican">Mexican</option>
                      <option value="American">American</option>
                      <option value="Thai">Thai</option>
                      <option value="Mediterranean">Mediterranean</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Describe your restaurant"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Opening Hours */}
                  <div>
                    <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Hours
                    </label>
                    <input
                      id="openingHours"
                      name="openingHours"
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="e.g., 10:00 AM - 10:00 PM"
                      value={formData.openingHours}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

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
                    placeholder="Create a strong password"
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.color === "red" ? "bg-red-500" :
                            passwordStrength.color === "orange" ? "bg-orange-500" :
                            passwordStrength.color === "yellow" ? "bg-yellow-500" :
                            "bg-green-500"
                          }`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.color === "red" ? "text-red-600" :
                        passwordStrength.color === "orange" ? "text-orange-600" :
                        passwordStrength.color === "yellow" ? "text-yellow-600" :
                        "text-green-600"
                      }`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="text-gray-400">
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </span>
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-1">
                    <span className={`text-xs ${
                      formData.password === formData.confirmPassword ? "text-green-600" : "text-red-600"
                    }`}>
                      {formData.password === formData.confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                    </span>
                  </div>
                )}
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link 
                  to="/customer/login" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 