import React, { useState } from 'react';
import { HashRouter, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

// --- MOCKING EXTERNAL IMPORTS FOR SINGLE-FILE RUNNABLE ENVIRONMENT ---
const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    const login = async (credentials) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        
        if (credentials.email.includes('admin') && credentials.password === 'admin123') {
            return { success: true, message: 'Admin login successful' };
        }
        if (credentials.email.includes('manager') && credentials.password === 'manager123') {
            return { success: true, message: 'Manager login successful' };
        }
        if (credentials.email.includes('alice') && credentials.password === 'alice123') {
            return { success: true, message: 'Employee login successful' };
        }
        return { success: false, message: 'Invalid email or password.' };
    };

    return { login, isLoading };
};
// --- END MOCKING ---

const schema = yup.object({
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

const LoginContent = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuth();
    // useNavigate needs HashRouter context
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        // Clear previous root errors
        setError('root', { type: 'manual', message: '' }); 

        const result = await login(data);

        if (result.success) {
            // Navigate using hash path for single-file compatibility
            navigate('#/dashboard');
        } else {
            setError('root', {
                type: 'manual',
                message: result.message || 'Login failed'
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    {/* Icon: Themed Red */}
                    <LogIn className="mx-auto h-12 w-12 text-red-600" />
                    <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-base text-gray-600">
                        Or{' '}
                        <Link
                            to="#/register"
                            // Themed Red Link
                            className="font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Auth Card: Use custom card styling */}
                <div className="card py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        
                        {/* Email Field */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    autoComplete="email"
                                    // Use custom form-input and error classes
                                    className={`form-input pl-10 ${errors.email ? 'error' : ''}`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="error-message">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    // Use custom form-input and error classes
                                    className={`form-input pl-10 pr-10 ${errors.password ? 'error' : ''}`}
                                    placeholder="Enter your password"
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
                            {errors.password && (
                                <p className="error-message">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember & Forgot Password */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center">
                                {/* Checkbox: Themed Red */}
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link
                                    to="#/forgot-password"
                                    // Themed Red Link
                                    className="font-medium text-red-600 hover:text-red-700 transition-colors"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errors.root && (
                            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                                <div className="text-sm font-medium text-red-700">{errors.root.message}</div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                // Use btn-primary for red gradient/shadow
                                className={`btn btn-primary w-full text-base ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <div className="spinner mr-2"></div>
                                ) : (
                                    <LogIn className="h-5 w-5 mr-2 text-white" />
                                )}
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    {/* Test Credentials */}
                    <div className="mt-6 border-t border-red-100 pt-6">
                        <div className="text-sm text-gray-600">
                            <p className="font-semibold mb-2">Test Credentials (Email / Password):</p>
                            <div className="space-y-1 text-xs">
                                <p><strong>Admin:</strong> admin@example.com / admin123</p>
                                <p><strong>Manager:</strong> manager@example.com / manager123</p>
                                <p><strong>Employee:</strong> alice@example.com / alice123</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Wrap LoginContent with HashRouter for local routing context compatibility
const Login = () => (
        <LoginContent />
);

export default Login;