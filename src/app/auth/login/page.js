'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';

export default function Login() {
  const router = useRouter();
  const { login, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setMessage('');
    
    if (!formData.email || !formData.password) {
      setError('Both email and password are required');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setMessage('');
    
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(formData.email);
      setMessage('Password reset email sent. Check your inbox.');
      setResetMode(false);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {resetMode ? 'Reset Your Password' : 'Sign in to your account'}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="px-6 py-12 shadow sm:rounded-lg sm:px-12" style={{ backgroundColor: 'var(--card-background)', color: 'var(--card-foreground)' }}>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
                {message}
              </div>
            )}
            
            {!resetMode ? (
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6" style={{ color: 'var(--card-foreground)' }}>
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      style={{ 
                        backgroundColor: 'var(--background)', 
                        color: 'var(--foreground)',
                        borderColor: 'var(--border)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium leading-6" style={{ color: 'var(--card-foreground)' }}>
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <div className="text-sm leading-6">
                    <button 
                      type="button" 
                      onClick={() => setResetMode(true)}
                      className="font-semibold text-blue-600 hover:text-blue-500"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handlePasswordReset}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setResetMode(false)}
                    className="flex w-full justify-center rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold leading-6 text-gray-900 shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                  >
                    Back to login
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {loading ? 'Sending...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{' '}
            <Link href="/auth/register" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
