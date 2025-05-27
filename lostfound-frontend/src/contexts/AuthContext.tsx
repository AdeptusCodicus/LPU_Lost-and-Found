import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../services/api';

interface User {
    id: string | number;
    email: string;
}

interface AuthResponseData {
    user: User;
    token: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      setIsLoading(true);
      try {
        const storedUserJson = await SecureStore.getItemAsync('userSession');
        const token = await SecureStore.getItemAsync('userToken');

        if (storedUserJson && token) {
          const storedUser: User = JSON.parse(storedUserJson);
          setUser(storedUser);
        } else {
          await SecureStore.deleteItemAsync('userSession');
          await SecureStore.deleteItemAsync('userToken');
        }
      } catch (e) {
        console.error("Failed to load user session from storage", e);
        await SecureStore.deleteItemAsync('userSession');
        await SecureStore.deleteItemAsync('userToken');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserFromStorage();
  }, []);

  const login = async (emailInput: string, passwordInput: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponseData>('/auth/login', {
        email: emailInput,
        password: passwordInput,
      });

      const { user: loggedInUser, token } = response.data;

      if (!token || typeof token !== 'string') {
        throw new Error('Invalid or missing token received from server.');
      }
      if (!loggedInUser || typeof loggedInUser !== 'object') {
        throw new Error('Invalid or missing user object received from server.');
      }

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userSession', JSON.stringify(loggedInUser));
      setUser(loggedInUser);

    } catch (error: any) {
      console.error("Login API failed", error.response?.data || error.message || error);
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userSession');
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("Logging out user");
    } catch (apiError) {
      console.error("API logout failed (continuing with local logout):", apiError);
    } finally {
      try {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userSession');
        setUser(null);
      } catch (storageError) {
        console.error("Failed to clear user session from storage during logout", storageError);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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