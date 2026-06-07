import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import RestaurantLayout from "./components/restaurant/RestaurantLayout";
import AdminLayout from "./components/admin/AdminLayout";
import { CartProvider } from "./components/customer/CartContext";
import { AuthProvider, RequireRole } from "./features/auth/AuthContext";

function UserPage() {
  return <div>User Page</div>;
}
function RestaurantPage() {
  return <div>Restaurant Page</div>;
}
function AdminPage() {
  return <div>Admin Page</div>;
}

function LoginPage() {
  return <div>Login Page (form coming soon)</div>;
}
function SignupPage() {
  return <div>Signup Page (form coming soon)</div>;
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/customer/login" />} />
          <Route path="/auth/callback" element={<Navigate to="/customer" replace />} />
          <Route path="/customer/login" element={<LoginForm role="Customer" />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/restaurant/login" element={<LoginForm role="Restaurant" />} />
          <Route path="/admin/login" element={<LoginForm role="Admin" />} />
          <Route path="/customer/*" element={<RequireRole role="CUSTOMER" loginPath="/customer/login"><CartProvider><CustomerDashboard /></CartProvider></RequireRole>} />
          <Route path="/restaurant/*" element={<RequireRole role="RESTAURANT" loginPath="/restaurant/login"><RestaurantLayout /></RequireRole>} />
          <Route path="/admin/*" element={<RequireRole role="ADMIN" loginPath="/admin/login"><AdminLayout /></RequireRole>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
