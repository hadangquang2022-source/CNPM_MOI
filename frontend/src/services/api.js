import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add authorization token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 unauthorized errors
        if (error.response?.status === 401) {
            const isAuthRequest = error.config?.url?.includes('/auth/login') ||
                                  error.config?.url?.includes('/auth/register') ||
                                  error.config?.url?.includes('/auth/forgot-password') ||
                                  error.config?.url?.includes('/auth/reset-password');

            // Don't redirect for auth requests - let the component handle it
            if (!isAuthRequest) {
                // Token expired or invalid, clear and redirect
                Cookies.remove('token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Auth API endpoints
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
};

// User API endpoints
export const userAPI = {
    getUsers: (params) => api.get('/users', { params }),
    getUserById: (id) => api.get(`/users/${id}`),
    createUser: (formData) => api.post('/users', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
    toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`),
    getRoles: () => api.get('/users/roles'),
    getPositions: () => api.get('/users/positions'),
};

// Product API endpoints
export const productAPI = {
    getProducts: (params) => api.get('/products', { params }),
    getProductById: (id) => api.get(`/products/${id}`),
    createProduct: (data) => api.post('/products', data),
    updateProduct: (id, data) => api.put(`/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/products/${id}`),
    getCategories: () => api.get('/products/categories'),
    getProductsByCategory: (category, params) => api.get(`/products/category/${category}`, { params }),
};

// General API for health check
export const healthAPI = {
    check: () => api.get('/health'),
};

export default api;