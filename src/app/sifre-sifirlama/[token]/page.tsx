'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ClientLayout from '../../../components/ClientLayout';
import { Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

// Prevent static generation of this page
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return [
    { token: 'example-reset-token' },
  ];
}

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { token } = params;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isTokenValidating, setIsTokenValidating] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    // Validate token when component mounts
    async function validateToken() {
      try {
        const response = await fetch(`/api/auth/forgot-password-v2?token=${token}`);
        
        // Handle parse errors
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Error parsing token validation response:', parseError);
          setIsTokenValid(false);
          toast.error('Sunucu yanıtı işlenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
          setIsTokenValidating(false);
          return;
        }
        
        setIsTokenValid(data.valid);
        
        if (!data.valid) {
          toast.error(data.error || 'Geçersiz veya süresi dolmuş token.');
        }
      } catch (error) {
        setIsTokenValid(false);
        toast.error('Token doğrulaması sırasında bir hata oluştu.');
      } finally {
        setIsTokenValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 8) {
      toast.error('Şifre en az 8 karakter uzunluğunda olmalıdır.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      // Handle parse errors
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing reset password response:', parseError);
        throw new Error('Sunucu yanıtı işlenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Şifre sıfırlama sırasında bir hata oluştu.');
      }

      // Success
      setResetSuccess(true);
      toast.success('Şifreniz başarıyla sıfırlandı.');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/giris');
      }, 3000);
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isTokenValidating) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 bg-gray-900">
          <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
            <p className="text-white">Token doğrulanıyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (isTokenValid === false) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 bg-gray-900">
          <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Geçersiz veya Süresi Dolmuş Link</h1>
              <p className="text-gray-300">
                Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama isteği oluşturun.
              </p>
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/sifremi-unuttum"
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 text-sm font-medium"
              >
                Yeni Şifre Sıfırlama İsteği Oluştur
              </Link>
              <Link
                href="/giris"
                className="inline-flex items-center text-orange-500 hover:text-orange-400 mt-4"
              >
                <ArrowLeft size={16} className="mr-2" />
                Giriş sayfasına dön
              </Link>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (resetSuccess) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 bg-gray-900">
          <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Şifre Başarıyla Sıfırlandı</h1>
              <p className="text-gray-300">
                Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/giris"
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 text-sm font-medium"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Şifre Sıfırlama</h1>
            <p className="text-gray-300 mt-1">
              Lütfen yeni şifrenizi belirleyin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Yeni Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10 mt-1 block w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Yeni şifreniz (en az 8 karakter)"
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Şifreyi Onayla
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10 mt-1 block w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Şifrenizi tekrar girin"
                  minLength={8}
                />
              </div>
              {password !== confirmPassword && confirmPassword !== '' && (
                <p className="mt-1 text-sm text-red-400">Şifreler eşleşmiyor.</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    İşleniyor...
                  </>
                ) : (
                  'Şifreyi Sıfırla'
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <Link href="/giris" className="text-sm text-orange-500 hover:text-orange-400">
                <ArrowLeft className="inline mr-1 h-4 w-4" />
                Giriş sayfasına dön
              </Link>
            </div>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
} 