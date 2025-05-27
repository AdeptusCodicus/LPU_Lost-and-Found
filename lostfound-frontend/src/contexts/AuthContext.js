// filepath: d:\School\ADML32C\LPU_LAF\lostfound-frontend\src\contexts\AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import API_CONFIG from '../config/api'; // Your API configuration
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // User object
    const [token, setToken] = useState(null); // Auth token
    const [isLoading, setIsLoading] = useState(true); // To check if we are still loading token from storage

    useEffect(() => {
        // Load token from secure store on app start
        const bootstrapAsync = async () => {
            let userToken;
            try {
                userToken = await SecureStore.getItemAsync('userToken');
                // Here you might also want to fetch user data if token exists
                // For now, just setting the token
                if (userToken) {
                    setToken(userToken);
                    // TODO: Optionally, verify token with backend and fetch user data
                    // For simplicity, we'll assume token means user is "logged in" for now
                    // setUser({ name: "Stored User" }); // Placeholder
                }
            } catch (e) {
                console.error('Restoring token failed', e);
            }
            setIsLoading(false);
          //setToken('fake-test-token');
         // setUser({ name: "Test User" });
        };

        bootstrapAsync();
    }, []);

    const login = async (email, password) => {
        try {
            // TODO: Replace with actual API call
            console.log('Attempting login with:', email, password);
            // const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
            //     email,
            //     password,
            // });
            // const { token: newToken, user: userData } = response.data;

            // Mock successful login for now
            const newToken = 'mock-jwt-token';
            const userData = { id: '123', email: email, name: 'Mock User' };

            await SecureStore.setItemAsync('userToken', newToken);
            setToken(newToken);
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error.message);
            // Handle error (e.g., show message to user)
            return { success: false, error: error.response ? error.response.data.message : 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
        } catch (e) {
            console.error('Deleting token failed', e);
        }
        setToken(null);
        setUser(null);
    };

    // We'll add register, forgotPassword, etc. here later

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};