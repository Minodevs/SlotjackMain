'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import Link from 'next/link';
import { 
  ChevronLeft, Phone, User, Mail, Shield, Check, AlertTriangle,
  Clock, Loader2
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, loading, updateProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [errors, setErrors] = useState<{ phone?: string; code?: string }>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris');
      return;
    }

    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
      setIsVerified(user.phoneVerified || false);
    }
  }, [user, loading, router]);

  // Handle countdown for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setIsResendDisabled(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCountdown]);

  // Send verification code
  const sendVerificationCode = async () => {
    // Validate phone number
    if (!phoneNumber.trim()) {
      setErrors({ phone: 'Lütfen telefon numaranızı giriniz' });
      return;
    }

    // Basic validation for international phone number
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
      setErrors({ phone: 'Geçerli bir telefon numarası giriniz (ör: +90 555 123 4567)' });
      return;
    }

    setErrors({});
    setIsSendingCode(true);

    try {
      // In a real implementation, you would call an API to send SMS
      // For demo purposes, we're generating a random 6-digit code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(generatedCode);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Verification code sent:', generatedCode);
      setVerificationSent(true);
      setVerificationInProgress(true);
      setSuccessMessage(`Doğrulama kodu gönderildi: ${generatedCode}`); // In production, don't show the code
      
      // Start countdown for resend button
      setIsResendDisabled(true);
      setResendCountdown(60);
    } catch (error) {
      console.error('Error sending verification code:', error);
      setErrors({ phone: 'Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.' });
    } finally {
      setIsSendingCode(false);
    }
  };

  // Verify the code
  const verifyCode = async () => {
    if (!enteredCode.trim()) {
      setErrors({ code: 'Lütfen doğrulama kodunu giriniz' });
      return;
    }

    if (enteredCode !== verificationCode) {
      setErrors({ code: 'Geçersiz doğrulama kodu. Lütfen tekrar deneyin.' });
      return;
    }

    setErrors({});

    try {
      // In a real implementation, you would call an API to verify the code
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user profile with verified phone
      await updateProfile({ 
        phoneNumber: phoneNumber, 
        phoneVerified: true 
      });

      setIsVerified(true);
      setVerificationInProgress(false);
      setSuccessMessage('Telefon numaranız başarıyla doğrulandı!');
    } catch (error) {
      console.error('Error verifying code:', error);
      setErrors({ code: 'Doğrulama başarısız. Lütfen tekrar deneyin.' });
    }
  };

  // Cancel verification process
  const cancelVerification = () => {
    setVerificationSent(false);
    setVerificationInProgress(false);
    setEnteredCode('');
    setVerificationCode('');
    setErrors({});
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/profil" className="flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ChevronLeft className="w-5 h-5 mr-1" /> Profil Sayfasına Dön
        </Link>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-750 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">Profil Ayarları</h1>
            <p className="text-gray-400">Hesap bilgilerinizi güncelleyin ve güvenliğinizi artırın</p>
          </div>

          <div className="p-6">
            {successMessage && (
              <div className="bg-green-900/30 border border-green-800 text-green-300 p-4 rounded-lg mb-6 flex items-start">
                <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>{successMessage}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Navigation Sidebar */}
              <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                <h2 className="font-semibold text-white mb-4">Ayarlar</h2>
                <nav>
                  <ul className="space-y-2">
                    <li>
                      <Link 
                        href="/profil"
                        className="flex items-center p-2 rounded-lg text-gray-300 hover:bg-gray-700"
                      >
                        <User className="w-5 h-5 mr-3" />
                        <span>Profil Bilgileri</span>
                      </Link>
                    </li>
                    <li>
                      <div 
                        className="flex items-center p-2 rounded-lg bg-blue-600 text-white"
                      >
                        <Phone className="w-5 h-5 mr-3" />
                        <span>Telefon Doğrulama</span>
                      </div>
                    </li>
                    <li>
                      <Link 
                        href="/profil"
                        className="flex items-center p-2 rounded-lg text-gray-300 hover:bg-gray-700"
                      >
                        <Mail className="w-5 h-5 mr-3" />
                        <span>E-posta Ayarları</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/profil"
                        className="flex items-center p-2 rounded-lg text-gray-300 hover:bg-gray-700"
                      >
                        <Shield className="w-5 h-5 mr-3" />
                        <span>Güvenlik</span>
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Main Content */}
              <div className="md:col-span-2">
                <div className="bg-gray-750 p-6 rounded-lg border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Phone className="w-6 h-6 mr-2 text-blue-400" />
                    Telefon Numarası Doğrulama
                  </h2>

                  <p className="text-gray-300 mb-6">
                    Hesap güvenliğinizi artırmak ve bildirimler almak için telefon numaranızı doğrulayın. 
                    Doğrulanmış bir telefon numarası, hesap kurtarma ve iki faktörlü kimlik doğrulama için kullanılabilir.
                  </p>

                  {isVerified ? (
                    <div className="bg-gray-700 p-4 rounded-lg mb-6">
                      <div className="flex items-start">
                        <Check className="w-5 h-5 text-green-400 mr-3 mt-1" />
                        <div>
                          <h3 className="font-medium text-white">Telefon Numarası Doğrulandı</h3>
                          <p className="text-gray-300 text-sm mb-2">{phoneNumber}</p>
                          <button 
                            onClick={() => {
                              setIsVerified(false);
                              setPhoneNumber('');
                              setSuccessMessage('');
                            }}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            Telefon numarasını değiştir
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {!verificationInProgress ? (
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="phoneNumber" className="block text-gray-300 mb-2">
                              Telefon Numarası
                            </label>
                            <div className="flex">
                              <input 
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+90 555 123 4567"
                                className={`flex-grow bg-gray-700 rounded-l-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border border-red-500' : ''}`}
                              />
                              <button
                                onClick={sendVerificationCode}
                                disabled={isSendingCode}
                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-r-lg flex items-center"
                              >
                                {isSendingCode ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Gönderiliyor...
                                  </>
                                ) : (
                                  'Kod Gönder'
                                )}
                              </button>
                            </div>
                            {errors.phone && (
                              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                            )}
                            <p className="text-gray-400 text-sm mt-1">
                              Lütfen ülke kodu ile birlikte girin. Örneğin: +90 555 123 4567
                            </p>
                          </div>

                          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <div className="flex items-start">
                              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                              <div className="text-sm text-gray-300">
                                <p className="font-medium text-white mb-1">Neden telefon numaramı doğrulamalıyım?</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-300">
                                  <li>Hesap güvenliğinizi artırır</li>
                                  <li>Önemli etkinlikler hakkında SMS bildirimleri alabilirsiniz</li>
                                  <li>Hesabınıza erişimi kaybetmeniz durumunda kurtarma seçeneği sağlar</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-blue-900/30 border border-blue-800 p-4 rounded-lg">
                            <p className="text-blue-200 mb-2">
                              <span className="font-medium text-white">{phoneNumber}</span> numarasına bir doğrulama kodu gönderdik.
                            </p>
                            <p className="text-blue-200 text-sm">
                              Lütfen almış olduğunuz SMS'teki 6 haneli kodu girin.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label htmlFor="verificationCode" className="block text-gray-300 mb-2">
                                Doğrulama Kodu
                              </label>
                              <div className="flex">
                                <input 
                                  type="text"
                                  id="verificationCode"
                                  value={enteredCode}
                                  onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                  placeholder="6 haneli kod"
                                  maxLength={6}
                                  className={`flex-grow bg-gray-700 rounded-l-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.code ? 'border border-red-500' : ''}`}
                                />
                                <button
                                  onClick={verifyCode}
                                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-r-lg"
                                >
                                  Doğrula
                                </button>
                              </div>
                              {errors.code && (
                                <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                              )}
                            </div>

                            <div className="flex justify-between items-center">
                              <button
                                onClick={cancelVerification}
                                className="text-gray-400 hover:text-gray-300"
                              >
                                İptal
                              </button>

                              <button
                                onClick={sendVerificationCode}
                                disabled={isResendDisabled || isSendingCode}
                                className="text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center"
                              >
                                {isResendDisabled ? (
                                  <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {resendCountdown} saniye sonra tekrar gönder
                                  </span>
                                ) : isSendingCode ? (
                                  <span className="flex items-center">
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    Gönderiliyor...
                                  </span>
                                ) : (
                                  'Kodu tekrar gönder'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 