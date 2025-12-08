import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    ShoppingCart, 
    Heart,
    Share2,
    Package,
    Truck,
    Shield,
    Minus,
    Plus,
    Tag,
    Loader2,
    CheckCircle,
    Star,
    Eye,
    Users,
    MessageSquare,
    ThumbsUp,
    Send,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI, wishlistAPI, productViewAPI, reviewAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [userReview, setUserReview] = useState(null);

    const { addToCart } = useCart();

    // Get session ID for anonymous tracking
    const getSessionId = () => {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    };

    useEffect(() => {
        fetchProduct();
        fetchStats();
        fetchReviews();
        recordView();
        if (user) {
            checkWishlist();
            fetchUserReview();
        }
    }, [id, user]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await productAPI.getProductById(id);
            if (response.data.success) {
                setProduct(response.data.data);
                fetchSimilarProducts();
            } else {
                toast.error('Không tìm thấy sản phẩm');
                navigate('/shop');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Không thể tải thông tin sản phẩm');
            navigate('/shop');
        } finally {
            setLoading(false);
        }
    };

    const fetchSimilarProducts = async () => {
        try {
            const response = await productAPI.getSimilarProducts(id, 8);
            if (response.data.success) {
                setSimilarProducts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching similar products:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await productAPI.getProductStats(id);
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await reviewAPI.getProductReviews(id, { limit: 10 });
            if (response.data.success) {
                setReviews(response.data.data.reviews || []);
                setReviewStats(response.data.data.stats);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const fetchUserReview = async () => {
        try {
            const response = await reviewAPI.getUserReview(id);
            if (response.data.success && response.data.data) {
                setUserReview(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching user review:', error);
        }
    };

    const recordView = async () => {
        try {
            const sessionId = getSessionId();
            await productViewAPI.recordView(id, sessionId);
        } catch (error) {
            console.error('Error recording view:', error);
        }
    };

    const checkWishlist = async () => {
        try {
            const response = await wishlistAPI.checkWishlist(id);
            if (response.data.success) {
                setIsInWishlist(response.data.data.isInWishlist);
            }
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const handleToggleWishlist = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
            navigate('/login');
            return;
        }

        try {
            setWishlistLoading(true);
            const response = await wishlistAPI.toggleWishlist(id);
            if (response.data.success) {
                setIsInWishlist(response.data.data.isInWishlist);
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast.error('Không thể cập nhật danh sách yêu thích');
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            navigate('/login');
            return;
        }

        try {
            setSubmittingReview(true);
            const response = await reviewAPI.createReview({
                productId: parseInt(id),
                rating: newReview.rating,
                title: newReview.title,
                comment: newReview.comment
            });

            if (response.data.success) {
                toast.success('Đánh giá đã được gửi!');
                setNewReview({ rating: 5, title: '', comment: '' });
                fetchReviews();
                fetchStats();
                setUserReview(response.data.data);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Không thể gửi đánh giá');
            }
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleMarkHelpful = async (reviewId) => {
        try {
            await reviewAPI.markHelpful(reviewId);
            toast.success('Cảm ơn phản hồi của bạn!');
            fetchReviews();
        } catch (error) {
            console.error('Error marking helpful:', error);
        }
    };

    const handleAddToCart = () => {
        if (product.stockQuantity === 0) {
            toast.error('Sản phẩm đã hết hàng');
            return;
        }
        addToCart(product, quantity);
        toast.success(`Đã thêm ${quantity} "${product.productName}" vào giỏ hàng!`);
    };

    const handleBuyNow = () => {
        if (product.stockQuantity === 0) {
            toast.error('Sản phẩm đã hết hàng');
            return;
        }
        addToCart(product, quantity);
        navigate('/cart');
    };

    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderStars = (rating, size = 'w-4 h-4') => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${size} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6 animate-fadeIn">
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        Quay lại cửa hàng
                    </Link>
                </div>

                {/* Product Detail */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-fadeInUp">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Product Image */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                <Package className="w-32 h-32 text-gray-300" />
                                
                                {/* Category Badge */}
                                {product.category && (
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-700 shadow-sm">
                                            <Tag className="w-4 h-4" />
                                            {product.category}
                                        </span>
                                    </div>
                                )}

                                {/* Wishlist Button */}
                                <button
                                    onClick={handleToggleWishlist}
                                    disabled={wishlistLoading}
                                    className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                        isInWishlist 
                                            ? 'bg-red-500 text-white' 
                                            : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500'
                                    }`}
                                >
                                    {wishlistLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-white' : ''}`} />
                                    )}
                                </button>

                                {/* Stock Badge */}
                                {product.stockQuantity === 0 && (
                                    <div className="absolute bottom-4 left-4">
                                        <span className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-sm font-medium">
                                            Hết hàng
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Product Stats */}
                            {stats && (
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                                        <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-blue-700">{stats.buyersCount}</p>
                                        <p className="text-xs text-blue-600">Đã mua</p>
                                    </div>
                                    <div className="bg-green-50 rounded-xl p-3 text-center">
                                        <Package className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-green-700">{stats.totalSold}</p>
                                        <p className="text-xs text-green-600">Đã bán</p>
                                    </div>
                                    <div className="bg-orange-50 rounded-xl p-3 text-center">
                                        <MessageSquare className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-orange-700">{stats.reviewersCount}</p>
                                        <p className="text-xs text-orange-600">Đánh giá</p>
                                    </div>
                                    <div className="bg-pink-50 rounded-xl p-3 text-center">
                                        <Heart className="w-5 h-5 text-pink-600 mx-auto mb-1" />
                                        <p className="text-lg font-bold text-pink-700">{stats.wishlistCount}</p>
                                        <p className="text-xs text-pink-600">Yêu thích</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">SKU: {product.sku}</p>
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.productName}</h1>
                                
                                {/* Rating */}
                                {reviewStats && reviewStats.totalReviews > 0 && (
                                    <div className="flex items-center gap-2 mb-3">
                                        {renderStars(Math.round(reviewStats.averageRating))}
                                        <span className="text-lg font-semibold text-yellow-600">
                                            {reviewStats.averageRating.toFixed(1)}
                                        </span>
                                        <span className="text-gray-500">
                                            ({reviewStats.totalReviews} đánh giá)
                                        </span>
                                    </div>
                                )}
                                
                                {/* Price */}
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                        {formatPrice(product.price)}
                                    </span>
                                </div>

                                {/* Stock Status */}
                                <div className="mt-3">
                                    {product.stockQuantity > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                                            <CheckCircle className="w-4 h-4" />
                                            Còn {product.stockQuantity} sản phẩm
                                        </span>
                                    ) : (
                                        <span className="text-red-600 font-medium">Hết hàng</span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
                                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="flex items-center gap-4">
                                <span className="font-medium text-gray-700">Số lượng:</span>
                                <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                                        disabled={quantity >= product.stockQuantity}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stockQuantity === 0}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-red-500 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Thêm vào giỏ
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={product.stockQuantity === 0}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:from-red-600 hover:via-red-700 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Mua ngay
                                </button>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <Truck className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Giao hàng nhanh</p>
                                    <p className="text-xs text-gray-500">2-3 ngày</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <Shield className="w-6 h-6 text-green-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Bảo hành</p>
                                    <p className="text-xs text-gray-500">12 tháng</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <Star className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Chính hãng</p>
                                    <p className="text-xs text-gray-500">100%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-fadeInUp p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-orange-500" />
                            Đánh giá sản phẩm
                        </h2>
                        {reviewStats && (
                            <div className="flex items-center gap-2">
                                {renderStars(Math.round(reviewStats.averageRating), 'w-5 h-5')}
                                <span className="text-xl font-bold text-yellow-600">
                                    {reviewStats.averageRating.toFixed(1)}
                                </span>
                                <span className="text-gray-500">
                                    ({reviewStats.totalReviews} đánh giá)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Rating Distribution */}
                    {reviewStats && reviewStats.ratingDistribution && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const count = reviewStats.ratingDistribution[rating] || 0;
                                    const percentage = reviewStats.totalReviews > 0 
                                        ? (count / reviewStats.totalReviews) * 100 
                                        : 0;
                                    return (
                                        <div key={rating} className="flex items-center gap-2">
                                            <span className="w-8 text-sm text-gray-600">{rating} ⭐</span>
                                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="w-12 text-sm text-gray-500 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Write Review */}
                            {user && !userReview && (
                                <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-2xl p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Viết đánh giá của bạn</h3>
                                    
                                    {/* Rating Selection */}
                                    <div className="mb-4">
                                        <label className="text-sm text-gray-600 mb-2 block">Đánh giá:</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                                    className="p-1 hover:scale-110 transition-transform"
                                                >
                                                    <Star 
                                                        className={`w-8 h-8 ${star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Tiêu đề đánh giá (tùy chọn)"
                                        value={newReview.title}
                                        onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl mb-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />

                                    <textarea
                                        placeholder="Chia sẻ trải nghiệm của bạn..."
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl mb-3 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    />

                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50"
                                    >
                                        {submittingReview ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                        Gửi đánh giá
                                    </button>
                                </form>
                            )}

                            {userReview && (
                                <div className="bg-green-50 rounded-2xl p-6">
                                    <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Đánh giá của bạn
                                    </h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        {renderStars(userReview.rating)}
                                    </div>
                                    {userReview.title && <p className="font-medium text-gray-900">{userReview.title}</p>}
                                    {userReview.comment && <p className="text-gray-600 mt-1">{userReview.comment}</p>}
                                </div>
                            )}

                            {!user && (
                                <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center">
                                    <p className="text-gray-600 mb-4">Đăng nhập để viết đánh giá</p>
                                    <Link 
                                        to="/login"
                                        className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
                                    >
                                        Đăng nhập
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews List */}
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {displayedReviews.map((review) => (
                                <div key={review.id} className="bg-gray-50 rounded-2xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">
                                                    {review.user?.fullName || 'Ẩn danh'}
                                                </span>
                                                {review.isVerifiedPurchase && (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                        Đã mua hàng
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {renderStars(review.rating)}
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleMarkHelpful(review.id)}
                                            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-sm transition-colors"
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                            {review.helpfulCount > 0 && review.helpfulCount}
                                        </button>
                                    </div>
                                    {review.title && (
                                        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                                    )}
                                    {review.comment && (
                                        <p className="text-gray-600">{review.comment}</p>
                                    )}
                                </div>
                            ))}

                            {reviews.length > 3 && (
                                <button
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    className="w-full flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    {showAllReviews ? (
                                        <>
                                            <ChevronUp className="w-5 h-5" />
                                            Thu gọn
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-5 h-5" />
                                            Xem thêm {reviews.length - 3} đánh giá
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>Chưa có đánh giá nào</p>
                        </div>
                    )}
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="mt-12 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm tương tự</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {similarProducts.slice(0, 4).map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/shop/product/${item.id}`}
                                    className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all"
                                >
                                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                        <Package className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                                            {item.productName}
                                        </h3>
                                        <p className="text-lg font-bold text-red-600 mt-2">
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
