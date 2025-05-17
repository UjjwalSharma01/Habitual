'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';

export default function Register() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await signup(formData.email, formData.password, formData.name);
      router.push('/onboarding');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
            Create your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="px-6 py-12 shadow sm:rounded-lg sm:px-12" style={{ backgroundColor: 'var(--card-background)', color: 'var(--card-foreground)' }}>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium leading-6" style={{ color: 'var(--card-foreground)' }}>
                  Full name
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6" style={{ color: 'var(--card-foreground)' }}>
                  Confirm Password
                </label>
                <div className="mt-2">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
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
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {loading ? 'Creating account...' : 'Sign up'}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Already a member?{' '}
            <Link href="/auth/login" className="font-semibold leading-6 text-primary hover:text-primary/90">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
