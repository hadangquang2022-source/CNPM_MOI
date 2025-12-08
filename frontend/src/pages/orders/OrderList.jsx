import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Package, 
    Search, 
    Filter, 
    Eye, 
    Clock, 
    CheckCircle, 
    Truck, 
    XCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Calendar,
    DollarSign,
    ShoppingBag,
    TrendingUp
} from 'lucide-react';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, [pagination.currentPage, statusFilter, paymentStatusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                search: search || undefined,
                status: statusFilter || undefined,
                paymentStatus: paymentStatusFilter || undefined
            };

            const response = await orderAPI.getOrders(params);
            if (response.data.success) {
                setOrders(response.data.data.orders);
                setPagination(prev => ({
                    ...prev,
                    ...response.data.data.pagination
                }));
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await orderAPI.getOrderStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchOrders();
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await orderAPI.updateOrderStatus(orderId, { status: newStatus });
            if (response.data.success) {
                toast.success('Cập nhật trạng thái thành công');
                fetchOrders();
                fetchStats();
                setShowModal(false);
            }
        } catch (error) {
            console.error('Update status error:', error);
            toast.error('Không thể cập nhật trạng thái');
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

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
            processing: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800', icon: RefreshCw },
            shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800', icon: Truck },
            delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800', icon: CheckCircle },
            cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'Chưa thanh toán', color: 'bg-gray-100 text-gray-800' },
            paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
            failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800' },
            refunded: { label: 'Đã hoàn tiền', color: 'bg-orange-100 text-orange-800' }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 py-8">
            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        Quản lý đơn hàng
                    </h1>
                    <p className="text-gray-500 mt-1">Xem và quản lý tất cả đơn hàng</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                                    <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                                    <p className="text-sm text-gray-500">Chờ xử lý</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                                    <p className="text-sm text-gray-500">Hoàn thành</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-orange-100 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                                    <p className="text-sm text-gray-500">Doanh thu</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm theo mã đơn, tên, email, SĐT..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </form>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPagination(prev => ({ ...prev, currentPage: 1 }));
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ xác nhận</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="shipping">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>

                        <select
                            value={paymentStatusFilter}
                            onChange={(e) => {
                                setPaymentStatusFilter(e.target.value);
                                setPagination(prev => ({ ...prev, currentPage: 1 }));
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Thanh toán</option>
                            <option value="pending">Chưa thanh toán</option>
                            <option value="paid">Đã thanh toán</option>
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Không có đơn hàng nào</h3>
                            <p className="text-gray-500">Chưa có đơn hàng nào phù hợp với bộ lọc</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã đơn</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khách hàng</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tổng tiền</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thanh toán</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày đặt</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono font-semibold text-red-600">{order.orderCode}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{order.customerName}</p>
                                                        <p className="text-sm text-gray-500">{order.customerPhone}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(order.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getPaymentStatusBadge(order.paymentStatus)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowModal(true);
                                                        }}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} / {pagination.totalItems} đơn hàng
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                            disabled={pagination.currentPage <= 1}
                                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                            disabled={pagination.currentPage >= pagination.totalPages}
                                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Order Detail Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
                                    <p className="text-sm text-gray-500 font-mono">{selectedOrder.orderCode}</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <XCircle className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                    <p><span className="text-gray-500">Họ tên:</span> <span className="font-medium">{selectedOrder.customerName}</span></p>
                                    <p><span className="text-gray-500">Email:</span> {selectedOrder.customerEmail}</p>
                                    <p><span className="text-gray-500">SĐT:</span> {selectedOrder.customerPhone}</p>
                                    <p><span className="text-gray-500">Địa chỉ:</span> {selectedOrder.shippingAddress}, {selectedOrder.shippingDistrict}, {selectedOrder.shippingCity}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Sản phẩm</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-sm text-gray-500">x{item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Tạm tính:</span>
                                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Phí vận chuyển:</span>
                                    <span>{formatPrice(selectedOrder.shippingFee)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng cộng:</span>
                                    <span className="text-red-600">{formatPrice(selectedOrder.totalAmount)}</span>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Cập nhật trạng thái</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                                            disabled={selectedOrder.status === status}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                selectedOrder.status === status
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-100 hover:bg-red-100 hover:text-red-600'
                                            }`}
                                        >
                                            {getStatusBadge(status)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderList;
