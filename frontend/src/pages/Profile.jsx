import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Phone, MapPin, Calendar, Camera, Lock, Save, Eye, EyeOff, Loader2, Shield, Edit3, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const profileSchema = yup.object({
    firstName: yup
        .string()
        .min(2, 'Họ phải có ít nhất 2 ký tự')
        .max(50, 'Họ không được quá 50 ký tự')
        .required('Họ là bắt buộc'),
    lastName: yup
        .string()
        .min(2, 'Tên phải có ít nhất 2 ký tự')
        .max(50, 'Tên không được quá 50 ký tự')
        .required('Tên là bắt buộc'),
    phone: yup
        .string()
        .matches(/^[0-9+\-\s()]*$/, 'Số điện thoại không hợp lệ')
        .nullable(),
    address: yup.string().nullable(),
    dateOfBirth: yup.date().max(new Date(), 'Ngày sinh không thể trong tương lai').nullable().transform((value, originalValue) => {
        return originalValue === '' ? null : value;
    }),
});

const passwordSchema = yup.object({
    currentPassword: yup
        .string()
        .required('Mật khẩu hiện tại là bắt buộc'),
    newPassword: yup
        .string()
        .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
        .required('Mật khẩu mới là bắt buộc'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword'), null], 'Mật khẩu không khớp')
        .required('Vui lòng xác nhận mật khẩu'),
});

const Profile = () => {
    const { user, updateProfile, changePassword, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile form
    const profileForm = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            address: '',
            dateOfBirth: '',
        },
    });

    // Update form values when user data loads
    useEffect(() => {
        if (user) {
            profileForm.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: user.address || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            });
        }
    }, [user, profileForm]);

    // Password form
    const passwordForm = useForm({
        resolver: yupResolver(passwordSchema),
    });

    const onProfileSubmit = async (data) => {
        const result = await updateProfile(data);
        if (!result.success) {
            profileForm.setError('root', {
                type: 'manual',
                message: result.message || 'Profile update failed'
            });
        }
    };

    const onPasswordSubmit = async (data) => {
        const result = await changePassword(data);
        if (result.success) {
            passwordForm.reset();
        } else {
            passwordForm.setError('root', {
                type: 'manual',
                message: result.message || 'Password change failed'
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cung cấp';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Loading state
    if (authLoading && !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/30 animate-pulse">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center animate-fadeIn">
                    <p className="text-gray-600">Không tìm thấy thông tin người dùng</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Header with gradient */}
                <div className="mb-8 animate-fadeIn">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                                Cài đặt Profile
                            </h1>
                            <p className="text-gray-500">Quản lý thông tin tài khoản và cài đặt của bạn.</p>
                        </div>
                    </div>
                </div>

                {/* Profile Card Summary */}
                <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="h-24 w-24 bg-gradient-to-br from-red-500 via-red-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 transform group-hover:scale-105 transition-all duration-300">
                                    <span className="text-3xl font-bold text-white">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </span>
                                </div>
                                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 hover:scale-110 transition-all duration-300 border border-gray-100">
                                    <Camera className="h-5 w-5" />
                                </button>
                            </div>
                            
                            {/* User Info */}
                            <div className="text-center sm:text-left flex-1">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2 mt-1">
                                    <Mail className="w-4 h-4" />
                                    {user?.email}
                                </p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                                    {user?.role && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm">
                                            <Shield className="w-3 h-3" />
                                            {user.role.name}
                                        </span>
                                    )}
                                    {user?.position && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700">
                                            <Sparkles className="w-3 h-3" />
                                            {user.position.title}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="flex gap-2 mb-6 bg-white/60 backdrop-blur-xl p-2 rounded-2xl shadow-lg border border-white/50">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                                activeTab === 'profile'
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Edit3 className="w-4 h-4" />
                            Thông tin cá nhân
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                                activeTab === 'password'
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Lock className="w-4 h-4" />
                            Đổi mật khẩu
                        </button>
                    </div>

                    {/* Profile Tab Content */}
                    {activeTab === 'profile' && (
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 lg:p-8 animate-fadeIn">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                                {/* Current Information Display */}
                                <div className="animate-fadeInLeft">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                                            <User className="w-4 h-4 text-red-600" />
                                        </div>
                                        Thông tin hiện tại
                                    </h3>
                                    <div className="space-y-5">
                                        {[
                                            { icon: User, label: 'Họ và tên', value: `${user?.firstName} ${user?.lastName}` },
                                            { icon: Mail, label: 'Email', value: user?.email },
                                            { icon: Phone, label: 'Số điện thoại', value: user?.phone || 'Chưa cung cấp' },
                                            { icon: Calendar, label: 'Ngày sinh', value: formatDate(user?.dateOfBirth) },
                                            { icon: MapPin, label: 'Địa chỉ', value: user?.address || 'Chưa cung cấp' },
                                        ].map((item, index) => (
                                            <div 
                                                key={item.label}
                                                className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-300 group"
                                                style={{ animationDelay: `${0.1 * index}s` }}
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl flex items-center justify-center group-hover:from-red-500 group-hover:to-orange-500 transition-all duration-300">
                                                    <item.icon className="h-5 w-5 text-red-500 group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-500">{item.label}</p>
                                                    <p className="text-gray-900 font-medium">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Update Form */}
                                <div className="animate-fadeInRight">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                                            <Edit3 className="w-4 h-4 text-red-600" />
                                        </div>
                                        Cập nhật thông tin
                                    </h3>
                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                                        {/* First Name & Last Name */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ</label>
                                                <input
                                                    {...profileForm.register('firstName')}
                                                    type="text"
                                                    className={`w-full py-3 px-4 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 ${
                                                        profileForm.formState.errors.firstName ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    placeholder="Nhập họ"
                                                />
                                                {profileForm.formState.errors.firstName && (
                                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                        {profileForm.formState.errors.firstName.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên</label>
                                                <input
                                                    {...profileForm.register('lastName')}
                                                    type="text"
                                                    className={`w-full py-3 px-4 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 ${
                                                        profileForm.formState.errors.lastName ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    placeholder="Nhập tên"
                                                />
                                                {profileForm.formState.errors.lastName && (
                                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                        {profileForm.formState.errors.lastName.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Phone & Date of Birth */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                                                <input
                                                    {...profileForm.register('phone')}
                                                    type="tel"
                                                    className={`w-full py-3 px-4 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 ${
                                                        profileForm.formState.errors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                                {profileForm.formState.errors.phone && (
                                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                        {profileForm.formState.errors.phone.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
                                                <input
                                                    {...profileForm.register('dateOfBirth')}
                                                    type="date"
                                                    className={`w-full py-3 px-4 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 ${
                                                        profileForm.formState.errors.dateOfBirth ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                />
                                                {profileForm.formState.errors.dateOfBirth && (
                                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                        {profileForm.formState.errors.dateOfBirth.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                                            <textarea
                                                {...profileForm.register('address')}
                                                rows={3}
                                                className={`w-full py-3 px-4 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 resize-none ${
                                                    profileForm.formState.errors.address ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                placeholder="Nhập địa chỉ của bạn"
                                            />
                                            {profileForm.formState.errors.address && (
                                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                    {profileForm.formState.errors.address.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Error Message */}
                                        {profileForm.formState.errors.root && (
                                            <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4 text-sm animate-fadeIn flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                {profileForm.formState.errors.root.message}
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="w-full py-4 px-6 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 hover:from-red-600 hover:via-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                            disabled={profileForm.formState.isSubmitting}
                                        >
                                            {profileForm.formState.isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Đang cập nhật...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5" />
                                                    Cập nhật Profile
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Password Tab Content */}
                    {activeTab === 'password' && (
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 lg:p-8 animate-fadeIn">
                            <div className="max-w-md mx-auto">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 justify-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                                        <Lock className="w-5 h-5 text-white" />
                                    </div>
                                    Đổi mật khẩu
                                </h3>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                                    {/* Current Password */}
                                    <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                                        <div className="relative group">
                                            <input
                                                {...passwordForm.register('currentPassword')}
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                className={`w-full py-3.5 px-4 pr-12 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 ${
                                                    passwordForm.formState.errors.currentPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                placeholder="Nhập mật khẩu hiện tại"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordForm.formState.errors.currentPassword && (
                                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                {passwordForm.formState.errors.currentPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                                        <div className="relative group">
                                            <input
                                                {...passwordForm.register('newPassword')}
                                                type={showNewPassword ? 'text' : 'password'}
                                                className={`w-full py-3.5 px-4 pr-12 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 ${
                                                    passwordForm.formState.errors.newPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                placeholder="Nhập mật khẩu mới"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordForm.formState.errors.newPassword && (
                                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                {passwordForm.formState.errors.newPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                                        <div className="relative group">
                                            <input
                                                {...passwordForm.register('confirmPassword')}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className={`w-full py-3.5 px-4 pr-12 bg-gray-50/50 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 ${
                                                    passwordForm.formState.errors.confirmPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                placeholder="Xác nhận mật khẩu mới"
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
                                        {passwordForm.formState.errors.confirmPassword && (
                                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                {passwordForm.formState.errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {passwordForm.formState.errors.root && (
                                        <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4 text-sm animate-fadeIn flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                            {passwordForm.formState.errors.root.message}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                                        <button
                                            type="submit"
                                            className="w-full py-4 px-6 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 hover:from-red-600 hover:via-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                            disabled={passwordForm.formState.isSubmitting}
                                        >
                                            {passwordForm.formState.isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Đang đổi...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="h-5 w-5" />
                                                    Đổi mật khẩu
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;