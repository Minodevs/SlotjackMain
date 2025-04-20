'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Component that uses searchParams
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (!searchParams) {
      toast.error('Token bulunamadı. Lütfen tekrar şifre sıfırlama isteği oluşturun.');
      router.replace('/sifremi-unuttum');
      return;
    }
    
    const token = searchParams.get('token');
    if (token) {
      // Redirect to the token-specific page with the token
      router.replace(`/sifre-sifirlama/${token}`);
    } else {
      toast.error('Geçersiz token. Lütfen tekrar şifre sıfırlama isteği oluşturun.');
      router.replace('/sifremi-unuttum');
    }
  }, [router, searchParams]);
  
  return (
    <div className="text-white">
      <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
      Yönlendiriliyor...
    </div>
  );
}

export default function ResetPasswordRedirect() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <Suspense fallback={
        <div className="text-white">
          <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          Yükleniyor...
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
} 