import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, API_ENDPOINTS, clearAuth } from "../../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncLocalAuth = useCallback((nextUser) => {
    if (!nextUser) {
      clearAuth();
      return;
    }
    localStorage.setItem("userId", nextUser.id);
    localStorage.setItem("userRole", nextUser.role);
    localStorage.setItem("username", nextUser.username || "");
    if (nextUser.email) localStorage.setItem("email", nextUser.email);
    if (nextUser.restaurantId) localStorage.setItem("restaurantId", nextUser.restaurantId);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.get(API_ENDPOINTS.AUTH_ME);
      setUser(me);
      syncLocalAuth(me);
      return me;
    } catch (error) {
      setUser(null);
      syncLocalAuth(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [syncLocalAuth]);

  const logout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT, {});
    } finally {
      setUser(null);
      syncLocalAuth(null);
    }
  }, [syncLocalAuth]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = useMemo(() => ({ user, loading, refreshUser, logout }), [user, loading, refreshUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function RequireRole({ role, loginPath, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" aria-label="Loading" />
      </div>
    );
  }

  if (!user || user.role !== role) {
    return <Navigate to={loginPath} replace />;
  }

  return children;
}
