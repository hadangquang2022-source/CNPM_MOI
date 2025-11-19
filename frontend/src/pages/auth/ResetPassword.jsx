import React, { useState } from 'react';
import { HashRouter, Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

// --- MOCKING EXTERNAL IMPORTS FOR SINGLE-FILE RUNNABLE ENVIRONMENT ---
const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    const resetPassword = async (data) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        
        console.log(`[AUTH MOCK] Attempting to reset password for token: ${data.token}`);
        
        if (data.token === 'invalid-token') {
            return { success: false, message: 'Invalid or expired reset token.' };
        }
        return { success: true, message: 'Password reset successful!' };
    };

    return { resetPassword, isLoading };
};

// Mock useParams to provide a token for the single-file environment
const mockUseParams = () => ({ token: 'mock-reset-token-123' });
// --- END MOCKING ---

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

const ResetPasswordContent = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // Use mock params if actual useParams is undefined (due to HashRouter wrapper needing its own internal params)
    const { token } = mockUseParams(); 
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
        // Clear previous root errors
        setError('root', { type: 'manual', message: '' });

        const result = await resetPassword({
            token,
            newPassword: data.newPassword,
        });

        if (result.success) {
            // Navigate using hash path for single-file compatibility
            navigate('#/login');
        } else {
            setError('root', {
                type: 'manual',
                message: result.message || 'Password reset failed'
            });
        }
    };

    // Note: If token were truly missing, we'd redirect, but here we assume mockUseParams provides it.
    if (!token) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="card shadow-lg p-10 text-center rounded-xl">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">Missing or invalid reset token.</p>
                    <Link to="#/forgot-password" className="text-red-600 hover:text-red-700 font-semibold transition-colors duration-200">
                        Request new reset link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    {/* Icon: Themed Red */}
                    <CheckCircle className="mx-auto h-12 w-12 text-red-600" />
                    <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-base text-gray-600">
                        Enter your new password below.
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Form Card: Use custom card styling */}
                <div className="card py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        
                        {/* New Password */}
                        <div className="form-group">
                            <label htmlFor="newPassword" className="form-label">
                                New Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('newPassword')}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    // Use custom form-input and error classes
                                    className={`form-input pl-10 pr-10 ${errors.newPassword ? 'error' : ''}`}
                                    placeholder="Enter new password"
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
                                <p className="error-message">{errors.newPassword.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    // Use custom form-input and error classes
                                    className={`form-input pl-10 pr-10 ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder="Confirm new password"
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
                                <p className="error-message">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Error Message */}
                        {errors.root && (
                            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                                <div className="text-sm font-medium text-red-700">{errors.root.message}</div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                // Use btn-primary for red gradient/shadow
                                className={`btn btn-primary w-full text-base ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <div className="spinner mr-2"></div>
                                ) : (
                                    <CheckCircle className="h-5 w-5 mr-2 text-white" />
                                )}
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center border-t border-red-100 pt-4">
                        <Link
                            to="#/login"
                            // Themed Red Link
                            className="inline-flex items-center text-base font-semibold text-red-600 hover:text-red-700 transition-colors"
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

// Wrap ResetPasswordContent with HashRouter for local routing context compatibility
const ResetPassword = () => (
    <HashRouter>
        <ResetPasswordContent />
    </HashRouter>
);

export default ResetPassword;