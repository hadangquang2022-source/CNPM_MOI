import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, Grid, List, Star, Package, Heart, Eye, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getProducts({ limit: 50 });
            if (response.data.success) {
                setProducts(response.data.data.products || response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Không thể tải sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products
        .filter(product =>
            product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'name':
                    return a.productName.localeCompare(b.productName);
                default: // newest
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    const ProductCard = ({ product }) => (
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
            {/* Product Image */}
            <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-20 w-20 text-gray-400" />
                    </div>
                )}

                {/* Stock Badge */}
                <div className="absolute top-4 right-4">
                    {product.stockQuantity === 0 ? (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                            Hết hàng
                        </span>
                    ) : product.stockQuantity < 10 ? (
                        <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                            Sắp hết
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                            Còn hàng
                        </span>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-rose-50 transition-colors">
                        <Heart className="h-5 w-5 text-rose-600" />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-rose-50 transition-colors">
                        <Eye className="h-5 w-5 text-rose-600" />
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                    {product.productName}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {product.description}
                </p>

                {/* Price and Stock */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-violet-600 bg-clip-text text-transparent">
                            ${product.price}
                        </p>
                        <p className="text-xs text-gray-500">
                            Kho: {product.stockQuantity}
                        </p>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    disabled={product.stockQuantity === 0}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${product.stockQuantity === 0
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-rose-500 to-violet-600 hover:from-violet-600 hover:to-rose-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        }`}
                >
                    <ShoppingCart className="h-5 w-5" />
                    {product.stockQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Decorative Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500/10 to-violet-500/10 px-4 py-2 rounded-full text-sm font-medium text-rose-600 mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span>Cửa hàng trực tuyến</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
                        <span className="text-gray-900">Chào mừng, </span>
                        <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                            {user?.firstName || 'Khách hàng'}!
                        </span>
                    </h1>
                    <p className="text-gray-600 text-lg">Khám phá sản phẩm chất lượng cao với giá tốt nhất</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="price-low">Giá thấp đến cao</option>
                                <option value="price-high">Giá cao đến thấp</option>
                                <option value="name">Tên A-Z</option>
                            </select>

                            {/* View Mode Toggle */}
                            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                            ? 'bg-white shadow-md text-rose-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Grid className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                            ? 'bg-white shadow-md text-rose-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="spinner"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Không tìm thấy sản phẩm
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có sản phẩm nào'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-gray-600">
                                Hiển thị <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
                            </p>
                        </div>
                        <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-1'
                            }`}>
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;
