'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { RegisterRequest, TenantPlan } from '@/types';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ROUTES } from '@/constants';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  tenantName: z.string().min(2, 'Organization name must be at least 2 characters'),
  tenantSubdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  plan: z.union([z.string(), z.number()]).transform((val) => Number(val)).pipe(z.nativeEnum(TenantPlan)),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      plan: TenantPlan.Free.toString(),
    } as any,
  });

  const watchSubdomain = watch('tenantSubdomain');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      clearErrors();
      
      const registerData: RegisterRequest = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        tenantName: data.tenantName,
        tenantSubdomain: data.tenantSubdomain.toLowerCase(),
        plan: data.plan,
      };

      const result = await registerUser(registerData);
      
      // Se a resposta indicar que precisa confirmar email
      if (result && !result.user?.emailConfirmed) {
        toast.success('Account created! Please check your email to confirm your account.');
        router.push(ROUTES.LOGIN + '?message=check-email');
      } else {
        // Login automático após registro
        toast.success('Account created successfully!');
        router.push(ROUTES.DASHBOARD);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Theme Toggle - top right */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Pype Logo" 
              className="h-12 w-12"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  autoComplete="given-name"
                  className="input mt-1"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  autoComplete="family-name"
                  className="input mt-1"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="input mt-1"
                placeholder="john@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="new-password"
                  className="input mt-1"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  className="input mt-1"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Organization Name
              </label>
              <input
                {...register('tenantName')}
                type="text"
                className="input mt-1"
                placeholder="Your Company"
              />
              {errors.tenantName && (
                <p className="mt-1 text-sm text-red-600">{errors.tenantName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="tenantSubdomain" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subdomain
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  {...register('tenantSubdomain')}
                  type="text"
                  className="input rounded-r-none"
                  placeholder="your-company"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                  .pype.app.br
                </span>
              </div>
              {watchSubdomain && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your Pype URL will be: https://{watchSubdomain}.pype.app.br
                </p>
              )}
              {errors.tenantSubdomain && (
                <p className="mt-1 text-sm text-red-600">{errors.tenantSubdomain.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Plan
              </label>
              <select {...register('plan')} className="input mt-1">
                <option value={TenantPlan.Free}>Free (5 users, 10 pipelines)</option>
                <option value={TenantPlan.Pro}>Pro (50 users, 100 pipelines)</option>
                <option value={TenantPlan.Enterprise}>Enterprise (500 users, unlimited pipelines)</option>
              </select>
              {errors.plan && (
                <p className="mt-1 text-sm text-red-600">{errors.plan.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}