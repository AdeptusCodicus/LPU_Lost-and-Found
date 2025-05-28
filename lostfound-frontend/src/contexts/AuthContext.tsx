import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../services/api';

interface User {
    id: string | number;
    email: string;
    username?: string;
}

interface AuthResponseData {
    user: User;
    token: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    authError: string | null;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserContext: (updatedUser: User) => void;
    clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      setIsLoading(true);
      setAuthError(null);
      try {
        const storedUserJson = await SecureStore.getItemAsync('userSession');
        const token = await SecureStore.getItemAsync('userToken');

        if (storedUserJson && token) {
          const storedUser: User = JSON.parse(storedUserJson);
          setUser(storedUser);
        } else {
          await SecureStore.deleteItemAsync('userSession');
          await SecureStore.deleteItemAsync('userToken');
          setUser(null);
        }
      } catch (e) {
        console.error("Failed to load user session from storage", e);
        await SecureStore.deleteItemAsync('userSession');
        await SecureStore.deleteItemAsync('userToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserFromStorage();
  }, []);

  const clearAuthError= () => {
    setAuthError(null);
  };

  const login = async (emailInput: string, passwordInput: string) => {
    setIsLoading(true);
    setAuthError(null); // <-- Clear previous auth error on new login attempt
    console.log('AuthContext: Attempting login...');
    try {
      const response = await apiClient.post<AuthResponseData>('/auth/login', {
        email: emailInput,
        password: passwordInput,
      });

      const { user: loggedInUser, token } = response.data;

      if (!token || typeof token !== 'string') {
        console.error('AuthContext: Invalid or missing token received.');
        setAuthError('Login failed: Server response incomplete (token).');
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userSession');
        setUser(null);
        return; // Exit if critical data is missing
      }
      if (!loggedInUser || typeof loggedInUser !== 'object') {
        console.error('AuthContext: Invalid or missing user object received.');
        setAuthError('Login failed: Server response incomplete (user).');
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userSession');
        setUser(null);
        return; 
      }

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userSession', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      console.log('AuthContext: Login successful.');

    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      console.error("AuthContext: Login API failed.", errorMessage, error.response?.data || error);
      setAuthError(errorMessage); // <-- Set authError instead of throwing
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userSession');
      setUser(null);
      // Do NOT throw error here anymore, LoginScreen will read authError
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Login attempt finished, isLoading set to false.');
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setAuthError(null); // Clear any auth error on logout
    try {
      console.log("AuthContext: Logging out user...");
      // Optional: Call API to invalidate token on server
      // await apiClient.post('/auth/logout');
    } catch (apiError) {
      console.error("AuthContext: API logout failed (continuing with local logout):", apiError);
      // You might want to set an authError here if API logout is critical
      // setAuthError("Logout failed to complete on server.");
    } finally {
      try {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userSession');
        setUser(null);
        console.log("AuthContext: User session cleared from storage.");
      } catch (storageError) {
        console.error("AuthContext: Failed to clear user session from storage during logout", storageError);
        // Potentially set an error here if local cleanup fails critically
        // setAuthError("Failed to clear local session during logout.");
      } finally {
        setIsLoading(false);
        console.log('AuthContext: Logout finished, isLoading set to false.');
      }
    }
  };

  const updateUserContext = (updatedUser: User) => {
    setUser(updatedUser);
    SecureStore.setItemAsync('userSession', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, authError, login, logout, updateUserContext, clearAuthError }}>
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