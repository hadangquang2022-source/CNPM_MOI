import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Menu, LogOut, User, Users, UserPlus, Home, Bell, LogIn, UserPlus as RegisterIcon, X, Package, ShoppingCart, Store, ClipboardList, FileText, Heart, History } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cartCount = getCartCount();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left side - Logo and Navigation */}
                    <div className="flex items-center">
                        <Link to="/shop" className="flex-shrink-0 flex items-center">
                            <div className="h-8 w-8 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-sm">QS</span>
                            </div>
                            <span className="ml-2 text-xl font-semibold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">QuangStore</span>
                        </Link>

                        {/* Public Navigation Links */}
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            <Link
                                to="/shop"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-red-600 transition-colors"
                            >
                                <Store className="h-4 w-4 mr-2" />
                                Cửa hàng
                            </Link>

                            <Link
                                to="/track-order"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Tra cứu đơn
                            </Link>

                            <Link
                                to="/recently-viewed"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <History className="h-4 w-4 mr-2" />
                                Đã xem
                            </Link>

                            {/* Navigation Links - Only show when logged in */}
                            {user && (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <Home className="h-4 w-4 mr-2" />
                                        Dashboard
                                    </Link>


                                {/* Products - Admin only */}
                                {user.role?.name === 'Admin' && (
                                    <Link
                                        to="/products"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Sản phẩm
                                    </Link>
                                )}

                                {(user?.role?.name === 'Manager' || user?.role?.name === 'Admin') && (
                                    <Link
                                        to="/orders"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <ClipboardList className="h-4 w-4 mr-2" />
                                        Đơn hàng
                                    </Link>
                                )}

                                {(user?.role?.name === 'Manager' || user?.role?.name === 'Admin') && (
                                    <Link
                                        to="/users"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Users
                                    </Link>
                                )}

                                {user?.role?.name === 'Admin' && (
                                    <Link
                                        to="/users/create"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Create User
                                    </Link>
                                )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right side - User menu or Auth buttons */}
                    <div className="flex items-center space-x-4">
                        {/* Cart - Always visible */}
                        <Link 
                            to="/cart" 
                            className="relative p-1 rounded-full text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            <span className="sr-only">View cart</span>
                            <ShoppingCart className="h-6 w-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Wishlist - Only for logged in users */}
                        {user && (
                            <Link 
                                to="/wishlist" 
                                className="relative p-1 rounded-full text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                <span className="sr-only">View wishlist</span>
                                <Heart className="h-6 w-6" />
                            </Link>
                        )}

                        {user ? (
                            <>
                                {/* Notifications */}
                                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                    <span className="sr-only">View notifications</span>
                                    <Bell className="h-6 w-6" />
                                </button>

                                {/* User Profile Dropdown */}
                                <div className="relative group">
                                    <button className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 p-2 hover:bg-gray-50 transition-colors">
                                        <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-medium text-sm">
                                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user?.firstName} {user?.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {user?.role?.name || 'User'}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">
                                                {user?.firstName} {user?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <User className="h-4 w-4 mr-3" />
                                            Your Profile
                                        </Link>

                                        <Link
                                            to="/my-orders"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <FileText className="h-4 w-4 mr-3" />
                                            Đơn hàng của tôi
                                        </Link>

                                        <Link
                                            to="/wishlist"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <Heart className="h-4 w-4 mr-3" />
                                            Yêu thích
                                        </Link>

                                        <Link
                                            to="/recently-viewed"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <History className="h-4 w-4 mr-3" />
                                            Đã xem gần đây
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4 mr-3" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Show login/register buttons when not logged in */
                            <div className="hidden md:flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                                >
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    <RegisterIcon className="h-4 w-4 mr-2" />
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                            >
                                <span className="sr-only">Open main menu</span>
                                {mobileMenuOpen ? (
                                    <X className="block h-6 w-6" />
                                ) : (
                                    <Menu className="block h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                        {/* Shop link - Always visible */}
                        <Link
                            to="/shop"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:text-red-600 hover:bg-gray-50 transition-colors"
                        >
                            <Store className="h-5 w-5 mr-3" />
                            Cửa hàng
                        </Link>

                        <Link
                            to="/cart"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            <ShoppingCart className="h-5 w-5 mr-3" />
                            Giỏ hàng
                            {cartCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                >
                                    <Home className="h-5 w-5 mr-3" />
                                    Dashboard
                                </Link>

                                <Link
                                    to="/products"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                >
                                    <Package className="h-5 w-5 mr-3" />
                                    Sản phẩm
                                </Link>

                                {(user?.role?.name === 'Manager' || user?.role?.name === 'Admin') && (
                                    <Link
                                        to="/users"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                    >
                                        <Users className="h-5 w-5 mr-3" />
                                        Users
                                    </Link>
                                )}

                                {user?.role?.name === 'Admin' && (
                                    <Link
                                        to="/users/create"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                    >
                                        <UserPlus className="h-5 w-5 mr-3" />
                                        Create User
                                    </Link>
                                )}

                                <Link
                                    to="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                >
                                    <User className="h-5 w-5 mr-3" />
                                    Profile
                                </Link>

                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-5 w-5 mr-3" />
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                >
                                    <LogIn className="h-5 w-5 mr-3" />
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                >
                                    <RegisterIcon className="h-5 w-5 mr-3" />
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;