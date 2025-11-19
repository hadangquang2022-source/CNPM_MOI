import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Phone, MapPin, Calendar, Camera, Lock, Save, Eye, EyeOff } from 'lucide-react';
// Assuming useAuth context is available in the environment
const useAuth = () => ({
    user: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '123-456-7890',
        address: '123 Tech Lane, Silicon Valley',
        dateOfBirth: '1990-01-01',
        role: { name: 'Manager' },
        position: { title: 'Lead Developer' }
    },
    updateProfile: async (data) => {
        console.log('Updating profile with:', data);
        // Mock successful update
        return { success: true, message: 'Profile updated successfully!' };
    },
    changePassword: async (data) => {
        console.log('Changing password with:', data);
        // Mock successful password change
        return { success: true, message: 'Password changed successfully!' };
    }
}); 
// Note: The useAuth context implementation is mocked above for a runnable single file, 
// but should be imported correctly in a real application.


const profileSchema = yup.object({
    firstName: yup
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must not exceed 50 characters')
        .required('First name is required'),
    lastName: yup
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must not exceed 50 characters')
        .required('Last name is required'),
    phone: yup
        .string()
        .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
        .optional(),
    address: yup.string().optional(),
    dateOfBirth: yup.date().max(new Date(), 'Date of birth cannot be in the future').optional(),
});

const passwordSchema = yup.object({
    currentPassword: yup
        .string()
        .required('Current password is required'),
    newPassword: yup
        .string()
        .min(6, 'New password must be at least 6 characters')
        .required('New password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your password'),
});

const Profile = () => {
    const { user, updateProfile, changePassword } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile form
    const profileForm = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || '',
            address: user?.address || '',
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        },
    });

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
        if (!dateString) return 'Not provided';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        // Sử dụng lớp 'body' ngầm định hoặc một lớp nền nhẹ phù hợp
        <div className="min-h-screen"> 
            <div className="max-w-4xl mx-auto py-10 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 py-6 sm:px-0 mb-6">
                    <h1 className="text-4xl font-extrabold leading-tight text-gray-900">
                        Profile Settings
                    </h1>
                    <p className="mt-2 text-base text-gray-600">
                        Manage your account settings and preferences.
                    </p>
                </div>

                {/* Profile Card Summary (Sử dụng lớp card tùy chỉnh) */}
                <div className="px-4 sm:px-0 mb-8">
                    {/* Thay thế bg-white shadow rounded-lg p-6 bằng lớp .card và .shadow-lg */}
                    <div className="card shadow-lg rounded-xl p-6"> 
                        <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0">
                                {/* Avatar: Thay đổi màu blue-500 thành red-500 */}
                                <div className="h-20 w-20 bg-red-500 rounded-full flex items-center justify-center relative group cursor-pointer shadow-md">
                                    <span className="text-2xl font-bold text-white">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </span>
                                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-gray-600">{user?.email}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                    {user?.role && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            {user.role.name}
                                        </span>
                                    )}
                                    {user?.position && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                            {user.position.title}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-4 sm:px-0">
                    <div className="border-b border-red-300 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`${activeTab === 'profile'
                                        ? 'border-red-600 text-red-700' // Màu đỏ active
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-base transition-colors duration-150`}
                            >
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`${activeTab === 'password'
                                        ? 'border-red-600 text-red-700' // Màu đỏ active
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-base transition-colors duration-150`}
                            >
                                Change Password
                            </button>
                        </nav>
                    </div>

                    {/* Profile Tab Content (Sử dụng lớp card tùy chỉnh) */}
                    {activeTab === 'profile' && (
                        <div className="card shadow-lg rounded-xl p-8"> 
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Current Information Display */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-red-100 pb-2">
                                        Current Information
                                    </h3>
                                    <div className="space-y-6">
                                        {/* Updated text classes for better hierarchy */}
                                        <div className="flex items-center space-x-3">
                                            <User className="h-5 w-5 text-red-500" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Full Name</p>
                                                <p className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-5 w-5 text-red-500" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Email</p>
                                                <p className="text-sm text-gray-600">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-red-500" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Phone</p>
                                                <p className="text-sm text-gray-600">{user?.phone || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-5 w-5 text-red-500" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Date of Birth</p>
                                                <p className="text-sm text-gray-600">{formatDate(user?.dateOfBirth)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Address</p>
                                                <p className="text-sm text-gray-600">{user?.address || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Update Form */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-red-100 pb-2">
                                        Update Information
                                    </h3>
                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                        {/* First Name & Last Name */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="firstName" className="form-label">
                                                    First Name
                                                </label>
                                                <input
                                                    {...profileForm.register('firstName')}
                                                    type="text"
                                                    // Sử dụng lớp form-input tùy chỉnh
                                                    className={`form-input ${profileForm.formState.errors.firstName ? 'error' : ''}`} 
                                                    placeholder="First name"
                                                />
                                                {profileForm.formState.errors.firstName && (
                                                    <p className="error-message">{profileForm.formState.errors.firstName.message}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label htmlFor="lastName" className="form-label">
                                                    Last Name
                                                </label>
                                                <input
                                                    {...profileForm.register('lastName')}
                                                    type="text"
                                                    // Sử dụng lớp form-input tùy chỉnh
                                                    className={`form-input ${profileForm.formState.errors.lastName ? 'error' : ''}`}
                                                    placeholder="Last name"
                                                />
                                                {profileForm.formState.errors.lastName && (
                                                    <p className="error-message">{profileForm.formState.errors.lastName.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Phone & Date of Birth */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="phone" className="form-label">
                                                    Phone Number
                                                </label>
                                                <input
                                                    {...profileForm.register('phone')}
                                                    type="tel"
                                                    // Sử dụng lớp form-input tùy chỉnh
                                                    className={`form-input ${profileForm.formState.errors.phone ? 'error' : ''}`}
                                                    placeholder="Phone number"
                                                />
                                                {profileForm.formState.errors.phone && (
                                                    <p className="error-message">{profileForm.formState.errors.phone.message}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label htmlFor="dateOfBirth" className="form-label">
                                                    Date of Birth
                                                </label>
                                                <input
                                                    {...profileForm.register('dateOfBirth')}
                                                    type="date"
                                                    // Sử dụng lớp form-input tùy chỉnh
                                                    className={`form-input ${profileForm.formState.errors.dateOfBirth ? 'error' : ''}`}
                                                />
                                                {profileForm.formState.errors.dateOfBirth && (
                                                    <p className="error-message">{profileForm.formState.errors.dateOfBirth.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label htmlFor="address" className="form-label">
                                                Address
                                            </label>
                                            <textarea
                                                {...profileForm.register('address')}
                                                rows={3}
                                                // Sử dụng lớp form-input tùy chỉnh
                                                className={`form-input ${profileForm.formState.errors.address ? 'error' : ''}`}
                                                placeholder="Enter your address"
                                            />
                                            {profileForm.formState.errors.address && (
                                                <p className="error-message">{profileForm.formState.errors.address.message}</p>
                                            )}
                                        </div>

                                        {/* Error Message */}
                                        {profileForm.formState.errors.root && (
                                            // Giữ nguyên màu đỏ/light red cho khối lỗi
                                            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                                                <div className="text-sm font-medium text-red-700">{profileForm.formState.errors.root.message}</div>
                                            </div>
                                        )}

                                        {/* Submit Button (Sử dụng lớp btn-primary) */}
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-full text-base"
                                            disabled={profileForm.formState.isSubmitting}
                                        >
                                            {profileForm.formState.isSubmitting ? (
                                                <div className="spinner mr-2"></div>
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            {profileForm.formState.isSubmitting ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Password Tab Content (Sử dụng lớp card tùy chỉnh) */}
                    {activeTab === 'password' && (
                        <div className="card shadow-lg rounded-xl p-8"> 
                            <div className="max-w-md mx-auto">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-red-100 pb-2">
                                    Change Password
                                </h3>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                    {/* Current Password */}
                                    <div className="form-group">
                                        <label htmlFor="currentPassword" className="form-label">
                                            Current Password
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                {...passwordForm.register('currentPassword')}
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                // Sử dụng lớp form-input tùy chỉnh
                                                className={`form-input ${passwordForm.formState.errors.currentPassword ? 'error' : ''}`}
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordForm.formState.errors.currentPassword && (
                                            <p className="error-message">{passwordForm.formState.errors.currentPassword.message}</p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div className="form-group">
                                        <label htmlFor="newPassword" className="form-label">
                                            New Password
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                {...passwordForm.register('newPassword')}
                                                type={showNewPassword ? 'text' : 'password'}
                                                // Sử dụng lớp form-input tùy chỉnh
                                                className={`form-input ${passwordForm.formState.errors.newPassword ? 'error' : ''}`}
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordForm.formState.errors.newPassword && (
                                            <p className="error-message">{passwordForm.formState.errors.newPassword.message}</p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword" className="form-label">
                                            Confirm New Password
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                {...passwordForm.register('confirmPassword')}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                // Sử dụng lớp form-input tùy chỉnh
                                                className={`form-input ${passwordForm.formState.errors.confirmPassword ? 'error' : ''}`}
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordForm.formState.errors.confirmPassword && (
                                            <p className="error-message">{passwordForm.formState.errors.confirmPassword.message}</p>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {passwordForm.formState.errors.root && (
                                        // Giữ nguyên màu đỏ/light red cho khối lỗi
                                        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                                            <div className="text-sm font-medium text-red-700">{passwordForm.formState.errors.root.message}</div>
                                        </div>
                                    )}

                                    {/* Submit Button (Sử dụng lớp btn-primary) */}
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-full text-base"
                                        disabled={passwordForm.formState.isSubmitting}
                                    >
                                        {passwordForm.formState.isSubmitting ? (
                                            <div className="spinner mr-2"></div>
                                        ) : (
                                            <Lock className="h-4 w-4 mr-2" />
                                        )}
                                        {passwordForm.formState.isSubmitting ? 'Changing...' : 'Change Password'}
                                    </button>
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