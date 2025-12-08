import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
    Package, 
    ArrowLeft, 
    Save, 
    Loader2,
    DollarSign,
    Hash,
    Tag,
    FileText,
    Layers,
    Sparkles,
    Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/api';

const productSchema = yup.object({
    productName: yup
        .string()
        .min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự')
        .max(150, 'Tên sản phẩm không được quá 150 ký tự')
        .required('Tên sản phẩm là bắt buộc'),
    sku: yup
        .string()
        .max(100, 'SKU không được quá 100 ký tự')
        .required('SKU là bắt buộc'),
    description: yup
        .string()
        .nullable(),
    category: yup
        .string()
        .nullable(),
    price: yup
        .number()
        .transform((value, originalValue) => {
            return originalValue === '' ? null : value;
        })
        .nullable()
        .min(0, 'Giá phải là số dương'),
    stockQuantity: yup
        .number()
        .transform((value, originalValue) => {
            return originalValue === '' ? 0 : value;
        })
        .integer('Số lượng phải là số nguyên')
        .min(0, 'Số lượng phải là số dương')
        .default(0),
});

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showNewCategory, setShowNewCategory] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm({
        resolver: yupResolver(productSchema),
    });

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productAPI.getProductById(id);
                if (response.data.success) {
                    const product = response.data.data;
                    reset({
                        productName: product.productName || '',
                        sku: product.sku || '',
                        description: product.description || '',
                        category: product.category || '',
                        price: product.price || '',
                        stockQuantity: product.stockQuantity || 0,
                    });
                } else {
                    toast.error('Không tìm thấy sản phẩm');
                    navigate('/products');
                }
            } catch (error) {
                console.error('Fetch product error:', error);
                toast.error('Không thể tải thông tin sản phẩm');
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, reset, navigate]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await productAPI.getCategories();
                if (response.data.success) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const submitData = {
                ...data,
                price: data.price || null,
                category: data.category || null,
                description: data.description || null,
            };

            const response = await productAPI.updateProduct(id, submitData);

            if (response.data.success) {
                toast.success('Cập nhật sản phẩm thành công!');
                navigate('/products');
            } else {
                toast.error(response.data.message || 'Cập nhật sản phẩm thất bại');
            }
        } catch (error) {
            console.error('Update product error:', error);
            const message = error.response?.data?.message || 'Cập nhật sản phẩm thất bại';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fadeIn">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 mb-4 transition-colors group"
                    >
                        <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                        Quay lại danh sách
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Edit3 className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                                Chỉnh sửa sản phẩm
                            </h1>
                            <p className="text-gray-500">Cập nhật thông tin sản phẩm</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-white/50 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Product Name */}
                        <div className="animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                                    <Package className="h-3.5 w-3.5 text-red-600" />
                                </div>
                                Tên sản phẩm <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('productName')}
                                type="text"
                                className={`w-full px-4 py-3.5 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 ${
                                    errors.productName ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                                placeholder="Nhập tên sản phẩm"
                            />
                            {errors.productName && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.productName.message}
                                </p>
                            )}
                        </div>

                        {/* SKU */}
                        <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                                    <Hash className="h-3.5 w-3.5 text-red-600" />
                                </div>
                                Mã SKU <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('sku')}
                                type="text"
                                className={`w-full px-4 py-3.5 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 ${
                                    errors.sku ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                                placeholder="VD: IP15PRO-256"
                            />
                            {errors.sku && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.sku.message}
                                </p>
                            )}
                        </div>

                        {/* Category */}
                        <div className="animate-fadeInUp" style={{ animationDelay: '0.25s' }}>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                                    <Tag className="h-3.5 w-3.5 text-red-600" />
                                </div>
                                Danh mục
                            </label>
                            {!showNewCategory ? (
                                <div className="flex gap-3">
                                    <select
                                        {...register('category')}
                                        className="flex-1 px-4 py-3.5 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCategory(true)}
                                        className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all duration-300 text-sm font-medium border border-gray-200 flex items-center gap-2 hover:shadow-md"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Mới
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <input
                                        {...register('category')}
                                        type="text"
                                        className="flex-1 px-4 py-3.5 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                        placeholder="Nhập tên danh mục mới"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNewCategory(false);
                                            setValue('category', '');
                                        }}
                                        className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all duration-300 text-sm font-medium border border-gray-200 hover:shadow-md"
                                    >
                                        Chọn
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Price and Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="h-3.5 w-3.5 text-green-600" />
                                    </div>
                                    Giá (VNĐ)
                                </label>
                                <input
                                    {...register('price')}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className={`w-full px-4 py-3.5 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 ${
                                        errors.price ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    placeholder="0"
                                />
                                {errors.price && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        {errors.price.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                                        <Layers className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                    Số lượng tồn kho
                                </label>
                                <input
                                    {...register('stockQuantity')}
                                    type="number"
                                    min="0"
                                    className={`w-full px-4 py-3.5 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 ${
                                        errors.stockQuantity ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    placeholder="0"
                                />
                                {errors.stockQuantity && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        {errors.stockQuantity.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="animate-fadeInUp" style={{ animationDelay: '0.35s' }}>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-3.5 w-3.5 text-purple-600" />
                                </div>
                                Mô tả sản phẩm
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="w-full px-4 py-3.5 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 resize-none hover:border-gray-300"
                                placeholder="Nhập mô tả chi tiết về sản phẩm..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                            <Link
                                to="/products"
                                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                            >
                                Hủy
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:via-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductEdit;
