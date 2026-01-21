'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/api-client';
import { ForgotPasswordRequest } from '@/types';
import ThemeToggle from '@/components/ui/ThemeToggle';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      
      const request: ForgotPasswordRequest = {
        email: data.email,
      };

      await apiClient.post('/api/auth/forgot-password', request);
      
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send reset email';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmail = async () => {
    const email = getValues('email');
    if (!email) return;

    try {
      setIsLoading(true);
      await apiClient.post('/api/auth/forgot-password', { email });
      toast.success('Password reset email sent again!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to resend email';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Theme Toggle - top right */}
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              We've sent a password reset link to {getValues('email')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 dark:bg-blue-900 p-4">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p>Didn't receive the email? Check your spam folder or try resending.</p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={resendEmail}
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Sending...' : 'Resend email'}
              </button>

              <Link href="/login" className="btn-secondary w-full text-center">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="input mt-1"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-3">
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
                  Sending reset email...
                </>
              ) : (
                'Send reset email'
              )}
            </button>

            <Link href="/login" className="btn-secondary w-full text-center">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}