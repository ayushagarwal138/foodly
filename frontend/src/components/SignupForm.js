import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiCoffee, FiUser, FiMail, FiEye, FiEyeOff, FiAlertCircle, FiCheck, FiX } from "react-icons/fi";
import Toast from "./Toast";
import Button from "./ui/Button";
import { api, API_ENDPOINTS } from "../config/api";

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
      const data = await api.post(API_ENDPOINTS.SIGNUP, {
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
      });
      if (data.id) localStorage.setItem("userId", data.id);
      
      // Set basic info from signup response
      localStorage.setItem("username", formData.username);
      if (formData.email) localStorage.setItem("email", formData.email);
      
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
      case "CUSTOMER": return FiShoppingCart;
      case "RESTAURANT": return FiCoffee;
      default: return FiUser;
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const RoleIcon = getRoleIcon();

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-primary-50 flex items-center justify-center p-4 py-12">
        <div className="max-w-2xl w-full animate-fade-in">
          <div className="bg-white rounded-3xl shadow-large border border-neutral-100 p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-100 to-primary-100 mb-6 animate-scale-in">
                <RoleIcon className="w-10 h-10 text-accent-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
                Create Account
              </h1>
              <p className="text-neutral-600 text-base">
                Join us as a {formData.role.toLowerCase()}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Username
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
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    aria-label="Username"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="w-5 h-5 text-neutral-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input pl-12 pr-4"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-label="Email address"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Account Type
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="input appearance-none pr-10 cursor-pointer"
                    aria-label="Account type"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="RESTAURANT">Restaurant</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Restaurant-specific fields */}
              {formData.role === "RESTAURANT" && (
                <div className="space-y-5 border-t border-neutral-200 pt-6 mt-6 animate-slide-in">
                  <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <FiCoffee className="w-5 h-5 text-accent-500" />
                    Restaurant Information
                  </h3>
                  
                  {/* Restaurant Name */}
                  <div>
                    <label htmlFor="restaurantName" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Restaurant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="restaurantName"
                      name="restaurantName"
                      type="text"
                      required
                      className="input"
                      placeholder="Enter restaurant name"
                      value={formData.restaurantName}
                      onChange={handleChange}
                      aria-label="Restaurant name"
                      aria-required="true"
                    />
                  </div>

                  {/* Restaurant Address */}
                  <div>
                    <label htmlFor="restaurantAddress" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Restaurant Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="restaurantAddress"
                      name="restaurantAddress"
                      required
                      rows="3"
                      className="input resize-none"
                      placeholder="Enter restaurant address"
                      value={formData.restaurantAddress}
                      onChange={handleChange}
                      aria-label="Restaurant address"
                      aria-required="true"
                    />
                  </div>

                  {/* Restaurant Phone */}
                  <div>
                    <label htmlFor="restaurantPhone" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Restaurant Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="restaurantPhone"
                      name="restaurantPhone"
                      type="tel"
                      required
                      className="input"
                      placeholder="Enter restaurant phone"
                      value={formData.restaurantPhone}
                      onChange={handleChange}
                      aria-label="Restaurant phone"
                      aria-required="true"
                    />
                  </div>

                  {/* Cuisine Type */}
                  <div>
                    <label htmlFor="cuisineType" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Cuisine Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="cuisineType"
                        name="cuisineType"
                        value={formData.cuisineType}
                        onChange={handleChange}
                        className="input appearance-none pr-10 cursor-pointer"
                        aria-label="Cuisine type"
                        aria-required="true"
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
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Restaurant Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      className="input resize-none"
                      placeholder="Describe your restaurant"
                      value={formData.description}
                      onChange={handleChange}
                      aria-label="Restaurant description"
                    />
                  </div>

                  {/* Opening Hours */}
                  <div>
                    <label htmlFor="openingHours" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Opening Hours
                    </label>
                    <input
                      id="openingHours"
                      name="openingHours"
                      type="text"
                      className="input"
                      placeholder="e.g., 10:00 AM - 10:00 PM"
                      value={formData.openingHours}
                      onChange={handleChange}
                      aria-label="Opening hours"
                    />
                  </div>
                </div>
              )}

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
                    placeholder="Create a strong password"
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-neutral-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.color === "red" ? "bg-red-500" :
                            passwordStrength.color === "orange" ? "bg-orange-500" :
                            passwordStrength.color === "yellow" ? "bg-yellow-500" :
                            "bg-accent-500"
                          }`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${
                        passwordStrength.color === "red" ? "text-red-600" :
                        passwordStrength.color === "orange" ? "text-orange-600" :
                        passwordStrength.color === "yellow" ? "text-yellow-600" :
                        "text-accent-600"
                      }`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'minLength', label: '8+ characters' },
                        { key: 'hasUpperCase', label: 'Uppercase' },
                        { key: 'hasLowerCase', label: 'Lowercase' },
                        { key: 'hasNumbers', label: 'Number' },
                        { key: 'hasSpecialChar', label: 'Special char' },
                      ].map(({ key, label }) => {
                        const validation = validatePassword(formData.password);
                        const isValid = validation[key];
                        return (
                          <div key={key} className="flex items-center gap-1.5">
                            {isValid ? (
                              <FiCheck className="w-3.5 h-3.5 text-accent-500" />
                            ) : (
                              <FiX className="w-3.5 h-3.5 text-neutral-400" />
                            )}
                            <span className={isValid ? "text-accent-600" : "text-neutral-500"}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="input pl-12 pr-12"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    aria-label="Confirm password"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none focus:text-primary-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <FiCheck className="w-4 h-4 text-accent-500" />
                        <span className="text-xs font-medium text-accent-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <FiX className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-medium text-red-600">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
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
                variant="success"
                size="lg"
                fullWidth
                isLoading={loading}
                className="mt-6"
              >
                Create Account
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">
                Already have an account?{" "}
                <Link 
                  to="/customer/login" 
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
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