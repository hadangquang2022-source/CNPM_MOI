import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, Send, CheckCircle, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
});

const ForgotPassword = () => {
  const { forgotPassword, isLoading } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { register, handleSubmit, formState: { errors }, setError } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setError('root', { type: 'manual', message: '' });
    const result = await forgotPassword(data.email);
    if (!result.success) {
      setError('root', { type: 'manual', message: result.message });
    } else {
      setSubmittedEmail(data.email);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Left Gradient Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-red-500 via-red-600 to-orange-500 flex flex-col items-center justify-center p-12 text-white text-center relative overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10%" cy="20%" r="4" fill="rgba(255,255,255,0.3)" className="animate-float" style={{ animationDelay: '0s' }} />
            <circle cx="85%" cy="15%" r="6" fill="rgba(255,255,255,0.2)" className="animate-float" style={{ animationDelay: '0.5s' }} />
            <circle cx="70%" cy="80%" r="5" fill="rgba(255,255,255,0.25)" className="animate-float" style={{ animationDelay: '1s' }} />
            <circle cx="20%" cy="70%" r="4" fill="rgba(255,255,255,0.3)" className="animate-float" style={{ animationDelay: '1.5s' }} />
            <circle cx="50%" cy="10%" r="3" fill="rgba(255,255,255,0.2)" className="animate-float" style={{ animationDelay: '2s' }} />
            <circle cx="30%" cy="90%" r="5" fill="rgba(255,255,255,0.15)" className="animate-float" style={{ animationDelay: '2.5s' }} />
          </svg>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-2xl animate-float"></div>
        
        <div className="relative z-10 animate-fadeIn">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 mx-auto transform hover:scale-110 transition-transform duration-300 shadow-2xl">
            <KeyRound className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 animate-fadeInUp">Forgot Password?</h1>
          <p className="text-xl text-white/90 max-w-md animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Don't worry! We'll help you reset your password securely.
          </p>
          
          {/* Feature highlights */}
          <div className="mt-10 space-y-4 text-left animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-white/90">Secure email verification</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-white/90">Quick & easy process</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md animate-fadeInRight">
          {/* Glass morphism card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
            {!submitted ? (
              <>
                <div className="text-center animate-fadeIn">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30 transform hover:rotate-6 transition-transform duration-300">
                    <Send className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Reset Password
                  </h2>
                  <p className="mt-2 text-gray-500">
                    Enter your email address to receive a reset link
                  </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {/* Email Input */}
                  <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      </div>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full py-3.5 pl-12 pr-4 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                          errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.email.message}
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
                  <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
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
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Reset Link
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="text-center space-y-6 animate-scaleIn">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-green-400/30 rounded-full mx-auto animate-ping"></div>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Check Your Email
                </h2>
                <p className="text-gray-600">
                  We've sent a password reset link to:
                </p>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl px-4 py-3 border border-red-100">
                  <p className="font-semibold text-gray-900">{submittedEmail}</p>
                </div>
                <p className="text-sm text-gray-500">
                  The link will expire in 10 minutes. Check your spam folder if you don't see it.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setSubmittedEmail('');
                  }}
                  className="text-red-600 hover:text-red-700 font-semibold text-sm inline-flex items-center gap-2 hover:underline transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Didn't receive the email? Try again
                </button>
              </div>
            )}

            {/* Back to Login */}
            <div className="mt-8 text-center border-t border-gray-100 pt-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
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

export default ForgotPassword;
