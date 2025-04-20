'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ClientLayoutWrapper from '../../components/ClientLayoutWrapper';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Try to parse the response, with error handling
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Sunucu yanıtı işlenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Şifre sıfırlama işlemi sırasında bir hata oluştu.');
      }

      // Success
      setSubmitted(true);
      toast.success('Şifre sıfırlama talimatları, e-posta adresinize gönderildi.');
    } catch (err: any) {
      setError(err.message);
      toast.error('Şifre sıfırlama işlemi başarısız oldu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ClientLayoutWrapper>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Şifremi Unuttum</h1>
            <p className="text-gray-300 mt-1">
              {submitted
                ? 'E-posta adresinize şifre sıfırlama talimatları gönderildi.'
                : 'E-posta adresinizi girin ve şifre sıfırlama bağlantısı alın.'}
            </p>
          </div>

          {error && (
            <div className="p-4 mb-4 text-sm text-red-400 bg-red-900/30 rounded-lg" role="alert">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-4">
              <div className="bg-green-900/30 text-green-400 p-4 rounded-lg text-sm">
                <p className="mb-2">
                  <strong>Şifre sıfırlama talimatları gönderildi!</strong>
                </p>
                <p>
                  E-posta adresinize ({email}) bir şifre sıfırlama bağlantısı gönderdik. Lütfen gelen kutunuzu
                  kontrol edin ve şifrenizi sıfırlamak için e-postadaki bağlantıya tıklayın.
                </p>
                <p className="mt-2">
                  E-postayı göremiyorsanız, spam/önemsiz klasörünüzü kontrol edin veya birkaç dakika bekleyin.
                </p>
              </div>
              <div className="text-center">
                <Link
                  href="/giris"
                  className="inline-flex items-center text-orange-500 hover:text-orange-400"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Giriş sayfasına dön
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-10 mt-1 block w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                    placeholder="ornek@email.com"
                  />
                </div>
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
                    'Şifre Sıfırlama Bağlantısı Gönder'
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
          )}
        </div>
      </div>
    </ClientLayoutWrapper>
  );
} 