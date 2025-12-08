import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'quangstore_cart';

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch cart from API (for logged in users)
    const fetchCartFromAPI = useCallback(async () => {
        if (!user) return;
        
        try {
            setIsLoading(true);
            const response = await cartAPI.getCart();
            if (response.data.success) {
                const apiCart = response.data.data.cart;
                const items = apiCart.items?.map(item => ({
                    id: item.product.id,
                    cartItemId: item.id,
                    productName: item.product.productName,
                    price: parseFloat(item.price),
                    sku: item.product.sku,
                    category: item.product.category,
                    quantity: item.quantity,
                    stockQuantity: item.product.stockQuantity
                })) || [];
                setCartItems(items);
            }
        } catch (error) {
            console.error('Error fetching cart from API:', error);
            // Fallback to localStorage
            loadFromLocalStorage();
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Load from localStorage (for guests)
    const loadFromLocalStorage = () => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
        }
    };

    // Save to localStorage (for guests)
    const saveToLocalStorage = (items) => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    };

    // Load cart on mount or when user changes
    useEffect(() => {
        if (user) {
            fetchCartFromAPI();
        } else {
            loadFromLocalStorage();
        }
        setIsLoaded(true);
    }, [user, fetchCartFromAPI]);

    // Save to localStorage when cart changes (for guests only)
    useEffect(() => {
        if (isLoaded && !user) {
            saveToLocalStorage(cartItems);
        }
    }, [cartItems, isLoaded, user]);

    // Add item to cart
    const addToCart = async (product, quantity = 1) => {
        if (user) {
            // Use API for logged in users
            try {
                setIsLoading(true);
                const response = await cartAPI.addToCart(product.id, quantity);
                if (response.data.success) {
                    await fetchCartFromAPI();
                    return { success: true };
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                return { success: false, error: error.response?.data?.message || 'Lỗi thêm vào giỏ hàng' };
            } finally {
                setIsLoading(false);
            }
        } else {
            // Use localStorage for guests
            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => item.id === product.id);
                
                if (existingItem) {
                    return prevItems.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                }
                
                return [...prevItems, {
                    id: product.id,
                    productName: product.productName,
                    price: product.price,
                    sku: product.sku,
                    category: product.Category?.categoryName || product.category || null,
                    quantity: quantity
                }];
            });
            return { success: true };
        }
    };

    // Remove item from cart
    const removeFromCart = async (productId) => {
        if (user) {
            try {
                setIsLoading(true);
                const item = cartItems.find(i => i.id === productId);
                if (item?.cartItemId) {
                    const response = await cartAPI.removeFromCart(item.cartItemId);
                    if (response.data.success) {
                        await fetchCartFromAPI();
                    }
                }
            } catch (error) {
                console.error('Error removing from cart:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
        }
    };

    // Update item quantity
    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        if (user) {
            try {
                setIsLoading(true);
                const item = cartItems.find(i => i.id === productId);
                if (item?.cartItemId) {
                    const response = await cartAPI.updateCartItem(item.cartItemId, newQuantity);
                    if (response.data.success) {
                        await fetchCartFromAPI();
                    }
                }
            } catch (error) {
                console.error('Error updating cart:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === productId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        if (user) {
            try {
                setIsLoading(true);
                const response = await cartAPI.clearCart();
                if (response.data.success) {
                    setCartItems([]);
                }
            } catch (error) {
                console.error('Error clearing cart:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setCartItems([]);
        }
    };

    // Get total number of items in cart
    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Get total price of cart
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Check if product is in cart
    const isInCart = (productId) => {
        return cartItems.some(item => item.id === productId);
    };

    // Get quantity of a specific product in cart
    const getItemQuantity = (productId) => {
        const item = cartItems.find(item => item.id === productId);
        return item ? item.quantity : 0;
    };

    // Sync localStorage cart to API when user logs in
    const syncCartToAPI = async () => {
        if (!user) return;
        
        const localCart = localStorage.getItem(CART_STORAGE_KEY);
        if (localCart) {
            const items = JSON.parse(localCart);
            if (items.length > 0) {
                try {
                    for (const item of items) {
                        await cartAPI.addToCart(item.id, item.quantity);
                    }
                    localStorage.removeItem(CART_STORAGE_KEY);
                    await fetchCartFromAPI();
                } catch (error) {
                    console.error('Error syncing cart:', error);
                }
            }
        }
    };

    // Sync cart when user logs in
    useEffect(() => {
        if (user && isLoaded) {
            syncCartToAPI();
        }
    }, [user]);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        isInCart,
        getItemQuantity,
        isLoaded,
        isLoading,
        refreshCart: fetchCartFromAPI
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;
