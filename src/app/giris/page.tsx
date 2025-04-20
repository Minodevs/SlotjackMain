'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import ClientLayout from '../../components/ClientLayout';

// Tell Next.js not to statically generate this page
export const dynamic = 'force-dynamic';

// Create a separate client component for the login form that uses useSearchParams
import LoginForm from './LoginForm';

// Loading component for suspense fallback
const LoginFormLoading = () => (
  <div className="w-full max-w-md p-8 space-y-4 bg-gray-900 rounded-xl shadow-lg border border-gray-800">
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold">Giriş Yap</h1>
      <p className="text-gray-400 mt-1">SLOTJACK hesabınıza giriş yapın</p>
    </div>
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-gray-700 rounded"></div>
      <div className="h-10 bg-gray-700 rounded"></div>
      <div className="h-10 bg-orange-700 rounded"></div>
    </div>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Handle redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <ClientLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <Suspense fallback={<LoginFormLoading />}>
          <LoginForm />
        </Suspense>
      </div>
    </ClientLayout>
  );
} 