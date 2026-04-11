import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiCreditCard } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import { registerUser } from '../../api/authApi';

const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.login);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await registerUser({ ...data, role: 'Public' });
      // Backend returns { _id, name, email, role, token } directly
      const { token, ...user } = res.data;
      setLogin(user, token);
      toast.success('Account created! Welcome to VaxTrack.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please check your inputs.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-secondary-400 dark:text-slate-500" />
                </div>
                <input
                  id="name"
                  type="text"
                  className={`pl-10 block w-full sm:text-sm bg-white dark:bg-slate-900 text-secondary-900 dark:text-white border-secondary-300 dark:border-slate-600 rounded-md focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none transition-shadow ${errors.name ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-danger-600 dark:text-danger-400 font-medium">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-secondary-400 dark:text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  className={`pl-10 block w-full sm:text-sm bg-card text-foreground border-border rounded-md focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none transition-shadow ${errors.email ? 'border-danger-500' : ''}`}
                  placeholder="you@example.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Invalid email format'
                    }
                  })}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-danger-600 dark:text-danger-400 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-secondary-400 dark:text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  className={`pl-10 block w-full sm:text-sm bg-card text-foreground border-border rounded-md focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none transition-shadow ${errors.password ? 'border-danger-500' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' }
                  })}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-danger-600 dark:text-danger-400 font-medium">{errors.password.message}</p>}
            </div>

            {/* NIC */}
            <div>
              <label htmlFor="nic" className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">NIC Number</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCreditCard className="text-secondary-400 dark:text-slate-500" />
                </div>
                <input
                  id="nic"
                  type="text"
                  className={`pl-10 block w-full sm:text-sm bg-card text-foreground border-border rounded-md focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none transition-shadow ${errors.nic ? 'border-danger-500' : ''}`}
                  placeholder="e.g. 199012345678"
                  {...register('nic', { required: 'NIC is required' })}
                />
              </div>
              {errors.nic && <p className="mt-1 text-sm text-danger-600 dark:text-danger-400 font-medium">{errors.nic.message}</p>}
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Phone Number</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="text-secondary-400 dark:text-slate-500" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  className={`pl-10 block w-full sm:text-sm bg-card text-foreground border-border rounded-md focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none transition-shadow ${errors.phone ? 'border-danger-500' : ''}`}
                  placeholder="+94 7X XXX XXXX"
                  {...register('phone', { required: 'Phone number is required' })}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-danger-600 dark:text-danger-400 font-medium">{errors.phone.message}</p>}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Physical Address</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                  <FiMapPin className="text-secondary-400 dark:text-slate-500" />
                </div>
                <textarea
                  id="address"
                  rows={2}
                  className={`pl-10 block w-full sm:text-sm bg-card text-foreground border-border rounded-md focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none transition-shadow ${errors.address ? 'border-danger-500' : ''}`}
                  placeholder="Enter your full address"
                  {...register('address', { required: 'Address is required' })}
                />
              </div>
              {errors.address && <p className="mt-1 text-sm text-danger-600 dark:text-danger-400 font-medium">{errors.address.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Register Account'
              )}
            </button>
          </div>
          <div className="text-xs text-center text-gray-500 mt-4">
            By registering, you agree to our Terms of Service and Privacy Policy.
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
