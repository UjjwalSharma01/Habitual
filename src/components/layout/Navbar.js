'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const isActive = (path) => {
    return pathname === path ? 'text-blue-500 font-bold' : 'text-gray-600 hover:text-blue-500';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Habitual
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user && (
                <>
                  <Link href="/dashboard" className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/dashboard') ? 'border-blue-500' : 'border-transparent'} ${isActive('/dashboard')}`}>
                    Dashboard
                  </Link>
                  <Link href="/habits/new" className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/habits/new') ? 'border-blue-500' : 'border-transparent'} ${isActive('/habits/new')}`}>
                    New Habit
                  </Link>
                  <Link href="/analytics" className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/analytics') ? 'border-blue-500' : 'border-transparent'} ${isActive('/analytics')}`}>
                    Analytics
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className={`${isActive('/profile')} px-3 py-2 rounded-md text-sm font-medium`}>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className={`${isActive('/auth/login')} px-3 py-2 rounded-md text-sm font-medium`}>
                  Login
                </Link>
                <Link href="/auth/register" className="px-3 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
