'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';

export default function Profile() {
  const router = useRouter();
  const { user, updateUserProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    photoURL: user?.photoURL || '',
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (!loading && !user) {
    router.push('/auth/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }

    try {
      setUpdating(true);
      await updateUserProfile({
        displayName: formData.displayName,
        photoURL: formData.photoURL || user?.photoURL
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="md:flex md:items-center md:justify-between mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-primary sm:text-3xl">
              Your Profile
            </h2>
          </div>
        </div>

        <div className="bg-card shadow-sm overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {message && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
                {message}
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-foreground">
                  Display Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="displayName"
                    id="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="shadow-sm bg-muted block w-full sm:text-sm border-border rounded-md"
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              <div>
                <label htmlFor="photoURL" className="block text-sm font-medium text-foreground">
                  Profile Picture URL (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="photoURL"
                    id="photoURL"
                    value={formData.photoURL || ''}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <div className="mt-8 sm:mt-10 border-t border-border pt-6">
              <h3 className="text-lg leading-6 font-medium text-foreground">Account Settings</h3>
              <div className="mt-2 max-w-xl text-sm text-muted-foreground">
                <p>Additional account management options</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-foreground bg-card hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => router.push('/profile/change-password')}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
