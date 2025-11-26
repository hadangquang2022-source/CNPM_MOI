import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Activity, TrendingUp, Calendar, Award, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef();

    const lastProductRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        }, { threshold: 0.5 });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const stats = [
        { id: 1, name: 'Total Users', value: '2,651', change: '+4.75%', changeType: 'increase', icon: Users, iconBg: 'bg-red-500' },
        { id: 2, name: 'Active Users', value: '2,345', change: '+54.02%', changeType: 'increase', icon: Activity, iconBg: 'bg-orange-500' },
        { id: 3, name: 'New Registrations', value: '145', change: '-1.39%', changeType: 'decrease', icon: UserPlus, iconBg: 'bg-yellow-500' },
        { id: 4, name: 'Growth Rate', value: '12.5%', change: '+2.1%', changeType: 'increase', icon: TrendingUp, iconBg: 'bg-green-500' },
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:5000/products/all?page=${page}&limit=4`);
                const result = await response.json();
                if (result.data) {
                    setProducts(prev => [...prev, ...result.data]);
                    setHasMore(result.pagination?.hasMore || false);
                } else {
                    setError('No products found');
                }
            } catch (err) {
                setError('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [page]);

    const StatCard = ({ item }) => {
        const Icon = item.icon;
        const ChangeIcon = item.changeType === 'increase' ? ChevronUp : ChevronDown;
        const changeColor = item.changeType === 'increase' ? 'text-green-600' : 'text-red-600';
        return (
            <div className="relative bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-transform transform hover:-translate-y-1">
                <div className={`absolute top-6 left-6 p-3 rounded-full ${item.iconBg}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500">{item.name}</p>
                <div className="ml-16 mt-1 flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className={`ml-2 flex items-center text-sm font-semibold ${changeColor}`}>
                        <ChangeIcon className="h-4 w-4 mr-1" />
                        {item.change}
                    </p>
                </div>
            </div>
        );
    };

    const ProductCard = ({ product, refProp }) => {
        let statusColor = 'bg-green-100 text-green-600';
        if (product.stockQuantity === 0) statusColor = 'bg-red-100 text-red-600';
        else if (product.stockQuantity < 50) statusColor = 'bg-yellow-100 text-yellow-600';

        return (
            <div
                ref={refProp}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1"
            >
                <h3 className="text-lg font-bold text-gray-900">{product.productName}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                <p className="mt-2 text-lg font-semibold text-red-600">${product.price}</p>
                <p className="mt-1 text-sm text-gray-500">Stock: {product.stockQuantity}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                    {product.stockQuantity === 0 ? 'Out of Stock' : product.stockQuantity < 50 ? 'Low Stock' : 'In Stock'}
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900">
                            Welcome back, {user?.firstName || 'Guest'}!
                        </h1>
                        <p className="mt-2 text-gray-600">Here's what's happening with your application today.</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3 text-red-600 bg-red-100 px-3 py-1 rounded-full shadow-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* User Info - Only show when logged in */}
                {user && (
                    <div className="mb-10 bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-2xl p-6 flex items-center space-x-6 hover:scale-[1.01] transform transition duration-500">
                        <div className="h-16 w-16 bg-red-400 rounded-full flex items-center justify-center shadow-inner border-2 border-white text-white font-bold text-xl">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.firstName} {user.lastName}</h2>
                            <p className="text-red-200">{user.email}</p>
                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                                {user.role && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-red-800 shadow-sm">
                                        <Award className="h-3 w-3 mr-1" />{user.role.name}
                                    </span>
                                )}
                                {user.position && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white shadow-sm">
                                        {user.position.title}
                                    </span>
                                )}
                                <Link to="/profile" className="ml-2 text-sm underline text-white hover:text-red-200">
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
