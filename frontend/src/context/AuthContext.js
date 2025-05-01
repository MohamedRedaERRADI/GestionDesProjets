import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const checkAuth = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            console.log('Checking auth status with token:', token);
            const response = await api.get('/api/auth/user');
            console.log('Auth check response:', response.status);
            setUser(response.data);
        } catch (error) {
            console.error('Error checking auth status:', error);
            handleLogout();
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const login = async (email, password) => {
        try {
            // S'assurer d'avoir un CSRF token
            await api.get('/sanctum/csrf-cookie');

            const response = await api.post('/api/auth/login', { email, password });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                setToken(response.data.token);
                setUser(response.data.user);
                return { success: true };
            } else {
                return { 
                    success: false, 
                    error: response.data.message || 'Login failed' 
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'An error occurred during login' 
            };
        }
    };

    const register = async (userData) => {
        try {
            // S'assurer d'avoir un CSRF token
            await api.get('/sanctum/csrf-cookie');

            const response = await api.post('/api/auth/register', userData);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                setToken(response.data.token);
                setUser(response.data.user);
                return { success: true };
            } else {
                return { 
                    success: false, 
                    error: response.data.message || 'Registration failed' 
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'An error occurred during registration' 
            };
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/api/auth/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            handleLogout();
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 