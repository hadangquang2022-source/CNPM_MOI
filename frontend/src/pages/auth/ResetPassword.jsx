import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle, AlertCircle, Shield, ShieldCheck } from 'lucide-react';
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

const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10%" cy="20%" r="4" fill="rgba(255,255,255,0.3)" className="animate-float" style={{ animationDelay: '0s' }} />
            <circle cx="85%" cy="15%" r="6" fill="rgba(255,255,255,0.2)" className="animate-float" style={{ animationDelay: '0.5s' }} />
            <circle cx="70%" cy="80%" r="5" fill="rgba(255,255,255,0.25)" className="animate-float" style={{ animationDelay: '1s' }} />
            <circle cx="20%" cy="70%" r="4" fill="rgba(255,255,255,0.3)" className="animate-float" style={{ animationDelay: '1.5s' }} />
            <circle cx="50%" cy="10%" r="3" fill="rgba(255,255,255,0.2)" className="animate-float" style={{ animationDelay: '2s' }} />
            <circle cx="30%" cy="90%" r="5" fill="rgba(255,255,255,0.15)" className="animate-float" style={{ animationDelay: '2.5s' }} />
        </svg>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-2xl animate-float"></div>
    </div>
);

const GradientPanel = ({ title, subtitle, icon: Icon }) => (
    <div className="lg:w-1/2 bg-gradient-to-br from-red-500 via-red-600 to-orange-500 flex flex-col items-center justify-center p-12 text-white text-center relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10 animate-fadeIn">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 mx-auto transform hover:scale-110 transition-transform duration-300 shadow-2xl">
                <Icon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 animate-fadeInUp">{title}</h1>
            <p className="text-xl text-white/90 max-w-md animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                {subtitle}
            </p>
        </div>
    </div>
);

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
            <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 via-white to-red-50">
                <GradientPanel 
                    title="Reset Password" 
                    subtitle="Create a new secure password for your account."
                    icon={Shield}
                />
                <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
                    <div className="w-full max-w-md animate-fadeInRight">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 text-center space-y-6">
                            <div className="relative animate-scaleIn">
                                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
                                    <AlertCircle className="h-10 w-10 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Invalid Reset Link
                            </h2>
                            <p className="text-gray-600">
                                The password reset link is missing or invalid. Please request a new one.
                            </p>
                            <Link
                                to="/forgot-password"
                                className="inline-block w-full py-4 px-6 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 hover:from-red-600 hover:via-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                Request New Link
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (resetSuccess) {
        return (
            <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 via-white to-green-50">
                <GradientPanel 
                    title="Password Reset" 
                    subtitle="Your password has been successfully changed!"
                    icon={ShieldCheck}
                />
                <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
                    <div className="w-full max-w-md animate-fadeInRight">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 text-center space-y-6">
                            <div className="relative animate-scaleIn">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
                                    <CheckCircle className="h-10 w-10 text-white" />
                                </div>
                                <div className="absolute inset-0 w-20 h-20 bg-green-400/30 rounded-full mx-auto animate-ping"></div>
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Password Changed!
                            </h2>
                            <p className="text-gray-600">
                                Your password has been reset successfully. You can now sign in with your new password.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Redirecting to login page in 3 seconds...
                            </div>
                            <Link
                                to="/login"
                                className="inline-block w-full py-4 px-6 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 hover:from-red-600 hover:via-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                Sign In Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 via-white to-red-50">
            {/* Left Gradient Panel */}
            <GradientPanel 
                title="Reset Password" 
                subtitle="Create a new secure password for your account."
                icon={Shield}
            />

            {/* Right Form */}
            <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md animate-fadeInRight">
                    {/* Glass morphism card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                        <div className="text-center animate-fadeIn">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30 transform hover:rotate-6 transition-transform duration-300">
                                <Lock className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Create New Password
                            </h2>
                            <p className="mt-2 text-gray-500">
                                Enter your new password below. Make sure it's at least 6 characters.
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            {/* New Password */}
                            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                    </div>
                                    <input
                                        {...register('newPassword')}
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Enter new password"
                                        className={`w-full py-3.5 pl-12 pr-12 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                                            errors.newPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                                        )}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        {errors.newPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                    </div>
                                    <input
                                        {...register('confirmPassword')}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Confirm new password"
                                        className={`w-full py-3.5 pl-12 pr-12 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                                            errors.confirmPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* Root Error */}
                            {errors.root && errors.root.message && (
                                <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4 text-sm animate-fadeIn flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    {errors.root.message}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-4 px-6 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 hover:from-red-600 hover:via-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                                        isLoading ? 'opacity-60 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-5 w-5" />
                                            Reset Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Back to Login */}
                        <div className="mt-8 text-center border-t border-gray-100 pt-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-gray-600 font-medium hover:text-red-600 transition-all group"
                            >
                                <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;