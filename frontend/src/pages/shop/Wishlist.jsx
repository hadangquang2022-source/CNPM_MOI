import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package, Loader2, HeartOff, ArrowLeft, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { wishlistAPI, productAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await wishlistAPI.getWishlist();
            setWishlistItems(response.data.data || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            toast.error('Không thể tải danh sách yêu thích');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            setRemovingId(productId);
            await wishlistAPI.removeFromWishlist(productId);
            setWishlistItems(prev => prev.filter(item => item.productId !== productId));
            toast.success('Đã xóa khỏi danh sách yêu thích');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Không thể xóa sản phẩm');
        } finally {
            setRemovingId(null);
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

    const handleAddAllToCart = () => {
        const availableItems = wishlistItems.filter(item => item.product?.stockQuantity > 0);
        if (availableItems.length === 0) {
            toast.error('Không có sản phẩm nào còn hàng');
            return;
        }
        availableItems.forEach(item => {
            addToCart(item.product, 1);
        });
        toast.success(`Đã thêm ${availableItems.length} sản phẩm vào giỏ hàng`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải danh sách yêu thích...</p>
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
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Sản phẩm yêu thích
                                </h1>
                                <p className="text-gray-600">
                                    {wishlistItems.length} sản phẩm
                                </p>
                            </div>
                        </div>
                        {wishlistItems.length > 0 && (
                            <button
                                onClick={handleAddAllToCart}
                                className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Thêm tất cả vào giỏ
                            </button>
                        )}
                    </div>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
                        <HeartOff className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Danh sách yêu thích trống
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Hãy thêm sản phẩm yêu thích để dễ dàng theo dõi và mua sắm sau
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
                        {wishlistItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Product Image */}
                                <Link to={`/shop/product/${item.product?.id}`} className="block relative">
                                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <Package className="w-16 h-16 text-gray-400" />
                                    </div>
                                    {/* Remove button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleRemove(item.productId);
                                        }}
                                        disabled={removingId === item.productId}
                                        className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        {removingId === item.productId ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                                        ) : (
                                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                                        )}
                                    </button>
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

                {/* Mobile Add All Button */}
                {wishlistItems.length > 0 && (
                    <div className="fixed bottom-4 left-4 right-4 sm:hidden">
                        <button
                            onClick={handleAddAllToCart}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-xl font-semibold"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Thêm tất cả vào giỏ hàng
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
