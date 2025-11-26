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
    Layers
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/products"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Quay lại danh sách
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Package className="h-8 w-8 mr-3 text-red-600" />
                        Chỉnh sửa sản phẩm
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Cập nhật thông tin sản phẩm
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white shadow-lg rounded-xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Package className="inline h-4 w-4 mr-1" />
                                Tên sản phẩm <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('productName')}
                                type="text"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                                    errors.productName ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Nhập tên sản phẩm"
                            />
                            {errors.productName && (
                                <p className="mt-1 text-sm text-red-500">{errors.productName.message}</p>
                            )}
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Hash className="inline h-4 w-4 mr-1" />
                                Mã SKU <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('sku')}
                                type="text"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                                    errors.sku ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="VD: IP15PRO-256"
                            />
                            {errors.sku && (
                                <p className="mt-1 text-sm text-red-500">{errors.sku.message}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Tag className="inline h-4 w-4 mr-1" />
                                Danh mục
                            </label>
                            {!showNewCategory ? (
                                <div className="flex gap-2">
                                    <select
                                        {...register('category')}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCategory(true)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                    >
                                        + Mới
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        {...register('category')}
                                        type="text"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        placeholder="Nhập tên danh mục mới"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNewCategory(false);
                                            setValue('category', '');
                                        }}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                    >
                                        Chọn
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Price and Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="inline h-4 w-4 mr-1" />
                                    Giá (VNĐ)
                                </label>
                                <input
                                    {...register('price')}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                                        errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0"
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Layers className="inline h-4 w-4 mr-1" />
                                    Số lượng tồn kho
                                </label>
                                <input
                                    {...register('stockQuantity')}
                                    type="number"
                                    min="0"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                                        errors.stockQuantity ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0"
                                />
                                {errors.stockQuantity && (
                                    <p className="mt-1 text-sm text-red-500">{errors.stockQuantity.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText className="inline h-4 w-4 mr-1" />
                                Mô tả sản phẩm
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                                placeholder="Nhập mô tả chi tiết về sản phẩm..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <Link
                                to="/products"
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
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
