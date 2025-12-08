import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import AppLayout from "./components/layout/AppLayout";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserList from "./pages/users/UserList";
import UserCreate from "./pages/users/UserCreate";
import UserEdit from "./pages/users/UserEdit";
import ProductList from "./pages/products/ProductList";
import ProductCreate from "./pages/products/ProductCreate";
import ProductEdit from "./pages/products/ProductEdit";
import Shop from "./pages/shop/Shop";
import ProductDetail from "./pages/shop/ProductDetail";
import Cart from "./pages/shop/Cart";
import Checkout from "./pages/shop/Checkout";
import Wishlist from "./pages/shop/Wishlist";
import RecentlyViewed from "./pages/shop/RecentlyViewed";
import OrderList from "./pages/orders/OrderList";
import MyOrders from "./pages/orders/MyOrders";
import TrackOrder from "./pages/orders/TrackOrder";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <AuthProvider>
            <CartProvider>
            <Router
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}
            >
                <AppLayout>
                    <Routes>
                        {/* Public Routes */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />

                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />

                        <Route
                            path="/forgot-password"
                            element={
                                <PublicRoute>
                                    <ForgotPassword />
                                </PublicRoute>
                            }
                        />

                        <Route
                            path="/reset-password/:token"
                            element={
                                <PublicRoute>
                                    <ResetPassword />
                                </PublicRoute>
                            }
                        />

                        {/* Shop Routes - Public */}
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/shop/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/my-orders" element={<MyOrders />} />
                        <Route path="/track-order" element={<TrackOrder />} />
                        <Route path="/recently-viewed" element={<RecentlyViewed />} />

                        {/* Protected Shop Routes */}
                        <Route
                            path="/wishlist"
                            element={
                                <ProtectedRoute>
                                    <Wishlist />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />

                        {/* Manager / Admin Routes */}
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute requiredRole="Manager">
                                    <UserList />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/users/create"
                            element={
                                <ProtectedRoute requiredRole="Admin">
                                    <UserCreate />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/users/edit/:id"
                            element={
                                <ProtectedRoute requiredRole="Admin">
                                    <UserEdit />
                                </ProtectedRoute>
                            }
                        />


                        {/* Product Management - Admin only */}
                        <Route
                            path="/products"
                            element={
                                <ProtectedRoute requiredRole="Admin">
                                    <ProductList />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/products/create"
                            element={
                                <ProtectedRoute requiredRole="Admin">
                                    <ProductCreate />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/products/edit/:id"
                            element={
                                <ProtectedRoute requiredRole="Admin">
                                    <ProductEdit />
                                </ProtectedRoute>
                            }
                        />

                        {/* Order Management - Admin/Manager */}
                        <Route
                            path="/orders"
                            element={
                                <ProtectedRoute requiredRole="Manager">
                                    <OrderList />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default */}
                        <Route path="/" element={<Navigate to="/shop" replace />} />
                        <Route path="*" element={<Navigate to="/shop" replace />} />
                    </Routes>

                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: "#363636",
                                color: "#fff"
                            }
                        }}
                    />
                </AppLayout>
            </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
