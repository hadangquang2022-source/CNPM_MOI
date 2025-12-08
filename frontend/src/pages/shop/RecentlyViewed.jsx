import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Package, Trash2, Loader2, History, ArrowLeft, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { productViewAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';

const RecentlyViewed = () => {
    const [viewedItems, setViewedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);
    const { addToCart } = useCart();

    // Generate or get session ID for anonymous tracking
    const getSessionId = () => {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    };

    useEffect(() => {
        fetchRecentlyViewed();
    }, []);

    const fetchRecentlyViewed = async () => {
        try {
            setLoading(true);
            const sessionId = getSessionId();
            const response = await productViewAPI.getRecentlyViewed(20, sessionId);
            setViewedItems(response.data.data || []);
        } catch (error) {
            console.error('Error fetching recently viewed:', error);
            toast.error('Không thể tải sản phẩm đã xem');
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        try {
            setClearing(true);
            await productViewAPI.clearViewHistory();
            setViewedItems([]);
            toast.success('Đã xóa lịch sử xem');
        } catch (error) {
            console.error('Error clearing history:', error);
            if (error.response?.status === 401) {
                toast.error('Vui lòng đăng nhập để xóa lịch sử');
            } else {
                toast.error('Không thể xóa lịch sử');
            }
        } finally {
            setClearing(false);
        }
    };

    const handleAddToCart = (product) => {
        if (product.stockQuantity > 0) {
            addToCart(product, 1);
            toast.success('Đã thêm vào giỏ hàng');
        } else {
            toast.error('Sản phẩm đã hết hàng');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const viewedDate = new Date(date);
        const diffMs = now - viewedDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return viewedDate.toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải sản phẩm đã xem...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/shop"
                        className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Tiếp tục mua sắm
                    </Link>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                <History className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Sản phẩm đã xem
                                </h1>
                                <p className="text-gray-600">
                                    {viewedItems.length} sản phẩm
                                </p>
                            </div>
                        </div>
                        {viewedItems.length > 0 && (
                            <button
                                onClick={handleClearHistory}
                                disabled={clearing}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {clearing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Trash2 className="w-5 h-5" />
                                )}
                                Xóa lịch sử
                            </button>
                        )}
                    </div>
                </div>

                {viewedItems.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
                        <Eye className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Chưa có sản phẩm đã xem
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Các sản phẩm bạn đã xem sẽ được hiển thị ở đây
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                        >
                            <Package className="w-5 h-5" />
                            Khám phá sản phẩm
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {viewedItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Product Image */}
                                <Link to={`/shop/product/${item.product?.id}`} className="block relative">
                                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <Package className="w-16 h-16 text-gray-400" />
                                    </div>
                                    {/* Time badge */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-gray-600 shadow">
                                        <Clock className="w-3 h-3" />
                                        {formatTimeAgo(item.viewedAt)}
                                    </div>
                                    {/* Stock badge */}
                                    {item.product?.stockQuantity <= 0 && (
                                        <div className="absolute bottom-3 left-3 px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                                            Hết hàng
                                        </div>
                                    )}
                                </Link>

                                {/* Product Info */}
                                <div className="p-4">
                                    <Link to={`/shop/product/${item.product?.id}`}>
                                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-red-600 transition-colors">
                                            {item.product?.productName}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 mb-2">
                                        SKU: {item.product?.sku}
                                    </p>
                                    {item.product?.category && (
                                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full mb-3">
                                            {item.product.category}
                                        </span>
                                    )}
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xl font-bold text-red-600">
                                            {formatPrice(item.product?.price || 0)}
                                        </span>
                                        <button
                                            onClick={() => handleAddToCart(item.product)}
                                            disabled={item.product?.stockQuantity <= 0}
                                            className="p-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Mobile Clear Button */}
                {viewedItems.length > 0 && (
                    <div className="fixed bottom-4 left-4 right-4 sm:hidden">
                        <button
                            onClick={handleClearHistory}
                            disabled={clearing}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-red-600 rounded-xl shadow-xl font-semibold border border-red-200 disabled:opacity-50"
                        >
                            {clearing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                            Xóa lịch sử xem
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentlyViewed;
