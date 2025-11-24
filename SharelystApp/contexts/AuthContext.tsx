/**
 * Authentication Context
 * Manages user authentication state across the application
 */

import React from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_URL, FALLBACK_API_URLS } from "../config/api";

// API Base URL - Automatically switches between development and deployment
const API_BASE_URL = API_URL;

// Token storage key
const TOKEN_KEY = "auth_token";
const NAV_PREFERENCE_KEY = "nav_preference";

interface User {
  id: number;
  username: string;
  email: string;
}

type NavigationPreference = "navbar" | "hamburger";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  navigationPreference: NavigationPreference;
  setNavigationPreference: (preference: NavigationPreference) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    username: string,
    firstName: string,
    lastName: string,
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
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [navigationPreference, setNavigationPreferenceState] = React.useState<NavigationPreference>("navbar");

  // Load token and navigation preference from secure storage on mount
  React.useEffect(() => {
    loadToken();
    loadNavigationPreference();
  }, []);

  /**
   * Load navigation preference from secure storage
   */
  const loadNavigationPreference = async () => {
    try {
      const storedPreference = await SecureStore.getItemAsync(NAV_PREFERENCE_KEY);
      if (storedPreference === "navbar" || storedPreference === "hamburger") {
        setNavigationPreferenceState(storedPreference);
      }
    } catch (error) {
      console.error("Error loading navigation preference:", error);
    }
  };

  /**
   * Update navigation preference
   */
  const setNavigationPreference = async (preference: NavigationPreference) => {
    try {
      await SecureStore.setItemAsync(NAV_PREFERENCE_KEY, preference);
      setNavigationPreferenceState(preference);
    } catch (error) {
      console.error("Error saving navigation preference:", error);
    }
  };

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

      const requestBody = {
        identifier,
        password,
      };

      let response;
      let lastError;
      const urlsToTry = [API_BASE_URL, ...FALLBACK_API_URLS];

      // Try primary URL first, then fallbacks
      for (let i = 0; i < urlsToTry.length; i++) {
        const currentUrl = urlsToTry[i];
        try {
          console.log(`Attempting login with URL (${i + 1}/${urlsToTry.length}):`, `${currentUrl}/auth/login`);
          
          response = await axios.post(`${currentUrl}/auth/login`, requestBody, {
            timeout: 8000, // 8 second timeout per attempt
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          console.log("Login successful!");
          break; // Success, exit the loop
        } catch (attemptError: any) {
          lastError = attemptError;
          console.log(`URL ${i + 1} failed:`, attemptError.message);
          
          // If this is the last URL, throw the error
          if (i === urlsToTry.length - 1) {
            throw attemptError;
          }
          // Otherwise, continue to next URL
        }
      }

      if (!response) {
        throw lastError || new Error("All connection attempts failed");
      }

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
        code: error.code,
      });
      
      // Provide more helpful error messages based on error type
      let errorMessage = "Invalid credentials";
      
      if (error.message?.includes("timeout")) {
        errorMessage = "Connection timeout. Please check if the backend server is running.";
      } else if (error.message?.includes("Network Error") || error.code === "ECONNREFUSED") {
        errorMessage = "Cannot connect to server. Please ensure the backend is running.";
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid username or password";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
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
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    // Prevent double registration
    if (isRegistering) {
      console.log("Registration already in progress, skipping duplicate call");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      setIsRegistering(true);

      console.log("Registering user with:", { username, firstName, lastName, email });
      console.log("API URL:", `${API_BASE_URL}/auth/register`);

      const requestBody = {
        username,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      };

      let response;
      let lastError;
      
      // Try primary URL first
      try {
        response = await axios.post(`${API_BASE_URL}/auth/register`, requestBody, {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (primaryError: any) {
        console.log("Primary URL failed, trying fallbacks...");
        lastError = primaryError;
        
        // Try fallback URLs
        for (const fallbackUrl of FALLBACK_API_URLS) {
          try {
            console.log("Trying fallback URL:", `${fallbackUrl}/auth/register`);
            response = await axios.post(`${fallbackUrl}/auth/register`, requestBody, {
              timeout: 15000,
              headers: { 'Content-Type': 'application/json' },
            });
            console.log("Fallback URL succeeded!");
            break;
          } catch (fallbackError: any) {
            console.log("Fallback URL failed:", fallbackUrl);
            lastError = fallbackError;
          }
        }
        
        if (!response) {
          throw lastError;
        }
      }

      console.log("Registration response:", response.data);

      if (response.data.success) {
        // Registration successful - don't auto-login, let user go to login page
        console.log("User registered successfully, navigate to login");
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
      setIsRegistering(false);
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
    navigationPreference,
    setNavigationPreference,
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
