import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Package, 
    Clock, 
    CheckCircle, 
    Truck, 
    XCircle,
    RefreshCw,
    ChevronRight,
    ShoppingBag,
    MapPin,
    Search
} from 'lucide-react';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const MyOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [trackingCode, setTrackingCode] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);

    useEffect(() => {
        if (user) {
            fetchMyOrders();
        }
    }, [user, statusFilter]);

    const fetchMyOrders = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getMyOrders({ status: statusFilter || undefined });
            if (response.data.success) {
                setOrders(response.data.data.orders);
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
            toast.error('Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleTrackOrder = async (e) => {
        e.preventDefault();
        if (!trackingCode.trim()) {
            toast.error('Vui lòng nhập mã đơn hàng');
            return;
        }

        try {
            const response = await orderAPI.trackOrder(trackingCode.trim());
            if (response.data.success) {
                setTrackingResult(response.data.data.order);
            }
        } catch (error) {
            console.error('Track order error:', error);
            toast.error('Không tìm thấy đơn hàng với mã này');
            setTrackingResult(null);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

        try {
            const response = await orderAPI.cancelOrder(orderId, { reason: 'Khách hàng hủy đơn' });
            if (response.data.success) {
                toast.success('Đã hủy đơn hàng');
                fetchMyOrders();
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error('Cancel order error:', error);
            toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
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
            shipping: { label: 'Đang giao', color: 'text-purple-600 bg-purple-100', icon: Truck, step: 4 },
            delivered: { label: 'Đã giao', color: 'text-green-600 bg-green-100', icon: CheckCircle, step: 5 },
            cancelled: { label: 'Đã hủy', color: 'text-red-600 bg-red-100', icon: XCircle, step: 0 }
        };
        return statusConfig[status] || statusConfig.pending;
    };

    const OrderStatusTimeline = ({ status }) => {
        const steps = ['confirmed', 'processing', 'shipping', 'delivered'];
        const currentStep = getStatusInfo(status).step;

        if (status === 'cancelled') {
            return (
                <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Đơn hàng đã bị hủy</span>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10">
                    <div 
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                        style={{ width: `${Math.min(((currentStep - 1) / 4) * 100, 100)}%` }}
                    ></div>
                </div>
                {steps.map((step, index) => {
                    const stepInfo = getStatusInfo(step);
                    const isCompleted = currentStep > index + 1;
                    const isCurrent = currentStep === index + 1;
                    const Icon = stepInfo.icon;

                    return (
                        <div key={step} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted || isCurrent
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                    : 'bg-gray-200 text-gray-400'
                            }`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-xs mt-2 ${isCurrent ? 'font-semibold text-red-600' : 'text-gray-500'}`}>
                                {stepInfo.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 py-8">
            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        Đơn hàng của tôi
                    </h1>
                    <p className="text-gray-500 mt-1">Theo dõi và quản lý đơn hàng</p>
                </div>

                {/* Track Order */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-red-500" />
                        Tra cứu đơn hàng
                    </h2>
                    <form onSubmit={handleTrackOrder} className="flex gap-3">
                        <input
                            type="text"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                            placeholder="Nhập mã đơn hàng (VD: QS12345678)"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
                        >
                            Tra cứu
                        </button>
                    </form>

                    {/* Tracking Result */}
                    {trackingResult && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-mono font-semibold text-red-600">{trackingResult.orderCode}</p>
                                    <p className="text-sm text-gray-500">{formatDate(trackingResult.createdAt)}</p>
                                </div>
                                <span className="font-bold text-lg">{formatPrice(trackingResult.totalAmount)}</span>
                            </div>
                            <OrderStatusTimeline status={trackingResult.status} />
                        </div>
                    )}
                </div>

                {/* Filter Tabs */}
                {user && (
                    <>
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {[
                                { value: '', label: 'Tất cả' },
                                { value: 'pending', label: 'Chờ xác nhận' },
                                { value: 'processing', label: 'Đang xử lý' },
                                { value: 'shipping', label: 'Đang giao' },
                                { value: 'delivered', label: 'Đã giao' },
                                { value: 'cancelled', label: 'Đã hủy' }
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setStatusFilter(tab.value)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                        statusFilter === tab.value
                                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                                            : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Orders List */}
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-12 text-center">
                                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                                <p className="text-gray-500 mb-6">Hãy mua sắm để có đơn hàng đầu tiên</p>
                                <Link
                                    to="/shop"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
                                >
                                    Mua sắm ngay
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => {
                                    const statusInfo = getStatusInfo(order.status);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <div
                                            key={order.id}
                                            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden"
                                        >
                                            {/* Order Header */}
                                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono font-semibold text-red-600">{order.orderCode}</span>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                                            </div>

                                            {/* Order Items */}
                                            <div className="p-4">
                                                {order.items?.slice(0, 2).map((item, index) => (
                                                    <div key={index} className="flex items-center gap-3 mb-3">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <Package className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                                                            <p className="text-sm text-gray-500">x{item.quantity}</p>
                                                        </div>
                                                        <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
                                                    </div>
                                                ))}
                                                {order.items?.length > 2 && (
                                                    <p className="text-sm text-gray-500">+{order.items.length - 2} sản phẩm khác</p>
                                                )}
                                            </div>

                                            {/* Order Footer */}
                                            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm text-gray-500">Tổng tiền: </span>
                                                    <span className="font-bold text-lg text-red-600">{formatPrice(order.totalAmount)}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {['pending', 'confirmed'].includes(order.status) && (
                                                        <button
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Hủy đơn
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                                    >
                                                        Chi tiết
                                                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Order Details (Expanded) */}
                                            {selectedOrder?.id === order.id && (
                                                <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-red-500" />
                                                            Địa chỉ giao hàng
                                                        </h4>
                                                        <p className="text-gray-600">
                                                            {order.customerName} - {order.customerPhone}<br />
                                                            {order.shippingAddress}, {order.shippingDistrict}, {order.shippingCity}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-2">Tiến trình đơn hàng</h4>
                                                        <OrderStatusTimeline status={order.status} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {!user && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Đăng nhập để xem đơn hàng</h3>
                        <p className="text-gray-500 mb-6">Hoặc sử dụng mã đơn hàng để tra cứu ở trên</p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
