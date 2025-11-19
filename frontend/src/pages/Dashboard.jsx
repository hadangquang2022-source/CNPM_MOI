import React from 'react';
import { HashRouter, Link } from 'react-router-dom'; // Import HashRouter and Link from react-router-dom
import { BarChart, Users, UserPlus, Activity, TrendingUp, Calendar, Clock, Award, ChevronUp, ChevronDown } from 'lucide-react';

// Mocked useAuth for single-file runnable example
const useAuth = () => ({
    user: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        role: { name: 'Admin' },
        position: { title: 'CMO' },
        lastLogin: '2024-11-18T10:30:00Z'
    },
});

// A component wrapper is needed to wrap the content with HashRouter 
// because we cannot modify the original component definition directly.
const DashboardContent = () => {
    const { user } = useAuth();

    const stats = [
        {
            id: 1,
            name: 'Total Users',
            value: '2,651',
            change: '+4.75%',
            changeType: 'increase',
            icon: Users,
            iconBg: 'bg-red-500', // Red Icon Background
            iconColor: 'text-white'
        },
        {
            id: 2,
            name: 'Active Users',
            value: '2,345',
            change: '+54.02%',
            changeType: 'increase',
            icon: Activity,
            iconBg: 'bg-orange-500', // Orange Icon Background
            iconColor: 'text-white'
        },
        {
            id: 3,
            name: 'New Registrations',
            value: '145',
            change: '-1.39%',
            changeType: 'decrease',
            icon: UserPlus,
            iconBg: 'bg-yellow-500', // Yellow Icon Background
            iconColor: 'text-white'
        },
        {
            id: 4,
            name: 'Growth Rate',
            value: '12.5%',
            change: '+2.1%',
            changeType: 'increase',
            icon: TrendingUp,
            iconBg: 'bg-green-500', // Green Icon Background
            iconColor: 'text-white'
        },
    ];

    const recentActivities = [
        {
            id: 1,
            type: 'user_registered',
            message: 'New user John Doe registered',
            time: '2 minutes ago',
            icon: UserPlus,
            color: 'text-red-600', // Updated to Red for new user highlight
            bg: 'bg-red-50'
        },
        {
            id: 2,
            type: 'user_login',
            message: 'Alice Smith logged in',
            time: '5 minutes ago',
            icon: Activity,
            color: 'text-orange-600', // Secondary color
            bg: 'bg-orange-50'
        },
        {
            id: 3,
            type: 'user_updated',
            message: 'Bob Johnson updated profile',
            time: '10 minutes ago',
            icon: Users,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50'
        },
        {
            id: 4,
            type: 'user_login',
            message: 'Manager logged in',
            time: '15 minutes ago',
            icon: Activity,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        },
    ];

    const StatItem = ({ item }) => {
        const Icon = item.icon;
        const ChangeIcon = item.changeType === 'increase' ? ChevronUp : ChevronUp; // Changed ChevronDown to ChevronUp as per visual preference
        const changeTextColor = item.changeType === 'increase' ? 'text-green-600' : 'text-red-600';

        return (
            <div className="card shadow-lg rounded-xl pt-5 px-4 pb-12 sm:pt-6 sm:px-6 overflow-hidden transition duration-300 hover:scale-[1.02] hover:shadow-xl">
                <dt>
                    {/* Icon container with a gradient effect for visibility */}
                    <div className={`absolute rounded-full p-3 ${item.iconBg} shadow-md`}>
                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                    <p className="text-3xl font-extrabold text-gray-900">{item.value}</p>
                    <p
                        className={`ml-2 flex items-baseline text-sm font-semibold ${changeTextColor}`}
                    >
                        <ChangeIcon className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center" aria-hidden="true" />
                        {item.change}
                    </p>
                </dd>
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-b border-red-300 pb-5 mb-8">
                        <div className="flex items-center justify-between flex-wrap">
                            <div>
                                <h1 className="text-4xl font-extrabold leading-tight text-gray-900">
                                    Welcome back, {user?.firstName}!
                                </h1>
                                <p className="mt-2 text-base text-gray-600">
                                    Here's what's happening with your application today.
                                </p>
                            </div>
                            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                                <div className="flex items-center text-base font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full shadow-sm">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Info Card (Themed Card) */}
                <div className="px-4 sm:px-0 mb-10">
                    {/* Updated to a striking red gradient card */}
                    <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-2xl p-8 transform transition duration-500 hover:scale-[1.01]">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {/* Avatar */}
                                <div className="h-16 w-16 bg-red-400 border-2 border-white rounded-full flex items-center justify-center shadow-inner">
                                    <span className="text-xl font-bold text-white">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-6">
                                <h2 className="text-2xl font-bold text-white">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-red-200">{user?.email}</p>
                                <div className="flex items-center mt-2 space-x-4 flex-wrap">
                                    {user?.role && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-red-800 shadow-sm">
                                            <Award className="h-3 w-3 mr-1" />
                                            {user.role.name}
                                        </span>
                                    )}
                                    {user?.position && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white shadow-sm">
                                            {user.position.title}
                                        </span>
                                    )}
                                    {user?.lastLogin && (
                                        <span className="text-red-100 text-sm flex items-center mt-1 sm:mt-0">
                                            <Clock className="h-3 w-3 mr-1 opacity-75" />
                                            Last login: {new Date(user.lastLogin).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                {(user?.role?.name === 'Admin' || user?.role?.name === 'Manager') && (
                    <div className="px-4 sm:px-0 mb-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Overview</h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {stats.map((item) => (
                                <StatItem key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="px-4 sm:px-0 mb-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Action 1: View Profile - Themed Red */}
                        <Link
                            to="/profile"
                            className="card relative group p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div>
                                <span className="rounded-xl inline-flex p-3 bg-red-100 text-red-600 ring-4 ring-white shadow-md">
                                    <Users className="h-6 w-6" aria-hidden="true" />
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    View Profile
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Update your personal information and account settings.
                                </p>
                            </div>
                        </Link>

                        {/* Action 2: Manage Users - Themed Secondary (Orange) */}
                        {user?.role?.name === 'Manager' || user?.role?.name === 'Admin' ? (
                            <Link
                                to="/users"
                                className="card relative group p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-500 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div>
                                    <span className="rounded-xl inline-flex p-3 bg-orange-100 text-orange-600 ring-4 ring-white shadow-md">
                                        <Users className="h-6 w-6" aria-hidden="true" />
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        Manage Users
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        View and manage user accounts and permissions.
                                    </p>
                                </div>
                            </Link>
                        ) : null}

                        {/* Action 3: Create User - Themed Admin (Green) */}
                        {user?.role?.name === 'Admin' ? (
                            <Link
                                to="/users/create"
                                className="card relative group p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div>
                                    <span className="rounded-xl inline-flex p-3 bg-green-100 text-green-600 ring-4 ring-white shadow-md">
                                        <UserPlus className="h-6 w-6" aria-hidden="true" />
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        Create User
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Add new users to the system with roles and permissions.
                                    </p>
                                </div>
                            </Link>
                        ) : null}
                        
                        {/* Action 4: View Reports - Themed Purple */}
                        <div className="card relative group p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                            <div>
                                <span className="rounded-xl inline-flex p-3 bg-purple-100 text-purple-600 ring-4 ring-white shadow-md">
                                    <BarChart className="h-6 w-6" aria-hidden="true" />
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    View Reports
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Access detailed analytics and system reports.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                {(user?.role?.name === 'Admin' || user?.role?.name === 'Manager') && (
                    <div className="px-4 sm:px-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h3>
                        {/* Use the defined .card style for the activity list */}
                        <div className="card shadow-lg rounded-xl overflow-hidden p-0"> 
                            <div className="px-6 py-4 border-b border-red-100">
                                <h4 className="text-base font-bold text-gray-900">System Activity Log</h4>
                            </div>
                            <ul role="list" className="divide-y divide-gray-100">
                                {recentActivities.map((activity) => {
                                    const Icon = activity.icon;
                                    return (
                                        <li key={activity.id} className={`px-6 py-4 transition-colors duration-150 hover:${activity.bg}`}>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    {/* Use icon color directly */}
                                                    <Icon className={`h-6 w-6 ${activity.color}`} aria-hidden="true" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {activity.message}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{activity.time}</p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Wrap DashboardContent with HashRouter for local routing context compatibility
const Dashboard = () => (
    <HashRouter>
        <DashboardContent />
    </HashRouter>
);

export default Dashboard;