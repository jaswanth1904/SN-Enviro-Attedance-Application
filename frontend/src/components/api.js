import axios from 'axios';

/**
 * Dynamically resolves the base API URL.
 * In production (e.g. attendance.snenviro.org), if VITE_API_URL is unset or incorrectly points to localhost,
 * it automatically uses the browser's current origin + '/api' to ensure client calls always reach the server.
 */
export const getBaseApiUrl = () => {
    const defaultProdApi = 'https://sn-enviro-attedance-application.onrender.com/api';
    if (typeof window !== 'undefined' && window.location && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        const envUrl = import.meta.env.VITE_API_URL;
        if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
            return defaultProdApi;
        }
        const cleaned = envUrl.replace(/\/+$/, '');
        return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
    }
    const raw = (import.meta.env.VITE_API_URL || 'http://localhost:5002').replace(/\/+$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
};

/**
 * Returns the root WebSocket URL (stripping '/api')
 */
export const getSocketUrl = () => {
    return getBaseApiUrl().replace(/\/api$/, '');
};

const api = axios.create({
    baseURL: getBaseApiUrl(),
});

// Add a request interceptor to include the bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for automatic 401 handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/?error=session_expired';
        }
        return Promise.reject(error);
    }
);

export default api;
