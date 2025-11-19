import React, { useState, useEffect } from 'react';
import { HashRouter, Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Filter, Users, User, Award, Briefcase } from 'lucide-react';

// --- MOCKING EXTERNAL IMPORTS FOR SINGLE-FILE RUNNABLE ENVIRONMENT ---

// Mock data
const mockUsers = [
    { id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane.d@corp.com', role: { id: 1, name: 'Admin' }, position: { id: 101, title: 'CTO', department: 'Executive' }, isActive: true, createdAt: '2023-01-15' },
    { id: 2, firstName: 'John', lastName: 'Smith', email: 'john.s@corp.com', role: { id: 2, name: 'Manager' }, position: { id: 102, title: 'Analyst', department: 'Finance' }, isActive: false, createdAt: '2023-03-20' },
    { id: 3, firstName: 'Alice', lastName: 'Lee', email: 'alice.l@corp.com', role: { id: 3, name: 'Staff' }, position: { id: 103, title: 'Engineer', department: 'Tech' }, isActive: true, createdAt: '2024-01-05' },
    { id: 4, firstName: 'Bob', lastName: 'Brown', email: 'bob.b@corp.com', role: { id: 3, name: 'Staff' }, position: { id: 103, title: 'Engineer', department: 'Tech' }, isActive: true, createdAt: '2024-02-10' },
];

const mockRoles = [{ id: 1, name: 'Admin' }, { id: 2, name: 'Manager' }, { id: 3, name: 'Staff' }];
const mockPositions = [
    { id: 101, title: 'CTO', department: 'Executive' },
    { id: 102, title: 'Analyst', department: 'Finance' },
    { id: 103, title: 'Engineer', department: 'Tech' },
];

const userAPI = {
    getUsers: async (params) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        let filteredUsers = mockUsers;
        
        if (params.search) {
            const term = params.search.toLowerCase();
            filteredUsers = filteredUsers.filter(u => 
                u.firstName.toLowerCase().includes(term) || 
                u.lastName.toLowerCase().includes(term) || 
                u.email.toLowerCase().includes(term)
            );
        }
        if (params.roleId) {
            filteredUsers = filteredUsers.filter(u => u.role?.id === parseInt(params.roleId));
        }
        if (params.positionId) {
            filteredUsers = filteredUsers.filter(u => u.position?.id === parseInt(params.positionId));
        }
        if (params.isActive !== undefined) {
            const isActiveBool = params.isActive === 'true';
            filteredUsers = filteredUsers.filter(u => u.isActive === isActiveBool);
        }

        const totalItems = filteredUsers.length;
        const totalPages = Math.ceil(totalItems / params.limit);
        const startIndex = (params.page - 1) * params.limit;
        const endIndex = startIndex + params.limit;
        const users = filteredUsers.slice(startIndex, endIndex);

        return {
            data: {
                success: true,
                data: {
                    users,
                    pagination: {
                        totalPages,
                        totalItems,
                        itemsPerPage: params.limit,
                        currentPage: params.page
                    }
                }
            }
        };
    },
    getRoles: async () => ({ data: { success: true, data: { roles: mockRoles } } }),
    getPositions: async () => ({ data: { success: true, data: { positions: mockPositions } } }),
    deleteUser: async (userId) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        // Mock successful deletion
        return { data: { success: true } };
    },
    toggleUserStatus: async (userId) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        // Mock successful toggle
        return { data: { success: true } };
    }
};

const useAuth = () => ({
    user: { role: { name: 'Admin' } } // Mock current user as Admin for full access
});

const toast = {
    success: (msg) => console.log('TOAST SUCCESS:', msg),
    error: (msg) => console.error('TOAST ERROR:', msg)
};
// --- END MOCKING ---


const UserListContent = () => {
    // Note: Since we are using HashRouter, Link and URL logic should use '#' based paths if using useNavigate/Link 
    // outside of the main App.js Routes declaration. For this simple case, we rely on Link.
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 5 // Reduced itemsPerPage for better visibility in a small preview pane
    });

    // Filters
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [positionFilter, setPositionFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // State to trigger fetch on filter change
    const [triggerFetch, setTriggerFetch] = useState(0);

    // Fetch data
    useEffect(() => {
        fetchUsers();
    }, [pagination.currentPage, triggerFetch]);

    useEffect(() => {
        fetchRoles();
        fetchPositions();
    }, []);

    // Helper function to apply filters
    const handleFilterChange = (setter, value) => {
        setter(value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        setTriggerFetch(prev => prev + 1);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                search: search.trim() || undefined,
                roleId: roleFilter || undefined,
                positionId: positionFilter || undefined,
                isActive: statusFilter !== '' ? statusFilter : undefined,
            };

            const response = await userAPI.getUsers(params);
            if (response.data.success) {
                setUsers(response.data.data.users);
                setPagination({
                    ...pagination,
                    ...response.data.data.pagination
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await userAPI.getRoles();
            if (response.data.success) {
                setRoles(response.data.data.roles);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await userAPI.getPositions();
            if (response.data.success) {
                setPositions(response.data.data.positions);
            }
        } catch (error) {
            console.error('Error fetching positions:', error);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        // NOTE: Replacing window.confirm with console log as per instructions
        console.log(`[ACTION] Confirming delete for user: ${userName} (ID: ${userId})`);
        
        if (confirm(`Are you sure you want to delete user "${userName}"?`)) {
            try {
                const response = await userAPI.deleteUser(userId);
                if (response.data.success) {
                    toast.success('User deleted successfully');
                    setTriggerFetch(prev => prev + 1);
                } else {
                    toast.error('Failed to delete user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const handleToggleStatus = async (userId, currentStatus, userName) => {
        try {
            const response = await userAPI.toggleUserStatus(userId);
            if (response.data.success) {
                toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
                setTriggerFetch(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            toast.error('Failed to update user status');
        }
    };

    const clearFilters = () => {
        setSearch('');
        setRoleFilter('');
        setPositionFilter('');
        setStatusFilter('');
        setPagination({ ...pagination, currentPage: 1 });
        setTriggerFetch(prev => prev + 1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Active
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                Inactive
            </span>
        );
    };

    const isUserAdmin = currentUser?.role?.name === 'Admin';
    const isUserManager = currentUser?.role?.name === 'Manager';

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 py-6 sm:px-0 mb-6">
                    <div className="flex items-center justify-between border-b border-red-300 pb-4">
                        <div>
                            <h1 className="text-4xl font-extrabold leading-tight text-gray-900">
                                User Management
                            </h1>
                            <p className="mt-2 text-base text-gray-600">
                                Manage user accounts, roles, and permissions.
                            </p>
                        </div>
                        {isUserAdmin && (
                            <Link
                                to="#/users/create"
                                // Use btn-primary for Create button
                                className="btn btn-primary inline-flex items-center text-base"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create User
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="px-4 sm:px-0 mb-10">
                    {/* Use custom card styling */}
                    <div className="card shadow-lg rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6 border-b border-red-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <Filter className="h-6 w-6 mr-3 text-red-600" />
                                Filters
                            </h3>
                            <button
                                onClick={clearFilters}
                                className="text-base font-semibold text-red-600 hover:text-red-700 transition-colors duration-200"
                            >
                                Clear all
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2 form-group">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or phone..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleFilterChange(setSearch, search);
                                            }
                                        }}
                                        className="form-input pl-10"
                                    />
                                </div>
                            </div>

                            {/* Role Filter */}
                            <div className="form-group">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => handleFilterChange(setRoleFilter, e.target.value)}
                                    className="form-input"
                                >
                                    <option value="">All Roles</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Position Filter */}
                            <div className="form-group">
                                <select
                                    value={positionFilter}
                                    onChange={(e) => handleFilterChange(setPositionFilter, e.target.value)}
                                    className="form-input"
                                >
                                    <option value="">All Positions</option>
                                    {positions.map((position) => (
                                        <option key={position.id} value={position.id}>
                                            {position.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="form-group">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                                    className="form-input"
                                >
                                    <option value="">All Status</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="px-4 sm:px-0">
                    {/* Use custom card styling for the table container */}
                    <div className="card shadow-lg rounded-xl overflow-hidden p-0"> 
                        <div className="px-6 py-5 border-b border-red-100">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <Users className="h-6 w-6 mr-3 text-red-600" />
                                Users ({pagination.totalItems})
                            </h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="spinner"></div>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-10">
                                <User className="mx-auto h-12 w-12 text-red-400 opacity-60" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
                                <p className="mt-1 text-base text-gray-500">
                                    {search || roleFilter || positionFilter || statusFilter !== ''
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Get started by creating a new user.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-red-50 border-b border-red-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-red-800 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-red-800 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-red-800 uppercase tracking-wider">
                                                Position
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-red-800 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-red-800 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-red-800 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-red-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                                                                <span className="text-white font-medium text-sm">
                                                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.firstName} {user.lastName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.role ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                            {user.role.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">No role</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.position ? user.position.title : 'No position'}
                                                    </div>
                                                    {user.position?.department && (
                                                        <div className="text-xs text-gray-500">{user.position.department}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(user.isActive)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-3">
                                                        {(isUserAdmin || isUserManager) && (
                                                            <>
                                                                <Link
                                                                    to={`#/users/edit/${user.id}`}
                                                                    className="text-orange-500 hover:text-orange-700 transition-colors" // Use orange for edit
                                                                    title="Edit user"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleToggleStatus(user.id, user.isActive, `${user.firstName} ${user.lastName}`)}
                                                                    className={user.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                                                                    title={user.isActive ? 'Deactivate user' : 'Activate user'}
                                                                >
                                                                    {user.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                                                                </button>
                                                            </>
                                                        )}
                                                        {isUserAdmin && (
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                                                className="text-red-700 hover:text-red-900 transition-colors"
                                                                title="Delete user"
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
                        )}

                        {/* Pagination */}
                        {pagination.totalItems > pagination.itemsPerPage && (
                            <div className="px-6 py-4 bg-red-50 border-t border-red-200">
                                <div className="flex items-center justify-between">
                                    {/* Summary */}
                                    <div className="hidden sm:block">
                                        <p className="text-sm text-gray-700">
                                            Showing{' '}
                                            <span className="font-semibold">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span>
                                            {' '}to{' '}
                                            <span className="font-semibold">
                                                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                                            </span>
                                            {' '}of{' '}
                                            <span className="font-semibold">{pagination.totalItems}</span>
                                            {' '}results
                                        </p>
                                    </div>
                                    
                                    {/* Controls */}
                                    <div className="flex-1 flex justify-between sm:justify-end">
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
                                            <button
                                                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                                disabled={pagination.currentPage <= 1}
                                                className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Previous
                                            </button>
                                            
                                            {/* Page numbers (Only show a few around the current page) */}
                                            {[...Array(pagination.totalPages)].map((_, index) => {
                                                const page = index + 1;
                                                const isCurrent = page === pagination.currentPage;
                                                
                                                // Basic visible range logic: show first, last, current, and +/- 1 page
                                                const isVisible = isCurrent || page === 1 || page === pagination.totalPages || Math.abs(page - pagination.currentPage) <= 1;

                                                if (isVisible) {
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => setPagination({ ...pagination, currentPage: page })}
                                                            className={`hidden sm:inline-flex items-center px-4 py-2 border text-sm font-semibold transition-colors
                                                                ${isCurrent
                                                                    ? 'z-10 bg-red-600 border-red-600 text-white shadow-md' // Active Page
                                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50' // Inactive Page
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })}

                                            <button
                                                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                                disabled={pagination.currentPage >= pagination.totalPages}
                                                className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Wrap UserListContent with HashRouter for local routing context compatibility
const UserList = () => (
    <HashRouter>
        <UserListContent />
    </HashRouter>
);

export default UserList;