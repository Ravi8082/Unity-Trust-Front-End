"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
  refreshUserDetails: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    setToken(response.token);
    
    // If user info is not included in the response, fetch it separately
    let userToStore = response.user as User;
    if (!response.user.id) {
      // If the user object is empty, we need to fetch user details using the token
      try {
        // Try to decode the token to get user info if embedded in JWT
        const token = response.token;
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            // Check if the token has user info embedded
            if (payload.userId || payload.sub || payload.email) {
              userToStore = {
                id: payload.userId || payload.sub || 0,
                email: payload.email || email,
                role: payload.role || payload.authorities?.[0] || "ROLE_USER",
                name: payload.name || payload.username || "",
                branchName: payload.branchName || payload.branch?.branchName,
                branchId: payload.branchId || payload.branch?.id
              } as User;
            } else {
              // If no user info in token, fetch from backend
              userToStore = await api.getUserDetails();
            }
          } catch (e) {
            console.error("Error decoding token:", e);
            // Fallback to fetching user info from backend
            userToStore = await api.getUserDetails();
          }
        } else {
          // If not a valid JWT, fetch user info from backend
          userToStore = await api.getUserDetails();
        }
      } catch (error) {
        console.error("Error processing token or fetching user details:", error);
        // If all else fails, try to fetch user info from backend
        try {
          userToStore = await api.getUserDetails();
        } catch (fetchError) {
          console.error("Failed to fetch user details:", fetchError);
          // Create a minimal user object with the email provided
          userToStore = {
            id: 0,
            email: email,
            role: "ROLE_USER",
            name: "",
            branchName: "",
            branchId: undefined
          } as User;
        }
      }
    } else {
      // If user info was included in the response, use it directly
      userToStore = response.user as User;
    }
    
    setUser(userToStore);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(userToStore));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const refreshUserDetails = useCallback(async () => {
    if (!token) {
      console.error("No token available to refresh user details");
      return;
    }
    
    try {
      const userData = await api.getUserDetails();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to refresh user details:", error);
    }
  }, [token]);

  const hasRole = useCallback(
    (roles: string[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        hasRole,
        refreshUserDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
