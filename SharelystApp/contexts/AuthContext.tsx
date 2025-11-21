/**
 * Authentication Context
 * Manages user authentication state across the application
 */

import React from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { Platform } from "react-native";

// API Base URL - Configured for different platforms
// For Android Emulator: use 10.0.2.2
// For iOS Simulator: use localhost
// For Physical Device: use your computer's IP address (e.g., http://192.168.1.x:3000/api)
const getApiBaseUrl = () => {
  if (Platform.OS === "android") {
    // Use this for Android Emulator
    return "http://10.0.2.2:3000/api";
  }
  // For iOS Simulator/Physical Devices - use your machine's actual IP
  // Change this to localhost if running on iOS Simulator and it doesn't work
  return "http://192.168.2.19:3000/api";
};

const API_BASE_URL = getApiBaseUrl();

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
        // Verify token with backend
        const response = await axios.post(
          `${API_BASE_URL}/auth/verify`,
          {},
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );

        if (response.data.success) {
          setToken(storedToken);
          setUser(response.data.data);
        } else {
          // Token is invalid, remove it
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      }
    } catch (error) {
      console.error("Error loading token:", error);
      // If verification fails, remove the token
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } finally {
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
        timeout: 10000, // 10 second timeout
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
      
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
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
        timeout: 10000, // 10 second timeout
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
