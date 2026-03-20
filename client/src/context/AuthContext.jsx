import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    console.log("[DEBUG] AuthProvider: MOUNTED");
    return () => console.log("[DEBUG] AuthProvider: UNMOUNTED");
  }, []);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      console.log("[DEBUG] AuthContext: Checking session (v2)...");
      const response = await apiClient.get("/auth/check-session");
      console.log(
        "[DEBUG] AuthContext: Session response:",
        response.status,
        response.data,
      );

      if (response.data.isAuthenticated) {
        setUser(response.data.user);
      } else {
        console.warn(
          "[DEBUG] AuthContext: Server returned isAuthenticated: false",
          response.data,
        );
        setUser(null);
      }
    } catch (error) {
      console.error("[DEBUG] AuthContext: Session check failed", error);
      if (error.response) {
        console.error("[DEBUG] Error Status:", error.response.status);
        console.error("[DEBUG] Error Data:", error.response.data);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    // Capture role before clearing user state
    const isAdmin = user && user.role === "admin";

    try {
      if (isAdmin) {
        await apiClient.post("/admin/logout");
      } else {
        await apiClient.post("/auth/logout");
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      // Always clear local state and redirect
      setUser(null);
      if (isAdmin) {
        navigate("/admin/login");
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, navigate]);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin" || user?.role === "super_admin",
    checkAuth,
    login,
    logout,
  }), [user, isLoading, checkAuth, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
