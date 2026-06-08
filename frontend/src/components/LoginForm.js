import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiCoffee, FiSettings, FiUser, FiEye, FiEyeOff, FiAlertCircle, FiMapPin, FiClock } from "react-icons/fi";
import Toast from "./Toast";
import Button from "./ui/Button";
import { api, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../features/auth/AuthContext";

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
  const { refreshUser } = useAuth();

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
      
      // Store non-secret profile hints only. The real session lives in a secure HttpOnly cookie.
      localStorage.setItem("userRole", data.role || role.toUpperCase());
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

      await refreshUser();
      
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

  const roleStyle = (value, isActive) => {
    if (!isActive) {
      return "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50";
    }
    if (value === "Restaurant") return "border-accent-600 bg-accent-600 text-white shadow-sm";
    if (value === "Admin") return "border-neutral-900 bg-neutral-900 text-white shadow-sm";
    return "border-primary-600 bg-primary-600 text-white shadow-sm";
  };

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      <div className="min-h-screen bg-[#f7f7f5] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden min-h-full overflow-hidden bg-neutral-950 lg:block">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=85"
              alt="Fresh restaurant food spread"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-neutral-950/15" />
            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              <div className="flex items-center gap-3">
                <img src="/logo.jpeg" alt="Foodly" className="h-11 w-11 rounded-md object-cover ring-1 ring-white/30" />
                <div>
                  <p className="text-xl font-bold">Foodly</p>
                  <p className="text-sm text-white/70">Fresh meals, faster decisions</p>
                </div>
              </div>

              <div className="max-w-lg">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur">
                  <FiMapPin className="h-4 w-4" />
                  Local restaurants near you
                </p>
                <h1 className="text-5xl font-extrabold leading-tight tracking-normal">
                  Your next meal should feel effortless.
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-white/78">
                  Sign in to discover restaurants, track orders, manage menus, and keep Foodly moving smoothly.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {["Live orders", "Fast checkout", "Secure login"].map((item) => (
                  <div key={item} className="rounded-md border border-white/15 bg-white/10 p-3 backdrop-blur">
                    <p className="text-sm font-semibold">{item}</p>
                    <p className="mt-1 text-xs text-white/65">Production ready</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <main className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
            <div className="w-full max-w-md animate-fade-in">
              <div className="mb-8 flex items-center justify-between lg:hidden">
                <div className="flex items-center gap-3">
                  <img src="/logo.jpeg" alt="Foodly" className="h-10 w-10 rounded-md object-cover" />
                  <div>
                    <p className="text-lg font-bold text-neutral-950">Foodly</p>
                    <p className="text-xs text-neutral-500">Food delivery platform</p>
                  </div>
                </div>
              </div>

              <div className="mb-7">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                  <RoleIcon className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-normal text-neutral-950 md:text-4xl">
                  Welcome back
                </h1>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Sign in as {role.toLowerCase()} and continue where you left off.
                </p>
              </div>

              <div className="mb-6 grid grid-cols-3 gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
              {ROLES.map(r => {
                const Icon = r.icon;
                const isActive = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    className={`flex min-h-[42px] items-center justify-center gap-2 rounded-md border px-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${roleStyle(r.value, isActive)}`}
                    onClick={() => setRole(r.value)}
                    aria-pressed={isActive}
                    aria-label={`Switch to ${r.label} login`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{r.label}</span>
                  </button>
                );
              })}
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
                <div className="animate-slide-in rounded-md border border-red-200 bg-red-50 p-4" role="alert">
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
              <Button
                type="button"
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => {
                  window.location.href = `${process.env.REACT_APP_API_BASE_URL || ""}${API_ENDPOINTS.GOOGLE_LOGIN}`;
                }}
              >
                Continue with Google
              </Button>
            </form>

              <div className="mt-6 flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
                <FiClock className="h-4 w-4 text-primary-600" />
                <span>Secure cookie login. No browser token storage for your session.</span>
              </div>

            {/* Footer */}
            <div className="mt-7 text-center">
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
          </main>
        </div>
      </div>
    </>
  );
} 
