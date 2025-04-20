'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, AlertTriangle, LogIn } from 'lucide-react';
import ClientLayout from '../../components/ClientLayout';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isExistingEmail, setIsExistingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const router = useRouter();
  const { signUp, error, user, loading } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to home page
    if (user && !loading) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // Calculate password strength
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    // Contains numbers
    if (/[0-9]/.test(password)) strength += 1;
    // Contains special characters
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password, user, loading, router]);

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return 'Çok zayıf';
    if (passwordStrength <= 2) return 'Zayıf';
    if (passwordStrength <= 3) return 'Orta';
    if (passwordStrength <= 4) return 'Güçlü';
    return 'Çok güçlü';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setFormError(null);
    setIsExistingEmail(false);

    if (password !== confirmPassword) {
      setFormError('Şifreler eşleşmiyor');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Geçerli bir e-posta adresi giriniz');
      return;
    }

    // Check password strength
    if (passwordStrength < 3) {
      setFormError('Daha güçlü bir şifre giriniz');
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp(email, password, name);
      // Keep button disabled during redirect
      setTimeout(() => {
        router.push('/giris?registered=true');
      }, 500);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Kayıt olurken bir hata oluştu';
      
      // Check if this is an existing email error
      if (errorMessage.includes('zaten kullanılıyor')) {
        setIsExistingEmail(true);
        // Wait briefly before redirecting to login page
        setTimeout(() => {
          router.push(`/giris?exists=true&email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setFormError(errorMessage);
        setIsSubmitting(false);
      }
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <ClientLayout>
        <div className="max-w-md mx-auto">
          <div className="text-center py-12">
            <div className="inline-block w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  // If user is already logged in, show a redirect message
  if (user) {
    return (
      <ClientLayout>
        <div className="max-w-md mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Zaten giriş yapmışsınız</h2>
            <p className="text-gray-400 mb-6">Yeni bir hesap oluşturmak için önce çıkış yapmalısınız.</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => router.push('/')}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg px-6 py-2 transition-colors"
              >
                Ana Sayfaya Git
              </button>
              <button 
                onClick={() => router.push('/profil')}
                className="bg-[#FF6B00] hover:bg-[#FF8533] text-white font-medium rounded-lg px-6 py-2 transition-colors"
              >
                Profilime Git
              </button>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <UserPlus className="w-12 h-12 text-[#FF6B00] mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Kayıt Ol</h1>
          <p className="text-gray-400 mt-2">SLOTJACK'a hoş geldiniz</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Ad Soyad
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-colors"
              placeholder="Ad Soyad"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-colors"
              required
              minLength={6}
            />
            
            {password && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Şifre gücü: {getPasswordStrengthLabel()}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`} 
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-colors"
              required
              minLength={6}
            />
          </div>

          {formError && (
            <div className={`p-4 rounded-lg ${isExistingEmail ? 'bg-blue-900/50 border border-blue-800 text-blue-200' : 'bg-red-900/50 border border-red-800 text-red-200'} text-sm`}>
              <div className="flex items-start">
                {isExistingEmail ? (
                  <LogIn className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p>{formError}</p>
                  {isExistingEmail && (
                    <Link href="/giris" className="inline-block mt-2 text-white font-medium hover:underline">
                      Giriş sayfasına git →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#FF6B00] hover:bg-[#FF8533] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-400">Zaten hesabınız var mı? </span>
            <Link href="/giris" className="text-[#FF6B00] hover:underline">
              Giriş yapın
            </Link>
          </div>
        </form>
      </div>
    </ClientLayout>
  );
} 