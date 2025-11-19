import React, { useState, useEffect } from 'react';
import { HashRouter, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Lock, Eye, EyeOff, Briefcase, Award } from 'lucide-react';

// Mocking external imports for single-file runnable environment
const userAPI = {
    getRoles: async () => ({
        data: {
            success: true,
            data: {
                roles: [{ id: 1, name: 'Admin' }, { id: 2, name: 'Manager' }, { id: 3, name: 'Staff' }],
            },
        },
    }),
    getPositions: async () => ({
        data: {
            success: true,
            data: {
                positions: [
                    { id: 101, title: 'Engineer', department: 'Tech' },
                    { id: 102, title: 'Analyst', department: 'Finance' },
                    { id: 103, title: 'HR Partner', department: 'HR' },
                ],
            },
        },
    }),
    createUser: async (formData) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Attempting to create user with data:', Object.fromEntries(formData.entries()));
        
        // Mock success response
        if (Math.random() > 0.1) {
            return { data: { success: true, message: 'User created successfully!' } };
        } else {
            // Mock error response
            return { data: { success: false, message: 'Email address already in use.' }, response: { data: { message: 'Email address already in use.' } } };
        }
    }
};

const toast = {
    success: (msg) => console.log('TOAST SUCCESS:', msg),
    error: (msg) => console.error('TOAST ERROR:', msg)
};

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
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    phone: yup
        .string()
        .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format')
        .optional(),
    address: yup.string().optional(),
    dateOfBirth: yup.date().max(new Date(), 'Date of birth cannot be in the future').optional().nullable().transform((curr, orig) => orig === '' ? null : curr),
    roleId: yup.number().typeError('Role must be a number').optional().nullable().transform((curr, orig) => orig === '' ? null : curr),
    positionId: yup.number().typeError('Position must be a number').optional().nullable().transform((curr, orig) => orig === '' ? null : curr),
});

const UserCreateContent = () => {
    // Note: useNavigate requires Router context, provided by HashRouter wrapper
    const navigate = useNavigate(); 
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            roleId: '',
            positionId: '',
            dateOfBirth: '',
        }
    });

    useEffect(() => {
        // Fetch roles
        userAPI.getRoles().then(response => {
            if (response.data.success) {
                setRoles(response.data.data.roles);
            }
        }).catch(error => {
            console.error('Error fetching roles:', error);
        });

        // Fetch positions
        userAPI.getPositions().then(response => {
            if (response.data.success) {
                setPositions(response.data.data.positions);
            }
        }).catch(error => {
            console.error('Error fetching positions:', error);
        });
    }, []);

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            // Create FormData for API call
            const formData = new FormData();

            Object.keys(data).forEach(key => {
                // Ensure dateOfBirth is formatted correctly for API if present
                if (key === 'dateOfBirth' && data[key]) {
                    formData.append(key, new Date(data[key]).toISOString().split('T')[0]);
                } else if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                    formData.append(key, data[key]);
                }
            });

            const response = await userAPI.createUser(formData);

            if (response.data.success) {
                toast.success('User created successfully!');
                // Use hash navigation compatible path
                navigate('/users'); 
            } else {
                setError('root', {
                    type: 'manual',
                    message: response.data.message || 'User creation failed'
                });
                toast.error(response.data.message || 'User creation failed');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            const message = error.response?.data?.message || 'User creation failed. Check console for details.';
            setError('root', {
                type: 'manual',
                message
            });
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <div className="mt-4 border-b border-red-300 pb-4">
                        <h1 className="text-4xl font-extrabold leading-tight text-gray-900">
                            Create New User
                        </h1>
                        <p className="mt-2 text-base text-gray-600">
                            Add a new user to the system with role and position assignments.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="px-4 sm:px-0">
                    {/* Use custom card styling */}
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
                                    
                                    {/* Email */}
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
                                                className={`form-input pl-10 ${errors.email ? 'error' : ''}`}
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="error-message">{errors.email.message}</p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div className="form-group">
                                        <label htmlFor="password" className="form-label">
                                            Password <span className="text-red-600">*</span>
                                        </label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                {...register('password')}
                                                type={showPassword ? 'text' : 'password'}
                                                className={`form-input pl-10 pr-10 ${errors.password ? 'error' : ''}`}
                                                placeholder="Enter password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="error-message">{errors.password.message}</p>
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
                                                // Removed pl-10 for date input since the icon doesn't align well with the field format
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
                                
                                {/* Create Button */}
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
                                    {isSubmitting ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Wrap UserCreateContent with HashRouter for local routing context compatibility
const UserCreate = () => (
    <HashRouter>
        <UserCreateContent />
    </HashRouter>
);

export default UserCreate;