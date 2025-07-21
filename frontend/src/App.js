import logo from './logo.svg';
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
import RestaurantDashboard from "./components/restaurant/RestaurantDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import { CartProvider } from "./components/customer/CartContext";

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
      <Routes>
        <Route path="/" element={<Navigate to="/customer/login" />} />
        <Route path="/customer/login" element={<LoginForm role="Customer" />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/restaurant/login" element={<LoginForm role="Restaurant" />} />
        <Route path="/admin/login" element={<LoginForm role="Admin" />} />
        <Route path="/customer/*" element={<CartProvider><CustomerDashboard /></CartProvider>} />
        <Route path="/restaurant/*" element={<RestaurantDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
