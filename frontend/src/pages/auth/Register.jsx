import React, { useState, useEffect } from 'react';
import { HashRouter, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Calendar, UserPlus, Briefcase, Shield, LogIn } from 'lucide-react';

// --- MOCKING EXTERNAL IMPORTS FOR SINGLE-FILE RUNNABLE ENVIRONMENT ---
const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    const registerUser = async (userData) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        
        if (userData.email.includes('exists')) {
            return { success: false, message: 'User with this email already exists.' };
        }
        return { success: true, message: 'Registration successful!' };
    };

    return { register: registerUser, isLoading };
};

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
};
// --- END MOCKING ---

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
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
    // Ensure transformations for optional fields
    phone: yup
        .string()
        .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format')
        .optional()
        .nullable()
        .transform((curr, orig) => orig === '' ? null : curr),
    address: yup.string().optional().nullable().transform((curr, orig) => orig === '' ? null : curr),
    dateOfBirth: yup.date().max(new Date(), 'Date of birth cannot be in the future').optional().nullable().transform((curr, orig) => orig === '' ? null : curr),
    roleId: yup.number().typeError('Role must be a number').optional().nullable().transform((curr, orig) => orig === '' ? null : curr),
    positionId: yup.number().typeError('Position must be a number').optional().nullable().transform((curr, orig) => orig === '' ? null : curr),
});

const RegisterContent = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const { register: registerUser, isLoading } = useAuth();
    // useNavigate needs HashRouter context
    const navigate = useNavigate();

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
        fetchRoles();
        fetchPositions();
    }, []);

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
        // Clear previous root errors
        setError('root', { type: 'manual', message: '' }); 
        
        // Ensure data transformation for optional fields matches schema expectations
        const userDataToSend = {
            ...data,
            phone: data.phone || null,
            address: data.address || null,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : null,
            roleId: data.roleId ? parseInt(data.roleId) : null,
            positionId: data.positionId ? parseInt(data.positionId) : null,
        };
        
        // Destructure confirmPassword out before sending to Auth API
        const { confirmPassword, ...finalData } = userDataToSend;

        const result = await registerUser(finalData);

        if (result.success) {
            // Navigate using hash path for single-file compatibility
            navigate('#/dashboard');
        } else {
            setError('root', {
                type: 'manual',
                message: result.message || 'Registration failed'
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-xl"> {/* Increased max-w for larger form */}
                <div className="text-center">
                    {/* Icon: Themed Red */}
                    <UserPlus className="mx-auto h-12 w-12 text-red-600" />
                    <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-base text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="#/login"
                            // Themed Red Link
                            className="font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                {/* Auth Card: Use custom card styling */}
                <div className="card py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        
                        {/* --- Required Fields: Personal Info & Passwords --- */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 border-b border-red-100 pb-2">Account Details</h3>

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="firstName" className="form-label">First Name</label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            {...register('firstName')}
                                            type="text"
                                            autoComplete="given-name"
                                            className={`form-input pl-10 ${errors.firstName ? 'error' : ''}`}
                                            placeholder="First name"
                                        />
                                        {errors.firstName && (<p className="error-message">{errors.firstName.message}</p>)}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName" className="form-label">Last Name</label>
                                    <div className="mt-1">
                                        <input
                                            {...register('lastName')}
                                            type="text"
                                            autoComplete="family-name"
                                            className={`form-input ${errors.lastName ? 'error' : ''}`}
                                            placeholder="Last name"
                                        />
                                        {errors.lastName && (<p className="error-message">{errors.lastName.message}</p>)}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Email Field */}
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email address</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('email')}
                                        type="email"
                                        autoComplete="email"
                                        className={`form-input pl-10 ${errors.email ? 'error' : ''}`}
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && (<p className="error-message">{errors.email.message}</p>)}
                                </div>
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            {...register('password')}
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            className={`form-input pl-10 pr-10 ${errors.password ? 'error' : ''}`}
                                            placeholder="Enter password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (<EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />) : (<Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />)}
                                        </button>
                                        {errors.password && (<p className="error-message">{errors.password.message}</p>)}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            {...register('confirmPassword')}
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            className={`form-input pl-10 pr-10 ${errors.confirmPassword ? 'error' : ''}`}
                                            placeholder="Confirm password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (<EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />) : (<Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />)}
                                        </button>
                                        {errors.confirmPassword && (<p className="error-message">{errors.confirmPassword.message}</p>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Optional Fields: Contact and Role --- */}
                        <div className="space-y-6 pt-6 border-t border-red-300">
                            <h3 className="text-xl font-bold text-gray-900 border-b border-red-100 pb-2">Optional Details</h3>

                            {/* Phone & Date of Birth */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="phone" className="form-label">Phone Number</label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            {...register('phone')}
                                            type="tel"
                                            autoComplete="tel"
                                            className={`form-input pl-10 ${errors.phone ? 'error' : ''}`}
                                            placeholder="Phone number"
                                        />
                                        {errors.phone && (<p className="error-message">{errors.phone.message}</p>)}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                                    <div className="mt-1 relative">
                                        <input
                                            {...register('dateOfBirth')}
                                            type="date"
                                            className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                                        />
                                        {errors.dateOfBirth && (<p className="error-message">{errors.dateOfBirth.message}</p>)}
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="form-group">
                                <label htmlFor="address" className="form-label">Address</label>
                                <div className="mt-1 relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        {...register('address')}
                                        rows={3}
                                        className={`form-input pl-10 ${errors.address ? 'error' : ''}`}
                                        placeholder="Enter your address"
                                    />
                                    {errors.address && (<p className="error-message">{errors.address.message}</p>)}
                                </div>
                            </div>

                            {/* Role and Position Selects */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="roleId" className="form-label">Role</label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Shield className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            {...register('roleId')}
                                            className={`form-input pl-10 ${errors.roleId ? 'error' : ''}`}
                                        >
                                            <option value="">Select a role</option>
                                            {roles.map((role) => (<option key={role.id} value={role.id}>{role.name}</option>))}
                                        </select>
                                        {errors.roleId && (<p className="error-message">{errors.roleId.message}</p>)}
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="positionId" className="form-label">Position</label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            {...register('positionId')}
                                            className={`form-input pl-10 ${errors.positionId ? 'error' : ''}`}
                                        >
                                            <option value="">Select a position</option>
                                            {positions.map((position) => (<option key={position.id} value={position.id}>{position.title} - {position.department}</option>))}
                                        </select>
                                        {errors.positionId && (<p className="error-message">{errors.positionId.message}</p>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errors.root && (
                            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                                <div className="text-sm font-medium text-red-700">{errors.root.message}</div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                // Use btn-primary for red gradient/shadow
                                className={`btn btn-primary w-full text-base ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <div className="spinner mr-2"></div>
                                ) : (
                                    <UserPlus className="h-5 w-5 mr-2 text-white" />
                                )}
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Wrap RegisterContent with HashRouter for local routing context compatibility
const Register = () => (
    <HashRouter>
        <RegisterContent />
    </HashRouter>
);

export default Register;