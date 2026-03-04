import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Global interceptor for session robustness (Auto-logout on 401)
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    logout();
                    window.location.href = '/';
                }
                return Promise.reject(error);
            }
        );

        setLoading(false);
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const login = async (email, password) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Server connection refused' : 'Login failed')
            };
        }
    };

    const register = async (userData) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            return { success: true, data: response.data };
        } catch (error) {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            return {
                success: false,
                message: error.response?.data?.error || error.response?.data?.message || (error.code === 'ERR_NETWORK' ? `Connection refused at ${API_URL}` : 'Registration failed')
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateProfile = async (profileData) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            const response = await axios.put(`${API_URL}/auth/updatedetails`, profileData);

            if (response.data.success) {
                const updatedUser = response.data.data;
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                return { success: true, data: updatedUser };
            }
            return { success: false, message: 'Update failed' };
        } catch (error) {
            console.error('Profile update error full response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.error || 'Database connection error'
            };
        }
    };

    const updateUser = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
