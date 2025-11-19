import React from 'react';
import { HashRouter, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, Send } from 'lucide-react';

// --- MOCKING EXTERNAL IMPORTS FOR SINGLE-FILE RUNNABLE ENVIRONMENT ---
const useAuth = () => {
    const [isLoading, setIsLoading] = React.useState(false);
    
    const forgotPassword = async (email) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        
        if (email.includes('error')) {
            return { success: false, message: 'User not found or email delivery failed.' };
        }
        return { success: true, message: 'Password reset link sent!' };
    };

    return { forgotPassword, isLoading };
}; 
// --- END MOCKING ---

const schema = yup.object({
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required'),
});

const ForgotPasswordContent = () => {
    const { forgotPassword, isLoading } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        // Clear previous root errors before submission
        setError('root', { type: 'manual', message: '' }); 

        const result = await forgotPassword(data.email);

        if (!result.success) {
            setError('root', {
                type: 'manual',
                message: result.message || 'Failed to send reset email'
            });
        }
        // NOTE: In a real app, you would navigate to a confirmation screen here if successful.
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    {/* Icon: Themed Red */}
                    <Send className="mx-auto h-12 w-12 text-red-600" /> 
                    <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
                        Forgot your password?
                    </h2>
                    <p className="mt-2 text-base text-gray-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Form Card: Use custom card styling */}
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
                                // Use custom btn-primary for red gradient/shadow
                                className={`btn btn-primary w-full text-base ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <div className="spinner mr-2"></div>
                                ) : (
                                    <Send className="h-5 w-5 mr-2 text-white" />
                                )}
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
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

// Wrap ForgotPasswordContent with HashRouter for local routing context compatibility
const ForgotPassword = () => (
    <HashRouter>
        <ForgotPasswordContent />
    </HashRouter>
);

export default ForgotPassword;