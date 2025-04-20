'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * A wrapper component that restricts access to authenticated users only.
 * Redirects unauthenticated users to the login page or a specified route.
 * 
 * @param children - The components to render for authenticated users
 * @param redirectTo - Optional path to redirect to (defaults to /giris)
 * @param fallback - Optional component to show while checking authentication
 */
export default function ProtectedRoute({ 
  children, 
  redirectTo = '/giris',
  fallback = (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Yükleniyor...</p>
      </div>
    </div>
  )
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is complete and we know user is not authenticated
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // While checking authentication, show the fallback
  if (loading) {
    return <>{fallback}</>;
  }

  // If authenticated, render the children
  if (user) {
    return <>{children}</>;
  }

  // This will only briefly show before the redirect happens
  return <>{fallback}</>;
} 