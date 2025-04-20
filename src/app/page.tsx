'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Star, ArrowUp, ArrowDown, Coins, Calendar, MessageSquare, Activity, ChevronLeft, ChevronRight, UserPlus, Clock, Gift, Video, AlertCircle, X, Rocket } from 'lucide-react';
import ClientLayout from '../components/ClientLayout';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { UserRank, User, Transaction, Player, Tournament, SocialPlatform, RedemptionCode, isUser } from '@/types/user';
import SpinWheel from '@/components/SpinWheel';
import FloatingCoin from '@/components/FloatingCoin';

// Mock data remains the same
const topPlayers: Player[] = [
  { id: 1, name: 'emre_2024', points: 14500, avatar: '' },
  { id: 2, name: 'slotking', points: 12800, avatar: '' },
  { id: 3, name: 'jackmaster', points: 11200, avatar: '' },
  { id: 4, name: 'casinopro', points: 10150, avatar: '' },
  { id: 5, name: 'slotjack_vip', points: 9800, avatar: '' },
];

const upcomingTournaments: Tournament[] = [
   { id: 1, name: 'Haftalık Mega Turnuva', date: '23 Haziran 2024', prizePool: 25000, entryFee: 50, participants: 128 },
   { id: 2, name: 'VIP Özel Turnuva', date: '25 Haziran 2024', prizePool: 10000, entryFee: 0, participants: 64, isVipOnly: true },
   { id: 3, name: 'Aylık Şampiyona', date: '30 Haziran 2024', prizePool: 50000, entryFee: 100, participants: 256 },
];

// Slider items now come from site settings

// Transaction Item Component
function TransactionItem({ transaction }: { transaction: Transaction }) {
  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'earn': return 'text-green-400';
      case 'spend': return 'text-red-400';
      case 'bonus': return 'text-yellow-400';
      case 'event': return 'text-blue-400';
      case 'admin': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  }, []);

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'earn': return <ArrowUp className="w-4 h-4" />;
      case 'spend': return <ArrowDown className="w-4 h-4" />;
      case 'bonus': return <Gift className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'admin': return <AlertCircle className="w-4 h-4" />;
      default: return <Coins className="w-4 h-4" />;
    }
  }, []);

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffMin < 60) return `${diffMin} dakika önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  }, []);

  return (
    <div className="p-3 border-b border-gray-700 last:border-0 flex justify-between items-center">
      <div className="flex-1">
        <p className="font-medium">{transaction.description}</p>
        <span className="text-gray-400 text-sm">{formatDate(transaction.timestamp)}</span>
      </div>
      <div className={`flex items-center ${getTypeColor(transaction.type)}`}>
        {getTypeIcon(transaction.type)}
        <span className="ml-1">{transaction.amount > 0 ? '+' : ''}{transaction.amount}</span>
      </div>
    </div>
  );
}

// Add this constant at the top with the other constants
const HOMEPAGE_TABS_KEY = 'homepage_tabs_settings';

export default function HomePage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const router = useRouter();
  const authContext = useAuth();
  const { settings } = useSiteSettings();
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user: currentUser, leaderboard, updateJackPoints, loading, getRecentTransactions } = authContext;
  const typedUser = currentUser as User | null;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showThunder, setShowThunder] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState<{ amount: number; isVisible: boolean }>({ amount: 0, isVisible: false });
  const [isMounted, setIsMounted] = useState(false);
  const [isDailyBonusClaimed, setIsDailyBonusClaimed] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('Öne Çıkanlar');
  const [tabsConfig, setTabsConfig] = useState<any[]>([]);
  
  // New states for code redemption and daily bonus
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [isProcessingCode, setIsProcessingCode] = useState(false);
  const [dailyBonusTimeRemaining, setDailyBonusTimeRemaining] = useState<string>('');
  const [canClaimDailyBonus, setCanClaimDailyBonus] = useState(false);
  
  // Update current slide if it's out of bounds
  useEffect(() => {
    const banners = settings.banners || [];
    if (banners.length > 0 && currentSlide >= banners.length) {
      setCurrentSlide(0);
    }
  }, [settings.banners, currentSlide]);
  
  useEffect(() => {
    setIsMounted(true);
    
    if (sessionStorage.getItem('introPlayed') === 'true') {
      setIsVideoPlaying(false);
    }

    if (typedUser && getRecentTransactions) {
        setRecentTransactions(getRecentTransactions(5));
        // TODO: Check daily bonus status
    }
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [typedUser, getRecentTransactions]);
  
  const nextSlide = useCallback(() => {
    const banners = settings.banners || [];
    if (banners.length === 0) return;
    
    setShowThunder(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
      setTimeout(() => {
        setShowThunder(false);
      }, 300);
    }, 100);
  }, [settings.banners]);
  
  const prevSlide = useCallback(() => {
    const banners = settings.banners || [];
    if (banners.length === 0) return;
    
    setShowThunder(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
      setTimeout(() => {
        setShowThunder(false);
      }, 300);
    }, 100);
  }, [settings.banners]);
  
  const goToSlide = useCallback((index: number) => {
    const banners = settings.banners || [];
    if (banners.length === 0 || currentSlide === index) return;
    
    setShowThunder(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => {
        setShowThunder(false);
      }, 300);
    }, 100);
  }, [currentSlide, settings.banners]);

  useEffect(() => {
    if (isMounted) {
      const timer = setInterval(() => {
        nextSlide();
      }, 5000);
      
      return () => clearInterval(timer);
    }
  }, [isMounted, nextSlide]);
  
  const showCoinAnimation = (amount: number) => {
    setCoinAnimation({ amount, isVisible: true });
  };

  const handleAnimationEnd = () => {
    setCoinAnimation({ ...coinAnimation, isVisible: false });
  };

  // Check if user can claim daily bonus
  useEffect(() => {
    if (!typedUser) return;
    
    const checkDailyBonus = () => {
      // If user has never claimed daily bonus, they can claim it
      if (!typedUser.lastDailyBonus) {
        setCanClaimDailyBonus(true);
        setDailyBonusTimeRemaining('');
        return;
      }
      
      const now = new Date();
      const lastClaim = new Date(typedUser.lastDailyBonus);
      
      // Reset at 24 hours after last claim for proper 24-hour cooldown
      const nextClaimTime = new Date(lastClaim);
      nextClaimTime.setHours(lastClaim.getHours() + 24); 
      
      const timeUntilReset = nextClaimTime.getTime() - now.getTime();
      
      if (timeUntilReset <= 0) {
        // Can claim daily bonus
        setCanClaimDailyBonus(true);
        setDailyBonusTimeRemaining('');
      } else {
        // Calculate remaining time until next claim
        setCanClaimDailyBonus(false);
        
        const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeUntilReset % (1000 * 60)) / 1000);
        
        setDailyBonusTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };
    
    checkDailyBonus();
    const timer = setInterval(checkDailyBonus, 1000);
    
    return () => clearInterval(timer);
  }, [typedUser]);

  const claimDailyBonus = async () => {
    if (!typedUser || !canClaimDailyBonus) return;

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1000)),
      {
        loading: 'Bonus talep ediliyor...',
        success: (data) => {
          // Update user points - CHANGED FROM 20 TO 50
          updateJackPoints(50, 'Günlük Bonus', 'bonus');
          
          // Show animation - CHANGED FROM 20 TO 50
          showCoinAnimation(50);
          
          // Update last bonus time in localStorage (user data)
          if (typeof window !== 'undefined') {
            // Update in main user data
            const userData = JSON.parse(localStorage.getItem('slotjack_user') || '{}');
            if (userData && userData.id === typedUser.id) {
              userData.lastDailyBonus = Date.now();
              localStorage.setItem('slotjack_user', JSON.stringify(userData));
            }
            
            // Also update in registered users if exists
            const registeredUsers = JSON.parse(localStorage.getItem('slotjack_registered_users') || '{}');
            if (registeredUsers && registeredUsers[typedUser.email]) {
              registeredUsers[typedUser.email].lastDailyBonus = Date.now();
              localStorage.setItem('slotjack_registered_users', JSON.stringify(registeredUsers));
            }
            
            // Also update in users array if exists (for backward compatibility)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const updatedUsers = users.map((u: User) => {
              if (u.id === typedUser.id) {
                return { ...u, lastDailyBonus: Date.now() };
              }
              return u;
            });
            localStorage.setItem('users', JSON.stringify(updatedUsers));
          }
          
          // Update state
          setCanClaimDailyBonus(false);
          
          return '50 JackPoints başarıyla hesabınıza eklendi!';
        },
        error: 'Bonus alınamadı. Lütfen tekrar deneyin.',
      }
    );
  };

  // Handle code redemption
  const handleCodeSubmit = () => {
    if (!typedUser || !codeInput.trim() || isProcessingCode) return;

    setIsProcessingCode(true);

    toast.promise(
      new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            // Get redemption codes from localStorage
            const storedCodes = JSON.parse(localStorage.getItem('redemptionCodes') || '[]') as RedemptionCode[];
            
            // Find the code
            const codeIndex = storedCodes.findIndex(
              c => c.code.toLowerCase() === codeInput.trim().toLowerCase() && !c.isUsed
            );
            
            if (codeIndex === -1) {
              reject('Geçersiz kod veya bu kod zaten kullanılmış.');
              return;
            }
            
            const code = storedCodes[codeIndex];
            
            // Mark the code as used
            storedCodes[codeIndex] = {
              ...code,
              isUsed: true,
              usedAt: Date.now(),
              usedBy: typedUser.email
            };
            
            // Save back to localStorage
            localStorage.setItem('redemptionCodes', JSON.stringify(storedCodes));
            
            // Add points to user
            updateJackPoints(code.pointValue, 'Kod Bonus: ' + code.code, 'bonus');
            
            // Success
            resolve(`${code.pointValue} JackPoint kazandınız!`);
          } else {
            reject('İşlem sırasında bir hata oluştu.');
          }
        }, 1000);
      }),
      {
        loading: 'Kod doğrulanıyor...',
        success: (msg) => {
          // Show animation
          showCoinAnimation(parseInt(msg));
          
          // Reset code input and close modal
          setCodeInput('');
          setShowCodeModal(false);
          
          return msg;
        },
        error: (err) => {
          return err;
        },
      }
    ).finally(() => {
      setIsProcessingCode(false);
    });
  };

  const claimSocialBonus = async (platform: string) => {
     if (!typedUser) {
       toast.error('Bonus talep etmek için giriş yapmalısınız.');
       return;
     }
     toast.success(`${platform} bonusu için talep alındı! (Simüle edildi)`);
  };

  const joinEvent = async (eventName: string) => {
    if (!typedUser) {
       toast.error('Etkinliğe katılmak için giriş yapmalısınız.');
       return;
     }
     toast.success(`"${eventName}" etkinliğine katıldınız! (Simüle edildi)`);
  };
  
  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffMin < 60) return `${diffMin} dakika önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  }, []);
  
  // Load tabs configuration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTabs = localStorage.getItem(HOMEPAGE_TABS_KEY);
      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        setTabsConfig(parsedTabs.filter((tab: any) => tab.isActive).sort((a: any, b: any) => a.order - b.order));
        // Set default active tab to the first available one
        if (parsedTabs.length > 0) {
          setActiveTab(parsedTabs.find((tab: any) => tab.isActive)?.title || 'Öne Çıkanlar');
        }
      }
    }
  }, []);
  
  const renderTabContent = () => {
    // Find the active tab configuration
    const tabConfig = tabsConfig.find(tab => tab.title === activeTab);
    
    if (!tabConfig) {
      return <p className="text-gray-400">Bu sekme için içerik bulunamadı.</p>;
    }
    
    // Parse HTML string from configuration and create the JSX
    const createMarkup = () => {
      return { __html: tabConfig.content };
    };
    
    return (
      <div>
        <div dangerouslySetInnerHTML={createMarkup()} />
        
        {tabConfig.linkText && tabConfig.linkUrl && (
          <div className="mt-4">
            <Link 
              href={tabConfig.linkUrl}
              className="text-blue-400 hover:text-blue-300 text-sm inline-block"
            >
              {tabConfig.linkText}
            </Link>
          </div>
        )}
      </div>
    );
  };

  // Create social platforms array using settings
  const socialPlatforms: SocialPlatform[] = [
    { id: 1, name: "Telegram", icon: "T", color: "bg-blue-500", link: settings.socialLinks.telegram },
    { id: 2, name: "Twitter", icon: "T", color: "bg-black", link: settings.socialLinks.twitter },
    { id: 3, name: "Instagram", icon: "I", color: "bg-pink-600", link: settings.socialLinks.instagram },
    { id: 4, name: "Youtube", icon: "Y", color: "bg-red-600", link: settings.socialLinks.youtube },
    { id: 5, name: "Kick", icon: "K", color: "bg-green-500", link: settings.socialLinks.kick },
  ];

  return (
    <>
      {isVideoPlaying && (
        <video
          key="intro-video"
          src="/video/loading.mp4"
          autoPlay
          muted
          playsInline
          onEnded={() => {
            setIsVideoPlaying(false);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('introPlayed', 'true');
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: 9999,
            backgroundColor: '#111',
          }}
        />
      )}
      {!isVideoPlaying && (
        <ClientLayout>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8 relative">
            <FloatingCoin 
              amount={coinAnimation.amount} 
              isVisible={coinAnimation.isVisible} 
              onAnimationEnd={handleAnimationEnd} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                {typedUser ? (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-800 rounded-lg p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-semibold">Hoş Geldin, {typedUser.name || typedUser.email}!</h2>
                      <Link href="/profil" className="text-sm text-blue-400 hover:underline">Profili Düzenle</Link>
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold">
                        {typedUser.name ? typedUser.name.charAt(0).toUpperCase() : typedUser.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-medium">{typedUser.name || 'Kullanıcı'}</p>
                        <p className="text-gray-400 text-sm">{typedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                      <div className="flex items-center text-yellow-400">
                        <Coins className="w-6 h-6 mr-2" />
                        <span className="text-xl font-bold">{typedUser.jackPoints.toLocaleString()}</span>
                        <span className="ml-1 text-sm text-gray-300">JackPoints</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Son güncelleme: {formatDate(typedUser.lastUpdated)}</p>
                  </motion.div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                    <p className="mb-4">SlotJack dünyasına hoş geldiniz!</p>
                    <Link href="/giris" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-medium transition-colors mr-2">Giriş Yap</Link>
                    <Link href="/kayit" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-medium transition-colors">Kayıt Ol</Link>
                  </div>
                )}

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="bg-gray-800 rounded-lg p-6 shadow-lg"
                >
                  <h3 className="text-xl font-semibold mb-4">Hızlı İşlemler & Bonuslar</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => claimSocialBonus('Telegram')} 
                      className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-medium transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" /> Telegram Bonusu
                    </button>
                    <Link href="/market" className="block w-full text-center bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded font-medium transition-colors">
                      <Coins className="w-5 h-5 inline-block mr-2" /> JackPoint Market
                    </Link>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="bg-gray-800 rounded-lg p-6 shadow-lg"
                >
                  <h3 className="text-xl font-semibold mb-4">Son Hareketler</h3>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map(tx => <TransactionItem key={tx.id} transaction={tx} />)
                    ) : (
                      <p className="text-gray-400 text-sm">Henüz bir hareket yok.</p>
                    )}
                  </div>
                </motion.div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full"
                >
                  {(settings.banners || []).length > 0 ? (
                    <>
                      <div className="relative w-full h-48 md:h-64 bg-gray-900">
                        <Image 
                          src={(settings.banners || [])[currentSlide]?.imageUrl || '/placeholder-image.jpg'} 
                          alt={(settings.banners || [])[currentSlide]?.title || 'Banner'}
                          fill
                          priority
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 flex items-end p-4">
                        <h3 className="text-white text-lg md:text-xl font-bold">
                          {(settings.banners || [])[currentSlide]?.title || 'Banner'}
                        </h3>
                      </div>
                      
                      {(settings.banners || []).length > 1 && (
                        <>
                          <button 
                            onClick={prevSlide} 
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 transition-opacity"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={nextSlide} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 transition-opacity"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                            {(settings.banners || []).map((_, index) => (
                              <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-gray-400'} transition-colors`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-48 md:h-64 bg-gray-700 flex items-center justify-center">
                      <p className="text-gray-400">Henüz banner eklenmemiş</p>
                    </div>
                  )}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tabsConfig.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.title)}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab.title 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        {tab.title}
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#1A1F2B] rounded-lg p-6 shadow-lg min-h-[300px]">
                    {renderTabContent()}
                  </div>
                </motion.div>
                
                {/* Bonus Feature Cards */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="bg-gray-800 rounded-lg p-6 shadow-lg"
                >
                  <h3 className="text-xl font-semibold mb-4 text-center">Bonus Fırsatları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Kod Gir Card */}
                    <div className="bg-[#1A1F2B] rounded-lg shadow-lg overflow-hidden">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-center p-4">
                          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                            <div className="animate-pulse-subtle bg-yellow-500/10 p-2 rounded-full">
                              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="8" width="18" height="12" rx="2" fill="#FFDB80" />
                                <rect x="3" y="8" width="18" height="12" rx="2" stroke="#F85C5C" strokeWidth="1.5" />
                                <rect x="10.5" y="8" width="3" height="12" fill="#F85C5C" />
                                <path d="M12 8V4" stroke="#F85C5C" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M10 6H14" stroke="#F85C5C" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M8 8C8 5.8 9.6 4 12 4" stroke="#F85C5C" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M16 8C16 5.8 14.4 4 12 4" stroke="#F85C5C" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 text-center px-4 pb-2">
                          <h3 className="text-lg font-bold text-white">Kod Gir</h3>
                          <p className="text-sm text-gray-300 mb-4">Canlı Yayında Paylaşılan Kodu Gir</p>
                        </div>
                        <div className="px-4 pb-4">
                          <button 
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition-colors" 
                            onClick={() => setShowCodeModal(true)}
                          >
                            Kodu Gir
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Çark Çevir Card */}
                    <div className="bg-[#1A1F2B] rounded-lg shadow-lg overflow-hidden">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-center p-4">
                          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                            <div className="animate-spin-slow bg-green-500/10 p-2 rounded-full">
                              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="9" stroke="#F9A826" strokeWidth="2" />
                                <circle cx="12" cy="12" r="6" fill="#F9A826" fillOpacity="0.2" />
                                <rect x="11" y="3" width="2" height="4" fill="#4CAF50" />
                                <rect x="11" y="17" width="2" height="4" fill="#F44336" />
                                <rect x="17" y="11" width="4" height="2" fill="#2196F3" />
                                <rect x="3" y="11" width="4" height="2" fill="#FF9800" />
                                <circle cx="12" cy="12" r="2" fill="white" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 text-center px-4 pb-2">
                          <h3 className="text-lg font-bold text-white">Çark Çevir</h3>
                          <p className="text-sm text-gray-300 mb-4">Günlük çarkını çevir</p>
                        </div>
                        <div className="px-4 pb-4">
                          <Link
                            href="/cark-cevir"
                            className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition-colors"
                          >
                            Çarkı Çevir
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Günlük Puan Card */}
                    <div className="bg-[#1A1F2B] rounded-lg shadow-lg overflow-hidden">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-center p-4">
                          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                            <div className="animate-float bg-blue-500/10 p-2 rounded-full">
                              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L17 12H15L15 19C15 19.5523 14.5523 20 14 20H10C9.44772 20 9 19.5523 9 19L9 12H7L12 4Z" fill="#FF5E5E" />
                                <path d="M12 4L17 12H15L15 19C15 19.5523 14.5523 20 14 20H10C9.44772 20 9 19.5523 9 19L9 12H7L12 4Z" stroke="#FF5E5E" strokeWidth="0.5" />
                                <circle cx="12" cy="10" r="2" fill="#30A9DE" />
                                <circle cx="12" cy="10" r="2" stroke="#30A9DE" strokeWidth="0.5" />
                                <path d="M10 20.5C10 21.5 12 23 12 23C12 23 14 21.5 14 20.5C14 19.5 13.1046 19 12 19C10.8954 19 10 19.5 10 20.5Z" fill="#FFC15E" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 text-center px-4 pb-2">
                          <h3 className="text-lg font-bold text-white">Günlük Puan</h3>
                          <p className="text-sm text-gray-300 mb-1">Günlük giriş puanınızı alın</p>
                          {dailyBonusTimeRemaining && (
                            <div className="bg-gray-700/50 rounded-md py-1 px-2 mb-2">
                              <p className="text-sm text-orange-300 flex items-center justify-center">
                                <Clock className="w-3 h-3 mr-1" /> 
                                <span>Sonraki: {dailyBonusTimeRemaining}</span>
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="px-4 pb-4">
                          <button 
                            className={`w-full ${canClaimDailyBonus 
                              ? 'bg-orange-500 hover:bg-orange-600' 
                              : 'bg-gray-600 cursor-not-allowed'} 
                              text-white font-bold py-3 px-4 rounded-md transition-colors`}
                            onClick={claimDailyBonus}
                            disabled={!canClaimDailyBonus}
                          >
                            {canClaimDailyBonus ? 'Puanı Al' : 'Alındı'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-gray-800 rounded-lg p-6 shadow-lg"
                >
                    <h3 className="text-xl font-semibold mb-4 text-center">Bizi Takip Edin!</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                      {socialPlatforms.map((platform: SocialPlatform) => (
                        <a 
                          key={platform.id} 
                          href={platform.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`flex flex-col items-center justify-center w-20 h-20 ${platform.color} text-white rounded-lg hover:opacity-80 transition-opacity`}
                        >
                          <span className="text-3xl font-bold">{platform.icon}</span>
                          <span className="text-xs mt-1">{platform.name}</span>
                        </a>
                      ))}
                    </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Code Redemption Modal */}
          {showCodeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative">
                <button 
                  onClick={() => setShowCodeModal(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-bold mb-4">Kodu Giriniz</h2>
                
                <div className="mb-4">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder="Kod Yazınız"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center uppercase"
                    disabled={isProcessingCode}
                  />
                </div>
                
                <button
                  onClick={handleCodeSubmit}
                  disabled={!codeInput.trim() || isProcessingCode}
                  className={`w-full rounded-lg py-3 font-bold ${
                    !codeInput.trim() || isProcessingCode
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {isProcessingCode ? 'İşleniyor...' : 'Kodu Gir'}
                </button>
              </div>
            </div>
          )}
        </ClientLayout>
      )}
    </>
  );
}

