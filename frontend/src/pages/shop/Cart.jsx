import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ShoppingCart, 
    Trash2, 
    Plus, 
    Minus, 
    ArrowLeft, 
    ShoppingBag,
    Package,
    CreditCard,
    Truck,
    Tag,
    Loader2
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, isLoading, isLoaded } = useCart();

    const formatPrice = (price) => {
        if (!price) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Giỏ hàng trống!');
            return;
        }
        // Navigate to checkout page
        toast.success('Đang chuyển đến trang thanh toán...');
        navigate('/checkout');
    };

    const subtotal = getCartTotal();
    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white">
                <div className="absolute inset-0 overflow-hidden">
                    <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="15%" cy="40%" r="4" fill="rgba(255,255,255,0.2)" className="animate-float" />
                        <circle cx="85%" cy="30%" r="6" fill="rgba(255,255,255,0.15)" className="animate-float" style={{ animationDelay: '1s' }} />
                    </svg>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        Tiếp tục mua sắm
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Giỏ hàng của bạn</h1>
                            <p className="text-white/80">{cartItems.length} sản phẩm</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Loading State */}
                {isLoading && (
                    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3">
                            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                            <span className="text-gray-700 font-medium">Đang xử lý...</span>
                        </div>
                    </div>
                )}

                {!isLoaded ? (
                    /* Loading skeleton */
                    <div className="animate-pulse">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white/80 rounded-2xl p-4 flex gap-4">
                                        <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white/80 rounded-2xl p-6 h-64">
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : cartItems.length === 0 ? (
                    /* Empty Cart */
                    <div className="text-center py-20 animate-fadeIn">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
                        <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/30"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Khám phá sản phẩm
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4 flex gap-4 animate-fadeInUp"
                                    style={{ animationDelay: `${0.05 * index}s` }}
                                >
                                    {/* Product Image */}
                                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Package className="w-10 h-10 text-gray-300" />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <Link 
                                                    to={`/shop/product/${item.id}`}
                                                    className="font-semibold text-gray-900 hover:text-red-600 transition-colors line-clamp-1"
                                                >
                                                    {item.productName}
                                                </Link>
                                                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                                {item.category && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-600 mt-1">
                                                        <Tag className="w-3 h-3" />
                                                        {item.category}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    removeFromCart(item.id);
                                                    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            {/* Quantity */}
                                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <p className="text-lg font-bold text-red-600">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Clear Cart Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        clearCart();
                                        toast.success('Đã xóa tất cả sản phẩm');
                                    }}
                                    className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa tất cả
                                </button>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 sticky top-4 animate-fadeInRight">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tạm tính ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm)</span>
                                        <span className="font-medium">{formatPrice(subtotal)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Truck className="w-4 h-4" />
                                            Phí vận chuyển
                                        </span>
                                        <span className="font-medium">
                                            {shippingFee === 0 ? (
                                                <span className="text-green-600">Miễn phí</span>
                                            ) : (
                                                formatPrice(shippingFee)
                                            )}
                                        </span>
                                    </div>

                                    {subtotal < 500000 && (
                                        <p className="text-sm text-orange-600 bg-orange-50 rounded-lg p-3">
                                            💡 Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí vận chuyển
                                        </p>
                                    )}

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between text-lg">
                                            <span className="font-bold text-gray-900">Tổng cộng</span>
                                            <span className="font-bold text-2xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                                {formatPrice(total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:from-red-600 hover:via-red-700 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Tiến hành thanh toán
                                </button>

                                {/* Trust Badges */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Truck className="w-4 h-4 text-green-600" />
                                            </div>
                                            <span>Giao hàng nhanh</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <CreditCard className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span>Thanh toán an toàn</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
