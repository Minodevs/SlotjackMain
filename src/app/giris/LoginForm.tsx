'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm() {
  const { signIn, error: authError, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResettingState, setIsResettingState] = useState(false);
  const searchParams = useSearchParams();

  // Handle recovery from stuck state
  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout;

    // If loading takes too long, offer a reset option
    if (loading) {
      loadingTimeout = setTimeout(() => {
        setError('Yükleme uzun sürdü. Oturum durumunuzu sıfırlamak isteyebilirsiniz.');
        setIsResettingState(true);
      }, 5000);
    }

    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [loading]);

  // Handle URL params
  useEffect(() => {
    // Check URL parameters
    if (searchParams?.get('emailExists') === 'true') {
      setSuccessMessage('Bu e-posta zaten kayıtlı. Lütfen giriş yapın.');
    } else if (searchParams?.get('logout') === 'true') {
      setSuccessMessage('Başarıyla çıkış yaptınız.');
    } else if (searchParams?.get('error') === 'true') {
      setError('Bir hata oluştu. Lütfen tekrar giriş yapmayı deneyin.');
    } else if (searchParams?.get('reset') === 'true') {
      setSuccessMessage('Uygulama durumu sıfırlandı. Lütfen tekrar giriş yapın.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/'); // Redirect to home page after successful login
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleResetState = () => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(';').forEach(c => {
      document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
    
    // Reload the page with reset param
    window.location.href = '/giris?reset=true';
  };

  return (
    <div className="w-full max-w-md p-8 space-y-4 bg-gray-900 rounded-xl shadow-lg border border-gray-800">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Giriş Yap</h1>
        <p className="text-gray-400 mt-1">SLOTJACK hesabınıza giriş yapın</p>
      </div>
      
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-900/50 border border-green-800 text-green-200 text-sm">
          {successMessage}
        </div>
      )}

      {isResettingState && (
        <div className="p-4 rounded-lg bg-yellow-900/50 border border-yellow-800 text-yellow-200 text-sm">
          <p>Giriş yaparken bir sorun mu yaşıyorsunuz?</p>
          <button 
            onClick={handleResetState}
            className="mt-2 w-full py-2 px-4 bg-yellow-700 hover:bg-yellow-600 text-white text-sm rounded transition-colors"
          >
            Oturum Durumunu Sıfırla
          </button>
        </div>
      )}

      {(error || authError) && (
        <div className="p-4 mb-4 text-sm text-red-400 bg-red-900/30 rounded-lg" role="alert">
          {error || authError}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            placeholder="E-posta adresiniz"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            placeholder="Şifreniz"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/sifremi-unuttum"
              className="font-medium text-orange-500 hover:text-orange-400"
            >
              Şifremi unuttum
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-400">
          Hesabınız yok mu?{' '}
          <Link href="/kayit" className="font-medium text-orange-500 hover:text-orange-400">
            Hemen kaydolun
          </Link>
        </p>
      </div>
    </div>
  );
} 