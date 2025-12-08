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
    getSimilarProducts: (id, limit = 8) => api.get(`/products/${id}/similar`, { params: { limit } }),
    getProductStats: (id) => api.get(`/products/${id}/stats`),
};

// Order API endpoints
export const orderAPI = {
    createOrder: (data) => api.post('/orders', data),
    getOrders: (params) => api.get('/orders', { params }),
    getOrderById: (id) => api.get(`/orders/${id}`),
    trackOrder: (code) => api.get(`/orders/track/${code}`),
    getMyOrders: (params) => api.get('/orders/my-orders', { params }),
    updateOrderStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
    cancelOrder: (id, data) => api.post(`/orders/${id}/cancel`, data),
    getOrderStats: () => api.get('/orders/stats'),
};

// Cart API endpoints
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addToCart: (productId, quantity = 1) => api.post('/cart/add', { productId, quantity }),
    updateCartItem: (itemId, quantity) => api.put(`/cart/item/${itemId}`, { quantity }),
    removeFromCart: (itemId) => api.delete(`/cart/item/${itemId}`),
    clearCart: () => api.delete('/cart/clear'),
};

// Wishlist API endpoints
export const wishlistAPI = {
    getWishlist: () => api.get('/wishlist'),
    addToWishlist: (productId) => api.post('/wishlist', { productId }),
    removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
    toggleWishlist: (productId) => api.post(`/wishlist/toggle/${productId}`),
    checkWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
};

// Product View API endpoints
export const productViewAPI = {
    recordView: (productId, sessionId) => api.post(`/product-views/${productId}`, {}, {
        headers: sessionId ? { 'X-Session-Id': sessionId } : {}
    }),
    getRecentlyViewed: (limit = 10, sessionId) => api.get('/product-views/recent', {
        params: { limit },
        headers: sessionId ? { 'X-Session-Id': sessionId } : {}
    }),
    getViewCount: (productId) => api.get(`/product-views/count/${productId}`),
    clearViewHistory: () => api.delete('/product-views/history'),
};

// Review API endpoints
export const reviewAPI = {
    getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
    getReviewCount: (productId) => api.get(`/reviews/count/${productId}`),
    createReview: (data) => api.post('/reviews', data),
    updateReview: (id, data) => api.put(`/reviews/${id}`, data),
    deleteReview: (id) => api.delete(`/reviews/${id}`),
    getUserReview: (productId) => api.get(`/reviews/my-review/${productId}`),
    markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
};

// General API for health check
export const healthAPI = {
    check: () => api.get('/health'),
};

export default api;