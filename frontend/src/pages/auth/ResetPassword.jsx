import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const schema = yup.object({
    newPassword: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your password'),
});

const ResetPassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const { token } = useParams();
    const { resetPassword, isLoading } = useAuth();
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
        setError('root', { type: 'manual', message: '' });

        const result = await resetPassword({
            token,
            newPassword: data.newPassword,
        });

        if (result.success) {
            setResetSuccess(true);
            // Auto redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } else {
            setError('root', {
                type: 'manual',
                message: result.message || 'Password reset failed'
            });
        }
    };

    // Invalid token state
    if (!token) {
        return (
            <div className="min-h-screen flex flex-col lg:flex-row">
                <div className="lg:w-1/2 bg-gradient-to-tr from-red-500 to-red-600 flex flex-col items-center justify-center p-12 text-white text-center">
                    <h1 className="text-4xl font-bold">Reset Password</h1>
                    <p className="mt-4 text-lg">Create a new secure password for your account.</p>
                </div>
                <div className="lg:w-1/2 flex items-center justify-center p-12 bg-gray-50">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
                        <p className="text-gray-600">
                            The password reset link is missing or invalid. Please request a new one.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block w-full py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-md transition-all"
                        >
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (resetSuccess) {
        return (
            <div className="min-h-screen flex flex-col lg:flex-row">
                <div className="lg:w-1/2 bg-gradient-to-tr from-red-500 to-red-600 flex flex-col items-center justify-center p-12 text-white text-center">
                    <h1 className="text-4xl font-bold">Password Reset</h1>
                    <p className="mt-4 text-lg">Your password has been successfully changed!</p>
                </div>
                <div className="lg:w-1/2 flex items-center justify-center p-12 bg-gray-50">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Password Changed!</h2>
                        <p className="text-gray-600">
                            Your password has been reset successfully. You can now sign in with your new password.
                        </p>
                        <p className="text-sm text-gray-500">
                            Redirecting to login page in 3 seconds...
                        </p>
                        <Link
                            to="/login"
                            className="inline-block w-full py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-md transition-all"
                        >
                            Sign In Now
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Illustration */}
            <div className="lg:w-1/2 bg-gradient-to-tr from-red-500 to-red-600 flex flex-col items-center justify-center p-12 text-white text-center">
                <h1 className="text-4xl font-bold">Reset Password</h1>
                <p className="mt-4 text-lg">Create a new secure password for your account.</p>
                <img
                    src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=300&fit=crop"
                    alt="Illustration"
                    className="mt-6 rounded-xl shadow-lg"
                />
            </div>

            {/* Right Form */}
            <div className="lg:w-1/2 flex items-center justify-center p-12 bg-gray-50">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    <div className="text-center">
                        <Lock className="mx-auto h-14 w-14 text-red-600" />
                        <h2 className="mt-4 text-3xl font-bold text-gray-900">Create New Password</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your new password below. Make sure it's at least 6 characters.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        {/* New Password */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('newPassword')}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Enter new password"
                                    className={`w-full py-2 pl-10 pr-10 border rounded-lg focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
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
                            {errors.newPassword && (
                                <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Confirm new password"
                                    className={`w-full py-2 pl-10 pr-10 border rounded-lg focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Root Error */}
                        {errors.root && errors.root.message && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                                {errors.root.message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-all flex items-center justify-center ${
                                isLoading ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Reset Password
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center border-t border-gray-200 pt-4">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-red-600 font-medium hover:text-red-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;