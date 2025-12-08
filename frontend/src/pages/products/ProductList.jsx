import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    Package, 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Loader2,
    Filter,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ProductList = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10
    });
    const [deleteModal, setDeleteModal] = useState({ show: false, product: null });

    const isAdmin = user?.role?.name === 'Admin';

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.currentPage,
                limit: pagination.limit,
                search: searchTerm || undefined,
                category: selectedCategory !== 'all' ? selectedCategory : undefined
            };

            const response = await productAPI.getProducts(params);

            if (response.data.success) {
                setProducts(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages
                }));
            }
        } catch (error) {
            console.error('Fetch products error:', error);
            toast.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.limit, searchTerm, selectedCategory]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await productAPI.getCategories();
                if (response.data.success) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error('Fetch categories error:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination(prev => ({ ...prev, currentPage: 1 }));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedCategory]);

    // Handle delete
    const handleDelete = async () => {
        if (!deleteModal.product) return;

        try {
            const response = await productAPI.deleteProduct(deleteModal.product.id);
            if (response.data.success) {
                toast.success('Xóa sản phẩm thành công');
                fetchProducts();
            }
        } catch (error) {
            console.error('Delete product error:', error);
            toast.error(error.response?.data?.message || 'Xóa sản phẩm thất bại');
        } finally {
            setDeleteModal({ show: false, product: null });
        }
    };

    // Format price
    const formatPrice = (price) => {
        if (!price) return 'Chưa có giá';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
            {/* Decorative Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 animate-fadeIn">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500/10 to-violet-500/10 px-4 py-2 rounded-full text-sm font-medium text-rose-600 mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span>Quản lý sản phẩm</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-rose-500 to-violet-600 rounded-xl shadow-lg">
                                <Package className="h-7 w-7 text-white" />
                            </div>
                            <span>Danh sách sản phẩm</span>
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Tổng cộng <span className="font-semibold text-rose-600">{pagination.total}</span> sản phẩm
                        </p>
                    </div>
                    <Link
                        to="/products/create"
                        className="mt-4 md:mt-0 inline-flex items-center px-5 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 hover:from-violet-600 hover:via-pink-500 hover:to-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Thêm sản phẩm
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-5 mb-6 animate-fadeInUp">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên hoặc SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-300 hover:border-gray-300"
                            />
                        </div>

                        {/* Category filter */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl">
                                <Filter className="h-5 w-5 text-violet-600" />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-300 hover:border-gray-300 bg-white"
                            >
                                <option value="all">Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fadeInUp">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 bg-gradient-to-br from-rose-500 to-violet-600 rounded-2xl shadow-lg mb-4">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                            <span className="text-gray-600 font-medium">Đang tải dữ liệu...</span>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-100 to-violet-100 rounded-2xl mb-4">
                                <Package className="h-10 w-10 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Chưa có sản phẩm
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                {searchTerm || selectedCategory !== 'all' 
                                    ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc của bạn' 
                                    : 'Bắt đầu bằng cách thêm sản phẩm đầu tiên vào cửa hàng'}
                            </p>
                            <Link
                                to="/products/create"
                                className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-rose-500 to-violet-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Thêm sản phẩm
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Sản phẩm
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                SKU
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Danh mục
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Giá
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Tồn kho
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map((product, index) => (
                                            <tr 
                                                key={product.id} 
                                                className="hover:bg-gradient-to-r hover:from-rose-50/50 hover:to-violet-50/50 transition-all duration-300 group"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-12 w-12 bg-gradient-to-br from-rose-100 to-violet-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                                            <Package className="h-6 w-6 text-rose-500" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                                                                {product.productName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1.5 rounded-lg">
                                                        {product.sku}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {product.category ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700">
                                                            {product.category}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-bold bg-gradient-to-r from-rose-500 to-violet-600 bg-clip-text text-transparent">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                        product.stockQuantity > 10 
                                                            ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                                                            : product.stockQuantity > 0
                                                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700'
                                                            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
                                                    }`}>
                                                        {product.stockQuantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link
                                                            to={`/products/edit/${product.id}`}
                                                            className="p-2.5 text-violet-600 hover:bg-violet-100 rounded-xl transition-all duration-300 hover:scale-110"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => setDeleteModal({ show: true, product })}
                                                                className="p-2.5 text-rose-600 hover:bg-rose-100 rounded-xl transition-all duration-300 hover:scale-110"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
                                    <div className="text-sm text-gray-600 font-medium">
                                        Trang <span className="text-rose-600">{pagination.currentPage}</span> / {pagination.totalPages}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                            disabled={pagination.currentPage === 1}
                                            className="p-2.5 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-rose-50 hover:to-violet-50 hover:border-rose-300 transition-all duration-300"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            className="p-2.5 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-rose-50 hover:to-violet-50 hover:border-rose-300 transition-all duration-300"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl mx-auto mb-6">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            Xác nhận xóa sản phẩm
                        </h3>
                        <p className="text-gray-500 text-center mb-8">
                            Bạn có chắc muốn xóa sản phẩm <strong className="text-rose-600">"{deleteModal.product?.productName}"</strong>? 
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setDeleteModal({ show: false, product: null })}
                                className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-red-500 shadow-lg shadow-red-500/30 hover:shadow-xl transition-all duration-300 font-semibold"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
