import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, UserPlus, Briefcase, Shield } from 'lucide-react';

// --- MOCK AUTH ---
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
      data: { roles: [{ id: 1, name: 'Admin' }, { id: 2, name: 'Manager' }, { id: 3, name: 'Staff' }] },
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

// --- Validation schema ---
const schema = yup.object({
  firstName: yup.string().min(2).max(50).required(),
  lastName: yup.string().min(2).max(50).required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null]).required(),
  phone: yup.string().matches(/^[0-9+\-\s()]*$/).optional().nullable(),
  address: yup.string().optional().nullable(),
  dateOfBirth: yup.date().max(new Date()).optional().nullable(),
  roleId: yup.number().optional().nullable(),
  positionId: yup.number().optional().nullable(),
});

const RegisterContent = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [positions, setPositions] = useState([]);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { roleId: '', positionId: '', dateOfBirth: '' }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesRes = await userAPI.getRoles();
        if (rolesRes.data.success) setRoles(rolesRes.data.data.roles);

        const positionsRes = await userAPI.getPositions();
        if (positionsRes.data.success) setPositions(positionsRes.data.data.positions);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setError('root', { type: 'manual', message: '' });
    const userDataToSend = {
      ...data,
      phone: data.phone || null,
      address: data.address || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : null,
      roleId: data.roleId ? parseInt(data.roleId) : null,
      positionId: data.positionId ? parseInt(data.positionId) : null,
    };
    const { confirmPassword, ...finalData } = userDataToSend;
    const result = await registerUser(finalData);
    if (result.success) navigate('/dashboard');
    else setError('root', { type: 'manual', message: result.message || 'Registration failed' });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      
      {/* Left Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-red-500 to-red-600 items-center justify-center p-12">
        <div className="text-white text-center space-y-4">
          <h2 className="text-4xl font-bold">Welcome!</h2>
          <p className="text-lg">Join us and manage your tasks efficiently.</p>
          <img src="https://source.unsplash.com/300x300/?office,team" alt="Illustration" className="mt-6 rounded-xl shadow-lg"/>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <UserPlus className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-red-600 font-medium hover:text-red-700 underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Account Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input {...register('firstName')} type="text" placeholder="First Name" className={`w-full border rounded-lg py-2 pl-10 focus:ring-red-500 focus:border-red-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                  {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div className="relative">
                  <input {...register('lastName')} type="text" placeholder="Last Name" className={`w-full border rounded-lg py-2 pl-10 focus:ring-red-500 focus:border-red-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                  {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="relative">
                <input {...register('email')} type="email" placeholder="Email" className={`w-full border rounded-lg py-2 pl-10 focus:ring-red-500 focus:border-red-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Password" className={`w-full border rounded-lg py-2 pl-10 pr-10 focus:ring-red-500 focus:border-red-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400"/> : <Eye className="h-5 w-5 text-gray-400"/>}
                  </button>
                  {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div className="relative">
                  <input {...register('confirmPassword')} type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" className={`w-full border rounded-lg py-2 pl-10 pr-10 focus:ring-red-500 focus:border-red-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400"/> : <Eye className="h-5 w-5 text-gray-400"/>}
                  </button>
                  {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            {/* Optional Details */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input {...register('phone')} type="tel" placeholder="Phone" className={`w-full border rounded-lg py-2 pl-10 focus:ring-red-500 focus:border-red-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                  {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <input {...register('dateOfBirth')} type="date" className={`w-full border rounded-lg py-2 focus:ring-red-500 focus:border-red-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`} />
              </div>

              <div className="relative">
                <textarea {...register('address')} rows={3} placeholder="Address" className={`w-full border rounded-lg py-2 pl-10 focus:ring-red-500 focus:border-red-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`} />
                <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5"/>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <select {...register('roleId')} className={`w-full border rounded-lg py-2 pl-10 focus:ring-red-500 focus:border-red-500 ${errors.roleId ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                </div>
                <div className="relative">
                  <select {...register('positionId')} className={`w-full border rounded-lg py-2 pl-10 focus:ring-red-500 focus:border-red-500 ${errors.positionId ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="">Select Position</option>
                    {positions.map(p => <option key={p.id} value={p.id}>{p.title} - {p.department}</option>)}
                  </select>
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                </div>
              </div>
            </div>

            {errors.root && <p className="text-red-600 text-sm mt-2">{errors.root.message}</p>}

            <button type="submit" disabled={isLoading} className={`w-full py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-md transition-all ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Register = () => <RegisterContent />;
export default Register;
