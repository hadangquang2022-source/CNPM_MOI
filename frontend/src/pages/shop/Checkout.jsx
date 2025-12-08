import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
    ArrowLeft, 
    CreditCard, 
    Truck, 
    MapPin,
    User,
    Phone,
    Mail,
    FileText,
    CheckCircle,
    Package,
    ShieldCheck,
    Banknote,
    Building2,
    Wallet
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            fullName: user ? `${user.firstName} ${user.lastName}` : '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: '',
            city: '',
            district: '',
            ward: '',
            note: ''
        }
    });

    const formatPrice = (price) => {
        if (!price) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const subtotal = getCartTotal();
    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    const paymentMethods = [
        { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', icon: Banknote, description: 'Thanh toán bằng tiền mặt khi nhận hàng' },
        { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: Building2, description: 'Chuyển khoản qua ngân hàng' },
        { id: 'momo', name: 'Ví MoMo', icon: Wallet, description: 'Thanh toán qua ví điện tử MoMo' },
    ];

    const onSubmit = async (data) => {
        if (cartItems.length === 0) {
            toast.error('Giỏ hàng trống!');
            return;
        }

        setIsProcessing(true);

        try {
            // Prepare order data
            const orderData = {
                customerName: data.fullName,
                customerEmail: data.email,
                customerPhone: data.phone,
                shippingAddress: data.address,
                shippingCity: data.city,
                shippingDistrict: data.district,
                shippingWard: data.ward || '',
                paymentMethod: paymentMethod,
                note: data.note || '',
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            // Call API to create order
            const response = await orderAPI.createOrder(orderData);

            if (response.data.success) {
                const newOrderId = response.data.data.order.orderCode;
                setOrderId(newOrderId);

                // Clear cart after successful order
                clearCart();

                // Show success
                setOrderSuccess(true);
                toast.success('Đặt hàng thành công!');
            } else {
                toast.error(response.data.message || 'Có lỗi xảy ra!');
            }

        } catch (error) {
            console.error('Order error:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setIsProcessing(false);
        }
    };

    // Order Success Screen
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 text-center animate-fadeIn">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
                    <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua sắm tại QuangStore</p>
                    
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                        <p className="text-xl font-bold text-gray-900">{orderId}</p>
                    </div>

                    <div className="space-y-3 text-left mb-6">
                        <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Mail className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm">Email xác nhận đã được gửi</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Truck className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="text-sm">Dự kiến giao hàng: 2-4 ngày</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            to="/shop"
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Tiếp tục mua sắm
                        </Link>
                        <Link
                            to="/dashboard"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
                        >
                            Xem đơn hàng
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Redirect if cart is empty
    if (cartItems.length === 0 && !orderSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 flex items-center justify-center p-4">
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
                    <p className="text-gray-500 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
                    >
                        Khám phá sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

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
                        to="/cart"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        Quay lại giỏ hàng
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Thanh toán</h1>
                            <p className="text-white/80">Hoàn tất đơn hàng của bạn</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Information */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 animate-fadeInUp">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-red-500" />
                                    Thông tin giao hàng
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Họ và tên *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`}
                                                placeholder="Nguyễn Văn A"
                                            />
                                        </div>
                                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                {...register('phone', { 
                                                    required: 'Vui lòng nhập số điện thoại',
                                                    pattern: {
                                                        value: /^[0-9]{10,11}$/,
                                                        message: 'Số điện thoại không hợp lệ'
                                                    }
                                                })}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                                                placeholder="0912345678"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                {...register('email', { 
                                                    required: 'Vui lòng nhập email',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Email không hợp lệ'
                                                    }
                                                })}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Địa chỉ *
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
                                                placeholder="Số nhà, tên đường"
                                            />
                                        </div>
                                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tỉnh/Thành phố *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('city', { required: 'Vui lòng nhập tỉnh/thành phố' })}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${errors.city ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="TP. Hồ Chí Minh"
                                        />
                                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quận/Huyện *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('district', { required: 'Vui lòng nhập quận/huyện' })}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${errors.district ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="Quận 1"
                                        />
                                        {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ghi chú (tùy chọn)
                                        </label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <textarea
                                                {...register('note')}
                                                rows={3}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-red-500" />
                                    Phương thức thanh toán
                                </h2>

                                <div className="space-y-3">
                                    {paymentMethods.map((method) => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                paymentMethod === method.id 
                                                    ? 'border-red-500 bg-red-50' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={paymentMethod === method.id}
                                                onChange={() => setPaymentMethod(method.id)}
                                                className="sr-only"
                                            />
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                paymentMethod === method.id 
                                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' 
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                <method.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{method.name}</p>
                                                <p className="text-sm text-gray-500">{method.description}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                paymentMethod === method.id 
                                                    ? 'border-red-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {paymentMethod === method.id && (
                                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 sticky top-4 animate-fadeInRight">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Đơn hàng của bạn</h2>

                                {/* Cart Items */}
                                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3 p-2 bg-gray-50 rounded-lg">
                                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Package className="w-6 h-6 text-gray-300" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                                                <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-red-600">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-200 pt-4 space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tạm tính</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Truck className="w-4 h-4" />
                                            Phí vận chuyển
                                        </span>
                                        <span>
                                            {shippingFee === 0 ? (
                                                <span className="text-green-600">Miễn phí</span>
                                            ) : (
                                                formatPrice(shippingFee)
                                            )}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-gray-900">Tổng cộng</span>
                                            <span className="font-bold text-xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                                {formatPrice(total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:from-red-600 hover:via-red-700 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-5 h-5" />
                                            Đặt hàng
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng của QuangStore
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
