import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Search, 
    Filter, 
    ShoppingCart, 
    Heart,
    Star,
    Package,
    Grid,
    List,
    SlidersHorizontal,
    ChevronDown,
    Loader2,
    ShoppingBag,
    Sparkles,
    Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false);
    
    const { addToCart, cartItems } = useCart();

    // Fetch products
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [searchTerm, selectedCategory, sortBy]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm || undefined,
                category: selectedCategory || undefined,
                sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? 'price' : 'productName',
                sortOrder: sortBy === 'price-high' ? 'DESC' : sortBy === 'newest' ? 'DESC' : 'ASC',
            };

            const response = await productAPI.getProducts(params);
            if (response.data.success) {
                let filteredProducts = response.data.data.products || response.data.data || [];
                
                // Filter by price range
                if (priceRange.min || priceRange.max) {
                    filteredProducts = filteredProducts.filter(p => {
                        const price = p.price || 0;
                        if (priceRange.min && price < Number(priceRange.min)) return false;
                        if (priceRange.max && price > Number(priceRange.max)) return false;
                        return true;
                    });
                }
                
                setProducts(filteredProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await productAPI.getCategories();
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        toast.success(`Đã thêm "${product.productName}" vào giỏ hàng!`);
    };

    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

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
                        <circle cx="10%" cy="30%" r="4" fill="rgba(255,255,255,0.2)" className="animate-float" />
                        <circle cx="90%" cy="20%" r="6" fill="rgba(255,255,255,0.15)" className="animate-float" style={{ animationDelay: '1s' }} />
                        <circle cx="80%" cy="70%" r="5" fill="rgba(255,255,255,0.2)" className="animate-float" style={{ animationDelay: '2s' }} />
                    </svg>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div className="animate-fadeIn">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-bold">Cửa hàng</h1>
                            </div>
                            <p className="text-white/80 text-lg">Khám phá các sản phẩm tuyệt vời của chúng tôi</p>
                        </div>
                        
                        {/* Cart Button */}
                        <Link
                            to="/cart"
                            className="relative bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-105"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            <span className="font-semibold">Giỏ hàng</span>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center text-sm font-bold animate-bounce-slow">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-8 max-w-2xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters Bar */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4 mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Category Filter */}
                        <div className="flex-1 min-w-[200px]">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="flex-1 min-w-[200px]">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="price-low">Giá: Thấp → Cao</option>
                                <option value="price-high">Giá: Cao → Thấp</option>
                                <option value="name">Tên A-Z</option>
                            </select>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${showFilters ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            <span>Bộ lọc</span>
                        </button>
                    </div>

                    {/* Extended Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Giá:</span>
                                    <input
                                        type="number"
                                        placeholder="Từ"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                        className="w-28 px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="number"
                                        placeholder="Đến"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                        className="w-28 px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    />
                                </div>
                                <button
                                    onClick={fetchProducts}
                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Products Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                        Hiển thị <span className="font-semibold text-gray-900">{products.length}</span> sản phẩm
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center animate-fadeIn">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                            <p className="mt-4 text-gray-600 font-medium">Đang tải sản phẩm...</p>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 animate-fadeIn">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                        <p className="text-gray-500">Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                    </div>
                ) : (
                    /* Products Grid/List */
                    <div className={viewMode === 'grid' 
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'space-y-4'
                    }>
                        {products.map((product, index) => (
                            <div
                                key={product.id}
                                className={`group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 animate-fadeInUp ${viewMode === 'list' ? 'flex' : ''}`}
                                style={{ animationDelay: `${0.05 * index}s` }}
                            >
                                {/* Product Image */}
                                <div className={`relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Package className="w-16 h-16 text-gray-300" />
                                    </div>
                                    
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="flex-1 bg-white text-gray-900 py-2 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                Thêm vào giỏ
                                            </button>
                                        </div>
                                    </div>

                                    {/* Category Badge */}
                                    {product.category && (
                                        <div className="absolute top-3 left-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
                                                <Tag className="w-3 h-3" />
                                                {product.category}
                                            </span>
                                        </div>
                                    )}

                                    {/* Stock Badge */}
                                    {product.stockQuantity === 0 && (
                                        <div className="absolute top-3 right-3">
                                            <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-medium">
                                                Hết hàng
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                                    <div>
                                        <Link 
                                            to={`/shop/product/${product.id}`}
                                            className="font-semibold text-gray-900 hover:text-red-600 transition-colors line-clamp-2 mb-1"
                                        >
                                            {product.productName}
                                        </Link>
                                        <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                                        {viewMode === 'list' && product.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                                        <div>
                                            <p className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                                {formatPrice(product.price)}
                                            </p>
                                            {product.stockQuantity > 0 && (
                                                <p className="text-xs text-green-600 font-medium">
                                                    Còn {product.stockQuantity} sản phẩm
                                                </p>
                                            )}
                                        </div>
                                        
                                        {viewMode === 'list' && (
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={product.stockQuantity === 0}
                                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                Thêm vào giỏ
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
