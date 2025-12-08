import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Search, 
    Package, 
    Clock, 
    CheckCircle, 
    Truck, 
    XCircle,
    RefreshCw,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    ArrowLeft,
    FileSearch
} from 'lucide-react';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TrackOrder = () => {
    const [trackingCode, setTrackingCode] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!trackingCode.trim()) {
            toast.error('Vui lòng nhập mã đơn hàng');
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            const response = await orderAPI.trackOrder(trackingCode.trim().toUpperCase());
            if (response.data.success) {
                setOrder(response.data.data.order);
            } else {
                setOrder(null);
                toast.error('Không tìm thấy đơn hàng');
            }
        } catch (error) {
            console.error('Track order error:', error);
            setOrder(null);
            toast.error('Không tìm thấy đơn hàng với mã này');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        const statusConfig = {
            pending: { label: 'Chờ xác nhận', color: 'text-yellow-600 bg-yellow-100', icon: Clock, step: 1 },
            confirmed: { label: 'Đã xác nhận', color: 'text-blue-600 bg-blue-100', icon: CheckCircle, step: 2 },
            processing: { label: 'Đang xử lý', color: 'text-indigo-600 bg-indigo-100', icon: RefreshCw, step: 3 },
            shipping: { label: 'Đang giao hàng', color: 'text-purple-600 bg-purple-100', icon: Truck, step: 4 },
            delivered: { label: 'Đã giao hàng', color: 'text-green-600 bg-green-100', icon: CheckCircle, step: 5 },
            cancelled: { label: 'Đã hủy', color: 'text-red-600 bg-red-100', icon: XCircle, step: 0 }
        };
        return statusConfig[status] || statusConfig.pending;
    };

    const getPaymentMethodLabel = (method) => {
        const methods = {
            cod: 'Thanh toán khi nhận hàng (COD)',
            bank: 'Chuyển khoản ngân hàng',
            momo: 'Ví MoMo'
        };
        return methods[method] || method;
    };

    const OrderStatusTimeline = ({ status }) => {
        const steps = [
            { key: 'confirmed', label: 'Xác nhận', icon: CheckCircle },
            { key: 'processing', label: 'Xử lý', icon: RefreshCw },
            { key: 'shipping', label: 'Vận chuyển', icon: Truck },
            { key: 'delivered', label: 'Hoàn thành', icon: Package }
        ];
        
        const currentStep = getStatusInfo(status).step;

        if (status === 'cancelled') {
            return (
                <div className="flex items-center justify-center gap-2 p-4 bg-red-50 rounded-xl text-red-600">
                    <XCircle className="w-6 h-6" />
                    <span className="font-semibold text-lg">Đơn hàng đã bị hủy</span>
                </div>
            );
        }

        return (
            <div className="relative">
                {/* Progress line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 mx-8">
                    <div 
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${Math.min(((currentStep - 1) / 4) * 100, 100)}%` }}
                    ></div>
                </div>

                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const stepNumber = index + 2; // starts from confirmed (2)
                        const isCompleted = currentStep >= stepNumber;
                        const isCurrent = currentStep === stepNumber;
                        const Icon = step.icon;

                        return (
                            <div key={step.key} className="flex flex-col items-center z-10">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                                    isCompleted 
                                        ? 'bg-gradient-to-r from-red-500 to-orange-500 border-white text-white shadow-lg' 
                                        : 'bg-white border-gray-200 text-gray-400'
                                } ${isCurrent ? 'ring-4 ring-red-200 animate-pulse' : ''}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`mt-2 text-sm font-medium ${
                                    isCompleted ? 'text-gray-900' : 'text-gray-400'
                                } ${isCurrent ? 'text-red-600' : ''}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

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
                        <circle cx="50%" cy="70%" r="3" fill="rgba(255,255,255,0.1)" className="animate-float" style={{ animationDelay: '2s' }} />
                    </svg>
                </div>
                
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        Về trang chủ
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <FileSearch className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Tra cứu đơn hàng</h1>
                            <p className="text-white/80 mt-1">Nhập mã đơn hàng để kiểm tra trạng thái</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Box */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 -mt-8 relative z-10">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={trackingCode}
                                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                                placeholder="Nhập mã đơn hàng (VD: QS12345678)"
                                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-mono"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-500/30 hover:shadow-xl hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang tìm...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Tra cứu
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Results */}
                {loading && (
                    <div className="mt-8 flex justify-center">
                        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!loading && searched && !order && (
                    <div className="mt-8 text-center py-12 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
                        <p className="text-gray-500">Vui lòng kiểm tra lại mã đơn hàng và thử lại</p>
                    </div>
                )}

                {!loading && order && (
                    <div className="mt-8 space-y-6 animate-fadeIn">
                        {/* Order Status Card */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Mã đơn hàng</p>
                                    <p className="text-2xl font-bold font-mono text-red-600">{order.orderCode}</p>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusInfo(order.status).color}`}>
                                    {React.createElement(getStatusInfo(order.status).icon, { className: 'w-4 h-4' })}
                                    {getStatusInfo(order.status).label}
                                </div>
                            </div>

                            {/* Timeline */}
                            <OrderStatusTimeline status={order.status} />
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Info */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-red-500" />
                                    Thông tin giao hàng
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Package className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Người nhận</p>
                                            <p className="font-medium">{order.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Số điện thoại</p>
                                            <p className="font-medium">{order.customerPhone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">{order.customerEmail}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Địa chỉ</p>
                                            <p className="font-medium">{order.shippingAddress}, {order.shippingDistrict}, {order.shippingCity}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Info */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-red-500" />
                                    Thông tin đơn hàng
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                                            <p className="font-medium">{formatDate(order.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                                            <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
                                        </div>
                                    </div>
                                    {order.deliveredAt && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Ngày giao hàng</p>
                                                <p className="font-medium text-green-600">{formatDate(order.deliveredAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Sản phẩm đã đặt</h3>
                            <div className="space-y-3">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Package className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                                            <p className="text-sm text-gray-500">SKU: {item.productSku} • SL: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-red-600">{formatPrice(item.totalPrice)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span>{order.shippingFee == 0 ? <span className="text-green-600">Miễn phí</span> : formatPrice(order.shippingFee)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá</span>
                                        <span>-{formatPrice(order.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                                    <span>Tổng cộng</span>
                                    <span className="text-red-600">{formatPrice(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        {order.note && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Ghi chú:</strong> {order.note}
                                </p>
                            </div>
                        )}

                        {/* Cancel reason */}
                        {order.status === 'cancelled' && order.cancelReason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-800">
                                    <strong>Lý do hủy:</strong> {order.cancelReason}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Help Section */}
                {!order && !searched && (
                    <div className="mt-12 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bạn cần hỗ trợ?</h3>
                        <p className="text-gray-500 mb-6">
                            Nếu bạn không tìm thấy mã đơn hàng hoặc cần hỗ trợ, vui lòng liên hệ:
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="tel:0123456789" className="flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
                                <Phone className="w-5 h-5 text-red-500" />
                                <span className="font-medium">0123 456 789</span>
                            </a>
                            <a href="mailto:support@quangstore.com" className="flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
                                <Mail className="w-5 h-5 text-red-500" />
                                <span className="font-medium">support@quangstore.com</span>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
