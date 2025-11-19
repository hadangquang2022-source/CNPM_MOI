import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, Send } from 'lucide-react';

// --- MOCK AUTH ---
const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const forgotPassword = async (email) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    if (email.includes('error')) return { success: false, message: 'User not found or email delivery failed.' };
    return { success: true, message: 'Password reset link sent!' };
  };
  return { forgotPassword, isLoading };
};
// --- END MOCK ---

const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
});

const ForgotPasswordContent = () => {
  const { forgotPassword, isLoading } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, setError } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setError('root', { type: 'manual', message: '' });
    const result = await forgotPassword(data.email);
    if (!result.success) setError('root', { type: 'manual', message: result.message });
    else setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Illustration */}
      <div className="lg:w-1/2 bg-gradient-to-tr from-red-500 to-red-600 flex flex-col items-center justify-center p-12 text-white text-center">
        <h1 className="text-4xl font-bold">Forgot Password?</h1>
        <p className="mt-4 text-lg">Enter your email to receive a password reset link.</p>
        <img
          src="https://source.unsplash.com/400x300/?security,technology"
          alt="Illustration"
          className="mt-6 rounded-xl shadow-lg"
        />
      </div>

      {/* Right Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-12 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <Send className="mx-auto h-14 w-14 text-red-600" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Reset Your Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              {submitted ? "Check your email for the reset link!" : "Please enter your email address."}
            </p>
          </div>

          {!submitted && (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full py-2 pl-10 pr-3 border rounded-lg focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {/* Root Error */}
              {errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {errors.root.message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-all ${
                  isLoading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

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

const ForgotPassword = () => <ForgotPasswordContent />;
export default ForgotPassword;
