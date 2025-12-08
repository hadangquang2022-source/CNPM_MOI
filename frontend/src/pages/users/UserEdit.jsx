import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Camera, ToggleLeft, ToggleRight, Award, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api';

const schema = yup.object({
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
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required'),
    phone: yup
        .string()
        // Updated regex to match the pattern used in UserCreate.jsx for consistency
        .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format')
        .optional()
        .nullable()
        .transform((curr, orig) => orig === '' ? null : curr),
    address: yup.string().optional().nullable().transform((curr, orig) => orig === '' ? null : curr),
    // Ensure dateOfBirth is nullable and transformed for form data consistency
    dateOfBirth: yup.date().max(new Date(), 'Date of birth cannot be in the future').optional().nullable().transform((curr, orig) => orig === '' ? null : curr),
    // Ensure IDs are nullable and transformed for form data consistency
    roleId: yup.number().typeError('Role must be a number').optional().nullable().transform((curr, orig) => orig === '' ? null : curr),
    positionId: yup.number().typeError('Position must be a number').optional().nullable().transform((curr, orig) => orig === '' ? null : curr),
});

const UserEdit = () => {
    // Note: id is mocked via HashRouter wrapper in the single file environment
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            // Setting default values here helps with schema null transformation
            firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '', roleId: '', positionId: ''
        }
    });

    useEffect(() => {
        const initData = async () => {
            await Promise.all([fetchUser(id), fetchRoles(), fetchPositions()]);
        };
        initData();
    }, [id]);

    const fetchUser = async (userId) => {
        try {
            const response = await userAPI.getUserById(userId);
            if (response.data.success) {
                const userData = response.data.data.user;
                setUser(userData);

                // Reset form with user data, format date correctly
                reset({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    phone: userData.phone || '',
                    address: userData.address || '',
                    dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
                    roleId: userData.roleId || '',
                    positionId: userData.positionId || '',
                });
            } else {
                toast.error('Failed to fetch user data');
                navigate('/users');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Failed to fetch user data');
            navigate('/users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await userAPI.getRoles();
            if (response.data.success) {
                setRoles(response.data.data.roles);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await userAPI.getPositions();
            if (response.data.success) {
                setPositions(response.data.data.positions);
            }
        } catch (error) {
            console.error('Error fetching positions:', error);
        }
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            // Transform data for API consistency (matching schema transform)
            const updateData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone || null,
                address: data.address || null,
                // Ensure date format is correct for backend or null
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : null,
                roleId: data.roleId ? parseInt(data.roleId) : null,
                positionId: data.positionId ? parseInt(data.positionId) : null,
            };

            const response = await userAPI.updateUser(user.id, updateData);

            if (response.data.success) {
                toast.success('User updated successfully!');
                navigate('/users');
            } else {
                setError('root', {
                    type: 'manual',
                    message: response.data.message || 'User update failed'
                });
                toast.error(response.data.message || 'User update failed');
            }
        } catch (error) {
            console.error('❌ Error updating user:', error);
            const message = error.response?.data?.message || 'User update failed. Check console for details.';
            toast.error(message);
            setError('root', { type: 'manual', message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            const response = await userAPI.toggleUserStatus(user.id);
            if (response.data.success) {
                setUser(prev => ({ ...prev, isActive: !prev.isActive }));
                toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            toast.error('Failed to update user status');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '0000-00-00') return 'Not provided';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="card shadow-lg p-10 text-center rounded-xl">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">User Not Found</h2>
                    <Link to="/users" className="text-red-600 hover:text-red-700 font-semibold transition-colors duration-200">
                        Return to users list
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto py-10 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 py-6 sm:px-0 mb-6">
                    <div className="flex items-center">
                        <Link
                            to="/users"
                            // Apply red theme to back link
                            className="inline-flex items-center text-base font-semibold text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Users
                        </Link>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-b border-red-300 pb-4">
                        <div>
                            <h1 className="text-4xl font-extrabold leading-tight text-gray-900">
                                Edit User: {user.firstName} {user.lastName}
                            </h1>
                            <p className="mt-2 text-base text-gray-600">
                                Update user information, role, and position assignments.
                            </p>
                        </div>

                        {/* Toggle Status Button (Themed) */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleToggleStatus}
                                className={`inline-flex items-center px-4 py-2 text-base font-semibold rounded-md shadow-md transition-colors duration-200 
                                    ${user.isActive
                                        ? 'bg-red-600 text-white hover:bg-red-700' // Active = Deactivate (Red)
                                        : 'bg-green-600 text-white hover:bg-green-700' // Inactive = Activate (Green)
                                    }`}
                            >
                                {user.isActive ? (
                                    <>
                                        <ToggleRight className="h-5 w-5 mr-2" />
                                        Deactivate User
                                    </>
                                ) : (
                                    <>
                                        <ToggleLeft className="h-5 w-5 mr-2" />
                                        Activate User
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Current User Info Card (Themed) */}
                <div className="px-4 sm:px-0 mb-8">
                    <div className="card shadow-lg rounded-xl p-6 border-l-4 border-red-500">
                        <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0 relative">
                                <div className="h-20 w-20 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                                    <span className="text-2xl font-bold text-white">
                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-gray-600">{user.email}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                    {user.role && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                            {user.role.name}
                                        </span>
                                    )}
                                    {user.position && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                            {user.position.title}
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                                        ${user.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>Member ID: {user.id} | Joined: {formatDate(user.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="px-4 sm:px-0">
                    <div className="card shadow-lg rounded-xl p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                            {/* Personal Information Section */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-red-100 pb-2">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* First Name */}
                                    <div className="form-group">
                                        <label htmlFor="firstName" className="form-label">
                                            First Name <span className="text-red-600">*</span>
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                {...register('firstName')}
                                                type="text"
                                                className={`form-input pl-10 ${errors.firstName ? 'error' : ''}`}
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        {errors.firstName && (
                                            <p className="error-message">{errors.firstName.message}</p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div className="form-group">
                                        <label htmlFor="lastName" className="form-label">
                                            Last Name <span className="text-red-600">*</span>
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                {...register('lastName')}
                                                type="text"
                                                className={`form-input pl-10 ${errors.lastName ? 'error' : ''}`}
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                        {errors.lastName && (
                                            <p className="error-message">{errors.lastName.message}</p>
                                        )}
                                    </div>

                                    {/* Email (Readonly) */}
                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">
                                            Email Address <span className="text-red-600">*</span>
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                {...register('email')}
                                                type="email"
                                                readOnly // Email is usually non-editable post-creation
                                                className={`form-input pl-10 bg-gray-100 cursor-not-allowed ${errors.email ? 'error' : ''}`}
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="error-message">{errors.email.message}</p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="form-group">
                                        <label htmlFor="phone" className="form-label">
                                            Phone Number
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                {...register('phone')}
                                                type="tel"
                                                className={`form-input pl-10 ${errors.phone ? 'error' : ''}`}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="error-message">{errors.phone.message}</p>
                                        )}
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="form-group">
                                        <label htmlFor="dateOfBirth" className="form-label">
                                            Date of Birth
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                {...register('dateOfBirth')}
                                                type="date"
                                                className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                                            />
                                        </div>
                                        {errors.dateOfBirth && (
                                            <p className="error-message">{errors.dateOfBirth.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="form-group mt-6">
                                    <label htmlFor="address" className="form-label">
                                        Address
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute top-3 left-3 pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <textarea
                                            {...register('address')}
                                            rows={3}
                                            className={`form-input pl-10 ${errors.address ? 'error' : ''}`}
                                            placeholder="Enter full address"
                                        />
                                    </div>
                                    {errors.address && (
                                        <p className="error-message">{errors.address.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Role & Position Section */}
                            <div className="border-t border-red-300 pt-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-red-100 pb-2">
                                    Role & Position Assignment
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Role */}
                                    <div className="form-group">
                                        <label htmlFor="roleId" className="form-label">
                                            Role
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Award className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                {...register('roleId')}
                                                className={`form-input pl-10 ${errors.roleId ? 'error' : ''}`}
                                            >
                                                <option value="">Select a role</option>
                                                {roles.map((role) => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.roleId && (
                                            <p className="error-message">{errors.roleId.message}</p>
                                        )}
                                    </div>

                                    {/* Position */}
                                    <div className="form-group">
                                        <label htmlFor="positionId" className="form-label">
                                            Position
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Briefcase className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                {...register('positionId')}
                                                className={`form-input pl-10 ${errors.positionId ? 'error' : ''}`}
                                            >
                                                <option value="">Select a position</option>
                                                {positions.map((position) => (
                                                    <option key={position.id} value={position.id}>
                                                        {position.title} - {position.department}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.positionId && (
                                            <p className="error-message">{errors.positionId.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {errors.root && (
                                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                                    <div className="text-sm font-medium text-red-700">{errors.root.message}</div>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="border-t border-red-300 pt-6 flex justify-end space-x-4">

                                {/* Cancel Button */}
                                <Link
                                    to="/users"
                                    className="btn btn-secondary inline-flex items-center text-base"
                                >
                                    Cancel
                                </Link>

                                {/* Update Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    // Use btn-primary for red gradient theme
                                    className={`btn btn-primary inline-flex items-center text-base ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <div className="spinner mr-2"></div>
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {isSubmitting ? 'Updating...' : 'Update User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserEdit;