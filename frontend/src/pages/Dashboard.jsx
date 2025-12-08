import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Users, Award, Package, ShoppingBag, Sparkles, ArrowRight, Heart, Clock, ShoppingCart,
    Truck, CheckCircle, FileText, Store, ClipboardList, Settings,
    DollarSign, Eye, UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, productAPI, userAPI } from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const isAdmin = user?.role?.name === 'Admin';
    const isManager = user?.role?.name === 'Manager' || isAdmin;

    // Admin stats
    const [adminStats, setAdminStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        revenue: 0
    });

    // Customer stats  
    const [customerStats, setCustomerStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isManager) {
            fetchAdminData();
        } else {
            fetchCustomerData();
        }
    }, [isManager]);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const [ordersRes, productsRes, usersRes] = await Promise.all([
                orderAPI.getOrders({ limit: 5 }),
                productAPI.getProducts({ limit: 1 }),
                userAPI.getUsers({ limit: 1 })
            ]);

            // Get stats
            let statsRes;
            try {
                statsRes = await orderAPI.getOrderStats();
            } catch (e) {
                console.log('Stats not available');
            }

            setAdminStats({
                totalUsers: usersRes.data?.pagination?.total || 0,
                totalProducts: productsRes.data?.pagination?.total || 0,
                totalOrders: ordersRes.data?.pagination?.total || 0,
                revenue: statsRes?.data?.data?.totalRevenue || 0
            });

            setRecentOrders(ordersRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerData = async () => {
        try {
            setLoading(true);
            const ordersRes = await orderAPI.getMyOrders({ limit: 5 });
            const orders = ordersRes.data?.data || [];
            
            setCustomerStats({
                totalOrders: ordersRes.data?.pagination?.total || orders.length,
                pendingOrders: orders.filter(o => ['pending', 'confirmed', 'processing', 'shipping'].includes(o.status)).length,
                completedOrders: orders.filter(o => o.status === 'delivered').length
            });

            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price || 0);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-blue-100 text-blue-700',
            processing: 'bg-indigo-100 text-indigo-700',
            shipping: 'bg-purple-100 text-purple-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            processing: 'Đang xử lý',
            shipping: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy'
        };
        return texts[status] || status;
    };

    // Admin Dashboard
    const AdminDashboard = () => (
        <>
            {/* Admin Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Tổng người dùng</p>
                            <p className="text-3xl font-bold text-gray-900">{adminStats.totalUsers}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Tổng sản phẩm</p>
                            <p className="text-3xl font-bold text-gray-900">{adminStats.totalProducts}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Tổng đơn hàng</p>
                            <p className="text-3xl font-bold text-gray-900">{adminStats.totalOrders}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Doanh thu</p>
                            <p className="text-2xl font-bold text-gray-900">{formatPrice(adminStats.revenue)}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quản lý nhanh</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <Link to="/orders" className="group bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                            <ClipboardList className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-orange-600">Đơn hàng</span>
                    </Link>

                    <Link to="/products" className="group bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                            <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-green-600">Sản phẩm</span>
                    </Link>

                    <Link to="/users" className="group bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-blue-600">Người dùng</span>
                    </Link>

                    {isAdmin && (
                        <Link to="/products/create" className="group bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                <UserPlus className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-purple-600">Thêm SP</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Recent Orders for Admin */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2>
                    <Link to="/orders" className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                
                {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Mã đơn</th>
                                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Khách hàng</th>
                                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Tổng tiền</th>
                                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Trạng thái</th>
                                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Ngày đặt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-2">
                                            <span className="font-mono text-sm font-medium text-red-600">{order.orderCode}</span>
                                        </td>
                                        <td className="py-3 px-2 text-sm text-gray-700">{order.customerName}</td>
                                        <td className="py-3 px-2 text-sm font-semibold text-gray-900">{formatPrice(order.totalAmount)}</td>
                                        <td className="py-3 px-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Chưa có đơn hàng nào</p>
                    </div>
                )}
            </div>
        </>
    );

    // Customer Dashboard
    const CustomerDashboard = () => (
        <>
            {/* Customer Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Tổng đơn hàng</p>
                            <p className="text-3xl font-bold text-gray-900">{customerStats.totalOrders}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Đang xử lý</p>
                            <p className="text-3xl font-bold text-orange-600">{customerStats.pendingOrders}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Đã hoàn thành</p>
                            <p className="text-3xl font-bold text-green-600">{customerStats.completedOrders}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Truy cập nhanh</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Link to="/shop" className="group bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-red-600">Cửa hàng</span>
                    </Link>

                    <Link to="/cart" className="group bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-blue-600">Giỏ hàng</span>
                    </Link>

                    <Link to="/wishlist" className="group bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-pink-600">Yêu thích</span>
                    </Link>

                    <Link to="/my-orders" className="group bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-green-600">Đơn hàng</span>
                    </Link>
                </div>
            </div>

            {/* More Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Link to="/recently-viewed" className="group bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                        <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">Đã xem gần đây</h3>
                        <p className="text-sm text-gray-500">Xem lại các sản phẩm bạn đã duyệt</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link to="/track-order" className="group bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                        <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">Tra cứu đơn hàng</h3>
                        <p className="text-sm text-gray-500">Kiểm tra trạng thái đơn hàng</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

            {/* Recent Orders for Customer */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2>
                    <Link to="/my-orders" className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                
                {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                                        <ShoppingBag className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{order.orderCode}</p>
                                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
                        <Link 
                            to="/shop"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
                        >
                            <Store className="w-5 h-5" />
                            Mua sắm ngay
                        </Link>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
            {/* Decorative Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium text-red-600">
                            {isManager ? 'Bảng điều khiển quản trị' : 'Trang cá nhân'}
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Xin chào, <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">{user?.firstName || 'Bạn'}!</span>
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isManager 
                            ? 'Quản lý cửa hàng và theo dõi hoạt động kinh doanh' 
                            : 'Theo dõi đơn hàng và khám phá sản phẩm mới'}
                    </p>
                </div>

                {/* User Card */}
                <div className="mb-8 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl shadow-xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                    
                    <div className="relative flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-xl border-2 border-white/30">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
                            <p className="text-white/80">{user?.email}</p>
                            {user?.role && (
                                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                                    <Award className="w-4 h-4" />
                                    {user.role.name}
                                </span>
                            )}
                        </div>
                        <Link 
                            to="/profile"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all border border-white/30"
                        >
                            <Settings className="w-4 h-4" />
                            Hồ sơ
                        </Link>
                    </div>
                </div>

                {/* Render Dashboard based on role */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : isManager ? (
                    <AdminDashboard />
                ) : (
                    <CustomerDashboard />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
