import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const schema = yup.object({
  firstName: yup.string().min(2).max(50).required(),
  lastName: yup.string().min(2).max(50).required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null]).required(),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setError('root', { type: 'manual', message: '' });
    const { confirmPassword, ...finalData } = data;
    const result = await registerUser(finalData);
    if (result.success) navigate('/home');
    else setError('root', { type: 'manual', message: result.message || 'Registration failed' });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">

      {/* Left Illustration - Gradient Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-600 via-purple-500 to-rose-500 items-center justify-center p-12 overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 -right-20 w-60 h-60 bg-pink-300/20 rounded-full blur-2xl animate-float delay-300"></div>
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl animate-float delay-500"></div>
        </div>

        <div className="relative z-10 text-white text-center space-y-6 animate-fadeIn">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium animate-bounce-slow">
            <Sparkles className="w-4 h-4" />
            <span>Join QuangStore Today</span>
          </div>
          <h2 className="text-5xl font-bold leading-tight">
            Start Your<br />
            <span className="text-pink-200">Journey!</span>
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            Create your account and unlock access to powerful features.
          </p>

          {/* Features List */}
          <div className="space-y-3 mt-8 text-left max-w-xs mx-auto">
            {['Browse amazing products', 'Secure checkout', 'Track your orders'].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 animate-fadeInUp"
                style={{ animationDelay: `${(i + 2) * 100}ms` }}
              >
                <CheckCircle className="w-5 h-5 text-pink-200" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-8 space-y-6 animate-fadeInUp relative overflow-hidden">
          {/* Gradient Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-rose-500"></div>

          {/* Header */}
          <div className="text-center space-y-3 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-rose-500 rounded-2xl shadow-lg shadow-violet-500/30 mb-2 transform hover:rotate-6 transition-transform duration-300">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Create Account</h2>
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent hover:from-rose-500 hover:to-violet-600 transition-all">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Account Details */}
            <div className="space-y-4 animate-fadeInUp">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <input {...register('firstName')} type="text" placeholder="First Name" className={`w-full border-2 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-violet-500 transition-colors" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.firstName.message}</p>}
                </div>
                <div className="relative group">
                  <input {...register('lastName')} type="text" placeholder="Last Name" className={`w-full border-2 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-violet-500 transition-colors" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="relative group">
                <input {...register('email')} type="email" placeholder="Email" className={`w-full border-2 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-violet-500 transition-colors" />
                {errors.email && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Password" className={`w-full border-2 rounded-xl py-3 pl-12 pr-12 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-violet-500 transition-colors" />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-violet-500 transition-colors" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-violet-500 transition-colors" />}
                  </button>
                  {errors.password && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.password.message}</p>}
                </div>

                <div className="relative group">
                  <input {...register('confirmPassword')} type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" className={`w-full border-2 rounded-xl py-3 pl-12 pr-12 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-violet-500 transition-colors" />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-violet-500 transition-colors" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-violet-500 transition-colors" />}
                  </button>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            {errors.root && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg p-4 text-sm animate-shake">
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-6 bg-gradient-to-r from-violet-600 via-purple-500 to-rose-500 hover:from-rose-500 hover:via-purple-500 hover:to-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 focus:outline-none focus:ring-4 focus:ring-violet-500/30 transform hover:-translate-y-0.5 transition-all duration-300 animate-fadeInUp delay-300 ${isLoading ? 'opacity-60 cursor-not-allowed transform-none' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
