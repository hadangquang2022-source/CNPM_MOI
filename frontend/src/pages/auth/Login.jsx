import React, { useState } from 'react';
import { HashRouter, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

// --- MOCK AUTH ---
const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const login = async (credentials) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);

        if (credentials.email.includes('admin') && credentials.password === 'admin123') return { success: true };
        if (credentials.email.includes('manager') && credentials.password === 'manager123') return { success: true };
        if (credentials.email.includes('alice') && credentials.password === 'alice123') return { success: true };
        return { success: false, message: 'Invalid email or password.' };
    };
    return { login, isLoading };
};
// --- END MOCK ---

const schema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginContent = () => {
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
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Illustration / Welcome */}
            <div className="lg:w-1/2 bg-gradient-to-tr from-red-500 to-red-600 flex items-center justify-center p-12">
                <div className="text-white text-center space-y-4">
                    <h1 className="text-4xl font-bold">Welcome Back!</h1>
                    <p className="text-lg">Sign in to access your dashboard and manage your tasks.</p>
                    {/* Optional illustration */}
                    <img
                        src="https://source.unsplash.com/400x300/?technology,office"
                        alt="Illustration"
                        className="mx-auto mt-6 rounded-xl shadow-lg"
                    />
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="lg:w-1/2 flex items-center justify-center p-12 bg-gray-50">
                <div className="w-full max-w-md space-y-8 bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center">
                        <LogIn className="mx-auto h-14 w-14 text-red-600" />
                        <h2 className="mt-4 text-3xl font-bold text-gray-900">Sign in to your account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Or{' '}
                            <Link to="/register" className="font-semibold text-red-600 hover:text-red-700 underline transition-colors">
                                create a new account
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        {/* Email */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`w-full py-2 pl-10 pr-3 border rounded-lg focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className={`w-full py-2 pl-10 pr-10 border rounded-lg focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                                        errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="********"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" className="h-4 w-4 text-red-600 rounded focus:ring-red-500 border-gray-300" />
                                <span className="text-gray-700">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="font-medium text-red-600 hover:text-red-700 underline transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Root Error */}
                        {errors.root && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                                {errors.root.message}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-all ${
                                isLoading ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Login = () => <LoginContent />;
export default Login;
