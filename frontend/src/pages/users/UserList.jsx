import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
    Users, 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    ToggleLeft, 
    ToggleRight,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    Shield,
    UserCheck,
    UserX,
    RefreshCw
} from 'lucide-react';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roles, setRoles] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm || undefined,
                roleId: roleFilter || undefined,
                isActive: statusFilter !== '' ? statusFilter : undefined
            };

            const response = await userAPI.getUsers(params);
            // API returns { success: true, data: { users: [...], pagination: {...} } }
            const usersData = response.data?.data?.users || response.data?.users || [];
            const paginationData = response.data?.data?.pagination || response.data?.pagination || {};
            
            setUsers(Array.isArray(usersData) ? usersData : []);
            setPagination(prev => ({
                ...prev,
                total: paginationData.totalItems || paginationData.total || 0,
                totalPages: paginationData.totalPages || 1
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Không thể tải danh sách người dùng');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch roles for filter
    const fetchRoles = async () => {
        try {
            const response = await userAPI.getRoles();
            // API returns { success: true, data: { roles: [...] } }
            const rolesData = response.data?.data?.roles || response.data?.roles || response.data || [];
            setRoles(Array.isArray(rolesData) ? rolesData : []);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setRoles([]);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, searchTerm, roleFilter, statusFilter]);

    // Handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Handle toggle status
    const handleToggleStatus = async (userId) => {
        try {
            await userAPI.toggleUserStatus(userId);
            toast.success('Đã cập nhật trạng thái người dùng');
            fetchUsers();
        } catch (error) {
            console.error('Error toggling user status:', error);
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    // Handle delete user
    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${userName}"?`)) {
            return;
        }

        try {
            await userAPI.deleteUser(userId);
            toast.success('Đã xóa người dùng');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || 'Không thể xóa người dùng');
        }
    };

    // Get role badge color
    const getRoleBadgeColor = (roleName) => {
        switch (roleName?.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'manager':
                return 'bg-purple-100 text-purple-800';
            case 'staff':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-red-600 mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Tổng cộng {pagination.total} người dùng
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-3">
                            <button
                                onClick={fetchUsers}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Làm mới
                            </button>
                            <Link
                                to="/users/create"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm người dùng
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        {/* Role Filter */}
                        <div>
                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Tất cả vai trò</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Đã khóa</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setRoleFilter('');
                                    setStatusFilter('');
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
                            <p className="mt-2 text-gray-500">Đang tải...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có người dùng</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Chưa có người dùng nào phù hợp với bộ lọc.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Người dùng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Liên hệ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vai trò
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {user.avatar ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`}
                                                                alt={`${user.firstName} ${user.lastName}`}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                                <span className="text-red-600 font-medium text-sm">
                                                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {user.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                                        {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role?.name)}`}>
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    {user.role?.name || 'Customer'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.isActive ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <UserCheck className="h-3 w-3 mr-1" />
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <UserX className="h-3 w-3 mr-1" />
                                                        Đã khóa
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            user.isActive 
                                                                ? 'text-green-600 hover:bg-green-50' 
                                                                : 'text-red-600 hover:bg-red-50'
                                                        }`}
                                                        title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                                    >
                                                        {user.isActive ? (
                                                            <ToggleRight className="h-5 w-5" />
                                                        ) : (
                                                            <ToggleLeft className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                    <Link
                                                        to={`/users/edit/${user.id}`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Hiển thị{' '}
                                        <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                                        {' '}-{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                                        </span>
                                        {' '}trong{' '}
                                        <span className="font-medium">{pagination.total}</span> người dùng
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                            disabled={pagination.page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        {[...Array(pagination.totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    pagination.page === i + 1
                                                        ? 'z-10 bg-red-50 border-red-500 text-red-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                            disabled={pagination.page === pagination.totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserList;
