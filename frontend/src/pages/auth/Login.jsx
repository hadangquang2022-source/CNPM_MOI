import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const schema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, setError } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = async (data) => {
        setError('root', { type: 'manual', message: '' });
        const result = await login(data);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError('root', { type: 'manual', message: result.message || 'Login failed' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
            {/* Left Side - Gradient Hero */}
            <div className="lg:w-1/2 relative bg-gradient-to-br from-rose-500 via-pink-500 to-violet-600 flex items-center justify-center p-12 overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute top-1/2 -right-20 w-60 h-60 bg-pink-300/20 rounded-full blur-2xl animate-float delay-300"></div>
                    <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl animate-float delay-500"></div>
                </div>
                
                <div className="relative z-10 text-white text-center space-y-6 animate-fadeIn">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium animate-bounce-slow">
                        <Sparkles className="w-4 h-4" />
                        <span>Welcome to QuangStore</span>
                    </div>
                    <h1 className="text-5xl font-bold leading-tight">
                        Welcome<br />
                        <span className="text-pink-200">Back!</span>
                    </h1>
                    <p className="text-lg text-white/80 max-w-md">
                        Sign in to access your dashboard and manage your products with ease.
                    </p>
                    
                    {/* Floating Cards */}
                    <div className="flex justify-center gap-4 mt-8">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 transform hover:scale-105 transition-all duration-300 animate-fadeInUp delay-200">
                            <div className="text-3xl font-bold">50K+</div>
                            <div className="text-sm text-white/70">Products</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 transform hover:scale-105 transition-all duration-300 animate-fadeInUp delay-300">
                            <div className="text-3xl font-bold">10K+</div>
                            <div className="text-sm text-white/70">Users</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 transform hover:scale-105 transition-all duration-300 animate-fadeInUp delay-400">
                            <div className="text-3xl font-bold">99%</div>
                            <div className="text-sm text-white/70">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-full max-w-md space-y-8 bg-white rounded-3xl shadow-2xl p-8 animate-fadeInUp relative overflow-hidden">
                    {/* Gradient Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600"></div>
                    
                    <div className="text-center animate-fadeIn">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-violet-600 rounded-2xl shadow-lg shadow-rose-500/30 mb-4 transform hover:rotate-6 transition-transform duration-300">
                            <LogIn className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Sign in
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold bg-gradient-to-r from-rose-500 to-violet-600 bg-clip-text text-transparent hover:from-violet-600 hover:to-rose-500 transition-all">
                                Create one
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        {/* Email */}
                        <div className="animate-fadeInUp delay-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`w-full py-3 pl-12 pr-4 border-2 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-300 ${
                                        errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-xs text-red-500 flex items-center gap-1 animate-fadeIn">
                                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="animate-fadeInUp delay-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                                </div>
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className={`w-full py-3 pl-12 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-300 ${
                                        errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-rose-500 transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-rose-500 transition-colors" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-xs text-red-500 flex items-center gap-1 animate-fadeIn">
                                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between text-sm animate-fadeInUp delay-300">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500 transition-all" />
                                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="font-medium text-rose-500 hover:text-violet-600 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Root Error */}
                        {errors.root && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg p-4 text-sm animate-shake">
                                {errors.root.message}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 px-6 bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 hover:from-violet-600 hover:via-pink-500 hover:to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 focus:outline-none focus:ring-4 focus:ring-rose-500/30 transform hover:-translate-y-0.5 transition-all duration-300 animate-fadeInUp delay-400 ${
                                isLoading ? 'opacity-60 cursor-not-allowed transform-none' : ''
                            }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
