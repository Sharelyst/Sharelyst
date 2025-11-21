/**
 * Authentication Context
 * Manages user authentication state across the application
 */

import React from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

// API Base URL - Production backend hosted on Render
// This makes the frontend completely independent from any local backend setup
const API_BASE_URL = "https://sharelystbackend.onrender.com/api";

// Token storage key
const TOKEN_KEY = "auth_token";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load token from secure storage on mount
  React.useEffect(() => {
    loadToken();
  }, []);

  /**
   * Load token from secure storage and verify it
   */
  const loadToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      
      if (storedToken) {
        // Optimistically set token to unblock UI
        setToken(storedToken);
        setIsLoading(false);
        
        // Verify token with backend in background
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/verify`,
            {},
            {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
              timeout: 5000, // 5 second timeout
            }
          );

          if (response.data.success) {
            setUser(response.data.data);
          } else {
            // Token is invalid, clear auth state
            setToken(null);
            setUser(null);
            await SecureStore.deleteItemAsync(TOKEN_KEY);
          }
        } catch (verifyError) {
          console.error("Token verification failed:", verifyError);
          // Keep user logged in but without user data
          // The user data will be fetched on next successful API call
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading token:", error);
      setIsLoading(false);
    }
  };

  /**
   * Login user with username/email and password
   */
  const login = async (identifier: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      console.log("Logging in user:", identifier);
      console.log("API URL:", `${API_BASE_URL}/auth/login`);

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        identifier,
        password,
      }, {
        timeout: 15000, // 15 second timeout for slower connections
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Login response:", response.data);

      if (response.data.success) {
        const { token: newToken, ...userData } = response.data.data;
        
        // Store token securely
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        
        setToken(newToken);
        setUser(userData);
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Show generic error message to user for security
      const errorMessage = "Invalid credentials";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      console.log("Registering user with:", { username, email });
      console.log("API URL:", `${API_BASE_URL}/auth/register`);

      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
        confirmPassword,
      }, {
        timeout: 15000, // 15 second timeout for slower connections
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Registration response:", response.data);

      if (response.data.success) {
        const { token: newToken, ...userData } = response.data.data;
        
        // Store token securely
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        
        setToken(newToken);
        setUser(userData);
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Remove token from secure storage
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      
      setToken(null);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use authentication context
 */
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
