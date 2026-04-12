import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import { loginUser } from '../../api/authApi';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setLogin = useAuthStore((state) => state.login);
  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await loginUser(data);
      const { token, ...user } = res.data;
      setLogin(user, token);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid email or password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border">
        <div className="flex flex-col items-center">
          <Link to="/">
            <img 
              src="/logo/image.png" 
              alt="VaxTrack Logo" 
              className="w-16 h-16 rounded-xl object-contain shadow-sm mb-4"
            />
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-foreground tracking-tight">
            Sign in to VaxTrack
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-500 dark:text-slate-400">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Email address</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-secondary-400 dark:text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`pl-10 block w-full sm:text-sm bg-card text-foreground border-border rounded-md focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none transition-shadow ${errors.email ? 'border-danger-500 focus:ring-danger-500' : ''}`}
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
              {errors.email && <p className="mt-1 text-sm text-danger-500 dark:text-danger-400 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-secondary-400 dark:text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`pl-10 block w-full sm:text-sm bg-card text-foreground border-border rounded-md focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none transition-shadow ${errors.password ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum length should be 6 characters' }
                  })}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-danger-500 dark:text-danger-400 font-medium">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700 rounded cursor-pointer"
                {...register('rememberMe')}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700 dark:text-slate-300 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
                Forgot your password?
              </a>
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
                  Signing in...
                </div>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <FiLogIn className="h-5 w-5 text-primary-400 group-hover:text-primary-300 transition-colors" />
                  </span>
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
