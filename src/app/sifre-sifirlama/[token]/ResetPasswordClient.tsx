'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import { Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPasswordClient({ params }: { params: { token: string } }) {
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
        // In a real application, this would be an API call
        // For demo purposes, we'll use simulated validation
        const isValid = token.length > 8 && !token.includes('expired');
        setIsTokenValid(isValid);
        
        if (!isValid) {
          toast.error('Geçersiz veya süresi dolmuş token.');
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
      // In a real application, this would be an API call
      // For demo purposes, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      setResetSuccess(true);
      toast.success('Şifreniz başarıyla sıfırlandı.');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/giris');
      }, 3000);
      
    } catch (err: any) {
      toast.error(err.message || 'Şifre sıfırlama sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isTokenValidating) {
    return (
      <ClientLayoutWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 bg-gray-900">
          <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
            <p className="text-white">Token doğrulanıyor...</p>
          </div>
        </div>
      </ClientLayoutWrapper>
    );
  }

  if (isTokenValid === false) {
    return (
      <ClientLayoutWrapper>
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
      </ClientLayoutWrapper>
    );
  }

  if (resetSuccess) {
    return (
      <ClientLayoutWrapper>
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
      </ClientLayoutWrapper>
    );
  }

  return (
    <ClientLayoutWrapper>
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
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white"
                  placeholder="********"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Şifreyi Tekrar Girin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white"
                  placeholder="********"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    İşleniyor...
                  </>
                ) : (
                  'Şifreyi Sıfırla'
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link href="/giris" className="text-sm text-orange-500 hover:text-orange-400">
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </ClientLayoutWrapper>
  );
} 