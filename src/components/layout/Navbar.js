'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const isActive = (path) => {
    return pathname === path ? 'text-primary font-medium' : 'text-foreground hover:text-primary transition-colors';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-navbar-background/90 border-b border-border text-navbar-foreground">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-lg sm:text-xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Habitual</span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {user && (
                <>
                  <Link href="/dashboard" className={`inline-flex items-center px-1 pt-1 border-b-2 ${pathname === '/dashboard' ? 'border-primary' : 'border-transparent'} ${isActive('/dashboard')}`}>
                    Dashboard
                  </Link>
                  <Link href="/habits/new" className={`inline-flex items-center px-1 pt-1 border-b-2 ${pathname === '/habits/new' ? 'border-primary' : 'border-transparent'} ${isActive('/habits/new')}`}>
                    New Habit
                  </Link>
                  <Link href="/analytics" className={`inline-flex items-center px-1 pt-1 border-b-2 ${pathname === '/analytics' ? 'border-primary' : 'border-transparent'} ${isActive('/analytics')}`}>
                    Analytics
                  </Link>
                </>
              )}
            </div>
          </div>
          {/* Desktop navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className={`${isActive('/profile')} px-3 py-2 text-sm font-medium`}>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className={`${isActive('/auth/login')} px-3 py-2 text-sm font-medium`}>
                  Log in
                </Link>
                <Link href="/auth/register" className="px-4 py-2 bg-primary rounded-full text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile navigation */}
          <div className="flex items-center sm:hidden">
            {user ? (
              <div className="flex items-center space-x-1">
                <Link href="/dashboard" className={`${pathname === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-navbar-foreground'} px-2 py-1 text-xs rounded-md`}>
                  Dashboard
                </Link>
                <Link href="/habits/new" className={`${pathname === '/habits/new' ? 'bg-primary/10 text-primary' : 'text-navbar-foreground'} px-2 py-1 text-xs rounded-md`}>
                  New
                </Link>
                <Link href="/analytics" className={`${pathname === '/analytics' ? 'bg-primary/10 text-primary' : 'text-navbar-foreground'} px-2 py-1 text-xs rounded-md`}>
                  Analytics
                </Link>
                <Link href="/profile" className={`${pathname === '/profile' ? 'bg-primary/10 text-primary' : 'text-navbar-foreground'} px-2 py-1 text-xs rounded-md`}>
                  Profile
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login" className="px-2 py-1 text-xs">
                  Log in
                </Link>
                <Link href="/auth/register" className="px-2.5 py-1 bg-primary rounded-full text-xs text-primary-foreground">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
