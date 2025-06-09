import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Configuration
const API_BASE_URL = 'https://lpu-lostfound-tyh24.ondigitalocean.app';
const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_USER_KEY = 'adminUser';

interface AdminUser {
  email: string;
  username: string;
}

interface AuthResponseData {
  token: string;
  user?: AdminUser;
  message?: string;
  error?: string;
}

interface AuthContextType {
  token: string | null;
  admin: AdminUser | null;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): React.ReactElement => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const storedUser = localStorage.getItem(ADMIN_USER_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Basic validation for stored user data
        if (parsedUser && typeof parsedUser.email === 'string' && typeof parsedUser.username === 'string') {
          return parsedUser as AdminUser;
        }
        // If data is invalid, remove it
        localStorage.removeItem(ADMIN_USER_KEY);
      } catch (e) {
        console.error("Failed to parse admin user from localStorage on init", e);
        localStorage.removeItem(ADMIN_USER_KEY);
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const storedUserJson = localStorage.getItem(ADMIN_USER_KEY);

    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      if (storedUserJson) {
        try {
          const parsedUser = JSON.parse(storedUserJson);
          // Validate the parsed user to ensure it matches AdminUser structure
          if (parsedUser && typeof parsedUser.email === 'string' && typeof parsedUser.username === 'string') {
            setAdmin(parsedUser as AdminUser);
          } else {
            // If data is invalid, clear it and log a warning
            console.warn("Invalid admin user data found in localStorage during useEffect.");
            localStorage.removeItem(ADMIN_USER_KEY);
            setAdmin(null); // Ensure admin state is cleared
          }
        } catch (e) {
          console.error("Failed to parse admin user from localStorage in useEffect", e);
          localStorage.removeItem(ADMIN_USER_KEY); // Clear corrupted data
          setAdmin(null);
        }
      }
      // If only token is stored, admin might remain null if not set above, which is fine.
    }
    setIsLoading(false);
  }, []);

  const login = async (emailInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post<AuthResponseData>(`${API_BASE_URL}/auth/login`, {
        email: emailInput,
        password: passwordInput,
      });

      if (response.data && response.data.token) {
        const receivedToken = response.data.token;
        setToken(receivedToken);
        localStorage.setItem(ADMIN_TOKEN_KEY, receivedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;

        // Ensure userDetails always conforms to AdminUser or is null
        let userDetailsToSet: AdminUser | null = null;
        if (response.data.user && typeof response.data.user.email === 'string' && typeof response.data.user.username === 'string') {
          userDetailsToSet = response.data.user;
        } else {
          // If backend doesn't provide a full user, create one with defaults or handle as error
          // For now, providing a default username if only email is somehow part of a partial user object (though response.data.user should be AdminUser)
          // Or, if user object is missing entirely, create one from input email and a default username.
          userDetailsToSet = { email: emailInput, username: response.data.user?.username || "Admin" }; // Ensure username is present
        }
        
        setAdmin(userDetailsToSet);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(userDetailsToSet));

        setIsLoading(false);
        return true;
      } else {
        setAuthError(response.data.error || response.data.message || 'Login failed: No token received.');
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setAuthError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/Login');
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ token, admin, isLoading, authError, login, logout, clearAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};