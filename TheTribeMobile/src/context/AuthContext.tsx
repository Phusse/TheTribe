// Auth Context for TheTribe Mobile
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { STORAGE_KEYS } from '../services/api';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    register: (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await apiService.login(email, password);

            if (response.success) {
                const { accessToken, refreshToken, user: userData } = response.data;

                await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
                await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

                setUser(userData);
                return { success: true };
            }

            return { success: false, error: response.message || 'Login failed' };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Network error',
            };
        }
    };

    const logout = async () => {
        await apiService.clearTokens();
        setUser(null);
    };

    const register = async (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) => {
        try {
            const response = await apiService.register(data);

            if (response.success) {
                return { success: true };
            }

            return { success: false, error: response.message || 'Registration failed' };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Network error',
            };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                register,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
