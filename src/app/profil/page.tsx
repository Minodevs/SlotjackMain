'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Lock, CreditCard, History, Upload, ArrowRight, Check, X, Eye, EyeOff, Coins, Shield, AlertTriangle, Phone, ShoppingBag, RefreshCcw, Key, Mail, UserCircle, MailCheck, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientLayout from '@/components/ClientLayout';

// Define Message type
interface Message {
  type: 'success' | 'error';
  text: string;
}

const tabs = [
  { id: 'profile', label: 'Profil Bilgileri', icon: <User className="w-5 h-5" /> },
  { id: 'verify', label: 'Hesap Bilgileri', icon: <Shield className="w-5 h-5" /> },
  { id: 'password', label: 'Şifre Değiştir', icon: <Lock className="w-5 h-5" /> },
  { id: 'coins', label: 'Coin Bakiyem', icon: <Coins className="w-5 h-5" /> },
  { id: 'transactions', label: 'İşlem Geçmişi', icon: <History className="w-5 h-5" /> },
  { id: 'sponsorlar', label: 'Sponsorlar', icon: <ShoppingBag className="w-5 h-5" /> },
];

// Social media platforms for verification
const socialPlatforms = [
  { id: 'telegram', name: 'Telegram', icon: '/icons/telegram.svg', color: '#0088cc' },
  { id: 'kick', name: 'Kick', icon: '/icons/kick.svg', color: '#53FC18' },
  { id: 'youtube', name: 'Youtube', icon: '/icons/youtube.svg', color: '#FF0000' },
  { id: 'twitch', name: 'Twitch', icon: '/icons/twitch.svg', color: '#6441A4' },
  { id: 'twitter', name: 'Twitter', icon: '/icons/twitter.svg', color: '#1DA1F2' },
  { id: 'instagram', name: 'Instagram', icon: '/icons/instagram.svg', color: '#C13584' },
  { id: 'discord', name: 'Discord', icon: '/icons/discord.svg', color: '#5865F2' },
];

// Country codes for phone verification
const countryCodes = [
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
];

// Types for sponsor entries
interface SponsorEntry {
  name: string;
  logo: string;
  username: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateJackPoints, getRecentTransactions, updateProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [socialAccounts, setSocialAccounts] = useState<Record<string, string>>({});
  
  // Phone number states
  const [selectedCountryCode, setSelectedCountryCode] = useState('+90');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [sponsorEntries, setSponsorEntries] = useState<SponsorEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect non-authenticated users to login
      router.push('/giris');
    } else if (user) {
      setName(user.name || '');
      // Initialize social accounts from user data if available
      if (user.socialAccounts) {
        setSocialAccounts(user.socialAccounts);
      } else {
        // If no social accounts exist in user data, initialize with empty object
        const storedAccounts = localStorage.getItem('user_social_accounts');
        if (storedAccounts) {
          setSocialAccounts(JSON.parse(storedAccounts));
        }
      }
      
      // Set phone number if exists
      if (user.phoneNumber) {
        // Extract the country code and number
        const phoneStr = user.phoneNumber;
        for (const country of countryCodes) {
          if (phoneStr.startsWith(country.code)) {
            setSelectedCountryCode(country.code);
            setPhoneNumber(phoneStr.substring(country.code.length).trim());
            break;
          }
        }
      }

      setIsLoading(false);
      
      // Load saved sponsor entries from localStorage
      const savedEntries = localStorage.getItem('user_sponsor_entries');
      if (savedEntries) {
        try {
          setSponsorEntries(JSON.parse(savedEntries));
        } catch (e) {
          console.error('Error parsing saved sponsor entries:', e);
          // Initialize with default sponsors if there's an error
          initializeDefaultSponsors();
        }
      } else {
        // Initialize with default sponsors if none exist
        initializeDefaultSponsors();
      }
    }
  }, [user, loading, router]);

  // Update avatar preview when file is selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAvatarPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle name update using the AuthContext
  const handleNameUpdate = async () => {
    // Reset any previous messages
    setMessage(null);
    setIsUpdating(true);
    
    try {
      const success = await updateProfile({ name: name });
      
      if (success) {
        setMessage({ type: 'success', text: 'İsminiz başarıyla güncellendi!' });
      } else {
        setMessage({ type: 'error', text: 'İsim güncellenemedi. Lütfen tekrar deneyin.' });
      }
    } catch (error) {
      console.error("Name update error:", error);
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsUpdating(false);
      
      // Clear message after a delay
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  // Handle avatar update using the AuthContext
  const handleAvatarUpdate = async () => {
    if (!avatarFile) return;
    
    // Reset any previous messages
    setMessage(null);
    setIsUpdating(true);
    
    try {
      // Read file as data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        try {
          const success = await updateProfile({ avatar: base64data });
          
          if (success) {
            setMessage({ type: 'success', text: 'Profil resminiz başarıyla güncellendi!' });
            setAvatarFile(null);
          } else {
            setMessage({ type: 'error', text: 'Profil resmi güncellenemedi. Lütfen tekrar deneyin.' });
          }
        } catch (error) {
          console.error("Avatar update error:", error);
          setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
        } finally {
          setIsUpdating(false);
        }
      };
      reader.readAsDataURL(avatarFile);
    } catch (error) {
      console.error("Avatar read error:", error);
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
      setIsUpdating(false);
    }
  };

  // Format transaction date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get transaction color based on type
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn': return 'text-green-400';
      case 'spend': return 'text-red-400';
      case 'bonus': return 'text-yellow-400';
      case 'event': return 'text-blue-400';
      case 'admin': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  // Handle refresh functionality
  const handleRefresh = () => {
    // Force sync user data
    if (user) {
      // Get fresh user data from localStorage
      const storedUser = localStorage.getItem('slotjack_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // Update state with fresh data
          setName(userData.name || '');
          setSocialAccounts(userData.socialAccounts || {});
          
          // Update phone number
          if (userData.phoneNumber) {
            // Extract the country code and number
            const phoneStr = userData.phoneNumber;
            for (const country of countryCodes) {
              if (phoneStr.startsWith(country.code)) {
                setSelectedCountryCode(country.code);
                setPhoneNumber(phoneStr.substring(country.code.length).trim());
                break;
              }
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  };

  // Handle social account update
  const handleSocialAccountUpdate = (platform: string) => {
    // Get the username for this platform
    const username = socialAccounts[platform] || '';
    
    if (!username.trim()) {
      setMessage({ type: 'error', text: `Lütfen ${platform} kullanıcı adınızı girin.` });
      return;
    }
    
    try {
      // Update local state
      const updatedSocialAccounts = {
        ...socialAccounts,
        [platform]: username,
        [`${platform}_verified`]: 'true' // Mark as verified automatically
      };
      
      setSocialAccounts(updatedSocialAccounts);
      
      // Update user profile with social accounts
      updateProfile({ socialAccounts: updatedSocialAccounts });
      
      // Sync to admin panel format for immediate visibility
      const registeredUsersStr = localStorage.getItem('slotjack_registered_users');
      if (registeredUsersStr && user) {
        const registeredUsers = JSON.parse(registeredUsersStr);
        if (user.email && registeredUsers[user.email]) {
          if (!registeredUsers[user.email].socialVerifications) {
            registeredUsers[user.email].socialVerifications = {};
          }
          
          registeredUsers[user.email].socialVerifications[platform] = {
            platform,
            isVerified: true,
            username: username,
            verifiedAt: Date.now()
          };
          
          localStorage.setItem('slotjack_registered_users', JSON.stringify(registeredUsers));
          
          // Trigger storage event for other tabs
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'slotjack_registered_users',
            newValue: JSON.stringify(registeredUsers)
          }));
        }
      }
      
      setMessage({ type: 'success', text: `${platform} hesabınız başarıyla kaydedildi!` });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    }
  };

  // Handle password update using the AuthContext
  const handlePasswordChange = async () => {
    // Reset any previous messages
    setMessage(null);
    setIsUpdating(true);
    
    // Validate inputs
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Mevcut şifrenizi girmelisiniz.' });
      return;
    }
    
    if (!newPassword) {
      setMessage({ type: 'error', text: 'Yeni şifre gereklidir.' });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Şifre en az 6 karakter uzunluğunda olmalıdır.' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }
    
    try {
      const success = await updatePassword(currentPassword, newPassword);
      
      if (success) {
        setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi!' });
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: 'Şifre güncellenemedi. Lütfen mevcut şifrenizi kontrol edin.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsUpdating(false);
      
      // Clear the message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  // Handle phone number update
  const handlePhoneNumberUpdate = async () => {
    setIsUpdating(true);
    try {
      let fullPhoneNumber = '';
      let shouldSave = true;
      
      if (phoneNumber.trim()) {
        // Basic validation for phone number format
        const phoneRegex = /^\d{6,15}$/;
        if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
          setMessage({ type: 'error', text: 'Geçerli bir telefon numarası giriniz.' });
          return;
        }
        
        fullPhoneNumber = `${selectedCountryCode}${phoneNumber.replace(/\s+/g, '')}`;
      } else {
        // If phone field is empty, check if we should clear existing number
        if (user?.phoneNumber) {
          // Confirm with user
          if (window.confirm('Telefon numaranızı silmek istediğinizden emin misiniz?')) {
            fullPhoneNumber = ''; // Clear phone number
          } else {
            shouldSave = false; // Skip saving if user cancels
          }
        } else {
          setMessage({ type: 'error', text: 'Lütfen telefon numaranızı girin.' });
          return;
        }
      }
      
      if (shouldSave) {
        // Update user profile with phone number directly
        const success = await updateProfile({ 
          phoneNumber: fullPhoneNumber,
          phoneVerified: fullPhoneNumber ? true : false // Mark as verified automatically if there is a number
        });
        
        if (success) {
          if (fullPhoneNumber) {
            setMessage({ type: 'success', text: 'Telefon numaranız başarıyla kaydedildi!' });
          } else {
            setMessage({ type: 'success', text: 'Telefon numaranız silindi!' });
            setPhoneNumber(''); // Clear input field
          }
        } else {
          setMessage({ type: 'error', text: 'Telefon numarası güncellenemedi. Lütfen tekrar deneyin.' });
        }
      }
    } catch (error) {
      console.error("Phone update error:", error);
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Initialize default sponsors list
  const initializeDefaultSponsors = () => {
    const defaultSponsors: SponsorEntry[] = [
      { name: 'Sportsbet', logo: '/user-sponsortab/sportsbet.png', username: '' },
      { name: 'Moldebet', logo: '/user-sponsortab/moldebet.png', username: '' },
      { name: 'İsisbet', logo: '/user-sponsortab/isisbet.png', username: '' },
      { name: 'Napolibet', logo: '/user-sponsortab/napolibet.png', username: '' },
      { name: 'Gambi', logo: '/user-sponsortab/gambi.png', username: '' },
      { name: 'Siribet', logo: '/user-sponsortab/siribet.png', username: '' },
      { name: 'Efesbet', logo: '/user-sponsortab/efesbet.png', username: '' },
      { name: 'Baywin', logo: '/user-sponsortab/baywin.png', username: '' },
      { name: 'Zlot', logo: '/user-sponsortab/zlot.png', username: '' },
      { name: 'Getirbet', logo: '/user-sponsortab/getirbet.png', username: '' },
      { name: 'Maltcasino', logo: '/user-sponsortab/maltcasino.png', username: '' },
      { name: 'Asyabahis', logo: '/user-sponsortab/asyabahis.png', username: '' },
      { name: 'Dumanbet', logo: '/user-sponsortab/dumanbet.png', username: '' },
      { name: 'Wslot', logo: '/user-sponsortab/wslot.png', username: '' },
      { name: 'Betnano', logo: '/user-sponsortab/betnano.png', username: '' },
      { name: 'Darkbet', logo: '/user-sponsortab/darkbet.png', username: '' },
      { name: 'Vegasslot', logo: '/user-sponsortab/vegasslot.png', username: '' },
      { name: 'Betoffice', logo: '/user-sponsortab/betoffice.png', username: '' },
      { name: 'Galabet', logo: '/user-sponsortab/galabet.png', username: '' },
      { name: 'Risebet', logo: '/user-sponsortab/risebet.png', username: '' },
      { name: 'Bullbahis', logo: '/user-sponsortab/bullbahis.png', username: '' },
      { name: 'Etorobet', logo: '/user-sponsortab/etorobet.png', username: '' },
      { name: 'Sterlinbet', logo: '/user-sponsortab/sterlinbet.png', username: '' },
      { name: 'Esbet', logo: '/user-sponsortab/esbet.png', username: '' },
    ];

    setSponsorEntries(defaultSponsors);
  };
  
  // Handle sponsor username changes
  const handleSponsorUsernameChange = (index: number, value: string) => {
    const updatedEntries = [...sponsorEntries];
    updatedEntries[index].username = value;
    setSponsorEntries(updatedEntries);
  };
  
  // Save sponsor entries
  const handleSaveSponsors = () => {
    setIsSaving(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('user_sponsor_entries', JSON.stringify(sponsorEntries));
      
      // In a real app, you would also save to a backend:
      // await fetch('/api/user/sponsors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(sponsorEntries),
      // });
      
      // Show success message or handle UI feedback
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving sponsor entries:', error);
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Kullanıcı Kontrol Paneli</h1>
          <button 
            onClick={handleRefresh}
            disabled={isUpdating}
            className={`flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <RefreshCcw size={16} className={`${isUpdating ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
         
        {/* Message display */}
        {message && (
          <div className={`p-4 mb-6 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
            {message.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <X className="w-5 h-5 mr-2" />}
            <p>{message.text}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 bg-gray-800 p-5 rounded-xl h-fit">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                Profil Bilgileri
              </button>
              <button
                onClick={() => setActiveTab('verify')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'verify' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                Doğrulama
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'password' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                Şifre Değiştir
              </button>
              <button
                onClick={() => setActiveTab('coins')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'coins' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                Coin Bakiyem
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'transactions' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                İşlem Geçmişi
              </button>
              <button
                onClick={() => setActiveTab('sponsorlar')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'sponsorlar' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                Sponsorlar
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3 bg-gray-800 rounded-lg p-6">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Profil Bilgileri</h2>
                
                {/* Avatar Section */}
                <div className="mb-8">
                  <h3 className="font-medium mb-4">Profil Resmi</h3>
                  <div className="flex items-center">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-700 mr-6">
                      {avatarPreview ? (
                        <Image src={avatarPreview} alt="Avatar preview" fill style={{ objectFit: 'cover' }} />
                      ) : user?.avatar ? (
                        <Image src={user.avatar} alt="User avatar" fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-600">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isUpdating}
                        className={`flex items-center bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 mb-2 ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Resim Seç
                      </button>
                      {avatarFile && (
                        <button 
                          onClick={handleAvatarUpdate}
                          disabled={isUpdating}
                          className={`flex items-center bg-[#FF6B00] hover:bg-[#E05A00] rounded-lg px-4 py-2 ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isUpdating ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Resmi Güncelle
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Name Section */}
                <div className="mb-8">
                  <h3 className="font-medium mb-4">Kullanıcı Adı</h3>
                  <div className="max-w-md">
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Kullanıcı Adı" 
                      className="w-full bg-gray-700 rounded-lg px-4 py-3 mb-3"
                      disabled={isUpdating}
                    />
                    <button 
                      onClick={handleNameUpdate}
                      disabled={isUpdating}
                      className={`flex items-center bg-[#FF6B00] hover:bg-[#E05A00] rounded-lg px-4 py-2 ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Bilgileri Güncelle
                    </button>
                  </div>
                </div>
                
                {/* Account Info */}
                <div>
                  <h3 className="font-medium mb-4">Hesap Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">E-posta</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Kayıt Tarihi</p>
                      <p className="font-medium">{formatDate(user.lastUpdated || Date.now())}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">JackCoin Bakiyesi</p>
                      <p className="font-medium text-[#FF6B00]">{user.jackPoints} JackCoin</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Toplam İşlem</p>
                      <p className="font-medium">{user.transactions?.length || 0} işlem</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Verification Tab */}
            {activeTab === 'verify' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Hesap Bilgileri</h2>
                
                <div className="bg-gray-750 border border-gray-700 rounded-lg p-5 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="text-[#FF6B00] w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">Bilgilerinizi Tamamlayın</h3>
                      <p className="text-gray-400 text-sm">Sizinle iletişime geçebilmemiz adına öncelikli olarak Telefon, Telegram, Twitter ve Instagram bilgilerinizi doldurunuz.</p>
                    </div>
                  </div>
                </div>
                
                {/* Phone Verification Section */}
                <div className="bg-gray-750 border border-gray-700 rounded-lg p-5 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                      <Phone className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="font-medium">Telefon Numarası</span>
                    {user?.phoneNumber && (
                      <span className="ml-auto bg-green-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                        <Check className="w-3 h-3 mr-1" /> Kaydedildi
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Telefon Numaranız</label>
                    <div className="flex">
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="bg-gray-700 rounded-l-lg px-3 py-2 flex items-center min-w-[90px]"
                        >
                          {countryCodes.find(c => c.code === selectedCountryCode)?.flag} {selectedCountryCode}
                          <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${showCountryDropdown ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {showCountryDropdown && (
                          <div className="absolute z-10 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-64 max-h-60 overflow-y-auto">
                            {countryCodes.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-gray-700 flex items-center"
                                onClick={() => {
                                  setSelectedCountryCode(country.code);
                                  setShowCountryDropdown(false);
                                }}
                              >
                                <span className="mr-2">{country.flag}</span>
                                <span>{country.country}</span>
                                <span className="ml-2 text-gray-400">{country.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-grow bg-gray-700 rounded-r-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5XX XXX XXXX"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePhoneNumberUpdate}
                    className="flex items-center bg-[#FF6B00] hover:bg-[#E05A00] rounded-lg px-4 py-2 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Numarayı Kaydet
                  </button>
                  
                  {user?.phoneNumber && (
                    <div className="mt-3 bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-300">
                        <span className="text-green-400 mr-2">✓</span>
                        Kayıtlı telefon numaranız: {user.phoneNumber}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Social Media Verification Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {socialPlatforms.map(platform => {
                    const isVerified = socialAccounts[`${platform.id}_verified`] === 'true';
                    
                    return (
                      <div key={platform.id} className="bg-gray-750 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                            <img 
                              src={platform.icon} 
                              alt={platform.name} 
                              className="w-6 h-6"
                              onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-icon.svg';
                              }} 
                            />
                          </div>
                          <span className="font-medium">{platform.name}</span>
                          {isVerified && (
                            <span className="ml-auto bg-green-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                              <Check className="w-3 h-3 mr-1" /> Kaydedildi
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="text"
                            placeholder={`${platform.name} Kullanıcı Adınız`}
                            className="flex-grow bg-gray-700 rounded-lg px-3 py-2 text-sm"
                            value={socialAccounts[platform.id] || ''}
                            onChange={(e) => setSocialAccounts({...socialAccounts, [platform.id]: e.target.value})}
                            disabled={isVerified}
                          />
                          <button
                            onClick={() => handleSocialAccountUpdate(platform.id)}
                            className={`ml-2 text-white text-sm font-medium px-3 py-2 rounded ${
                              isVerified ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#FF6B00] hover:bg-opacity-90'
                            }`}
                            disabled={isVerified}
                          >
                            {isVerified ? 'Kaydedildi' : 'Kaydet'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Password Change Tab */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Şifre Değiştir</h2>
                <div className="max-w-md">
                  <div className="mb-4">
                    <label className="block mb-2">Mevcut Şifre</label>
                    <div className="relative">
                      <input 
                        type={showCurrentPassword ? "text" : "password"} 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-gray-700 rounded-lg px-4 py-3 pr-12" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block mb-2">Yeni Şifre</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-gray-700 rounded-lg px-4 py-3 pr-12" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Şifre en az 6 karakter uzunluğunda olmalıdır.</p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block mb-2">Yeni Şifre (Tekrar)</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-700 rounded-lg px-4 py-3" 
                    />
                  </div>
                  
                  <button 
                    onClick={handlePasswordChange}
                    className="flex items-center bg-[#FF6B00] hover:bg-[#E05A00] rounded-lg px-6 py-3"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Şifreyi Değiştir
                  </button>
                </div>
              </div>
            )}
            
            {/* Coin Balance Tab */}
            {activeTab === 'coins' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Coin Bakiyem</h2>
                
                <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D] rounded-lg p-6 mb-8">
                  <div className="mb-3 text-black text-sm">Toplam Bakiye</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {user.jackPoints} <span className="text-black">JackCoin</span>
                  </div>
                  <div className="text-sm text-black">
                    Son 7 günde {user.transactions?.filter(t => 
                      t.type === 'earn' && t.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
                    ).reduce((sum, t) => sum + t.amount, 0) || 0} JackCoin kazandınız.
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-700 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Günlük Bonus</h3>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm">
                        Topla
                      </button>
                    </div>
                    <p className="text-sm text-gray-400">Her gün giriş yaparak 50 JackCoin kazanabilirsiniz.</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Etkinliklere Katılım</h3>
                      <span className="text-[#FF6B00] font-medium">+100 JackCoin</span>
                    </div>
                    <p className="text-sm text-gray-400">Canlı yayın ve etkinliklere katılarak coin kazanabilirsiniz.</p>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-medium mb-4">Coin Kazanma Yolları</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Günlük Giriş Bonusu</p>
                        <p className="text-sm text-gray-400">Her gün siteye giriş yaparak 50 JackCoin kazanın.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Sosyal Medya Etkileşimleri</p>
                        <p className="text-sm text-gray-400">Sosyal medya hesaplarımızı takip ederek bonus coinler kazanın.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Etkinliklere Katılım</p>
                        <p className="text-sm text-gray-400">Canlı yayınlara ve etkinliklerimize katılarak ekstra coinler kazanın.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Turnuvalarda Başarı</p>
                        <p className="text-sm text-gray-400">Turnuvalarda başarılı olarak yüksek miktarda coin ödülleri kazanın.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Transaction History Tab */}
            {activeTab === 'transactions' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">İşlem Geçmişi</h2>
                
                {user.transactions && user.transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="text-left text-gray-400 border-b border-gray-700">
                        <tr>
                          <th className="pb-3 font-medium">İşlem</th>
                          <th className="pb-3 font-medium">Miktar</th>
                          <th className="pb-3 font-medium">Tarih</th>
                          <th className="pb-3 font-medium">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.transactions.sort((a, b) => b.timestamp - a.timestamp).map((transaction, index) => (
                          <tr key={index} className="border-b border-gray-700">
                            <td className="py-4">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                  transaction.type === 'earn' ? 'bg-green-900/50' : 
                                  transaction.type === 'spend' ? 'bg-red-900/50' :
                                  transaction.type === 'bonus' ? 'bg-yellow-900/50' :
                                  transaction.type === 'event' ? 'bg-blue-900/50' : 'bg-purple-900/50'
                                }`}>
                                  {transaction.type === 'earn' && <ArrowRight className="w-4 h-4 text-green-400" />}
                                  {transaction.type === 'spend' && <ArrowRight className="w-4 h-4 text-red-400 transform rotate-180" />}
                                  {transaction.type === 'bonus' && <Coins className="w-4 h-4 text-yellow-400" />}
                                  {transaction.type === 'event' && <User className="w-4 h-4 text-blue-400" />}
                                  {transaction.type === 'admin' && <Lock className="w-4 h-4 text-purple-400" />}
                                </div>
                                <div>
                                  <p className="font-medium">{transaction.description || '-'}</p>
                                  <p className="text-sm text-gray-400">{'-'}</p>
                                </div>
                              </div>
                            </td>
                            <td className={`py-4 ${getTransactionColor(transaction.type)}`}>
                              {transaction.type === 'earn' || transaction.type === 'bonus' ? '+' : '-'}{transaction.amount} JackCoin
                            </td>
                            <td className="py-4 text-gray-400">{formatDate(transaction.timestamp)}</td>
                            <td className="py-4">
                              <span className="px-2 py-1 rounded bg-green-900/30 text-green-400 text-xs">
                                Tamamlandı
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-700 rounded-lg">
                    <History className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-lg">Henüz işlem bulunmuyor</p>
                    <p className="text-sm text-gray-400 mt-1">Coin kazanmaya başladığınızda, işlemleriniz burada görünecek.</p>
                  </div>
                )}
              </div>
            )}

            {/* Sponsors Tab */}
            {activeTab === 'sponsorlar' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Sponsorlar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sponsorEntries && sponsorEntries.map((sponsor, index) => (
                    <div key={index} className="bg-[#0F1118] rounded-lg p-4 border border-gray-800">
                      <div className="h-12 flex items-center justify-center mb-3">
                        <img 
                          src={sponsor.logo} 
                          alt={sponsor.name} 
                          className="max-h-full object-contain" 
                          onError={(e) => {
                            // If image fails to load, show a placeholder
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120x40/333/888?text=Logo';
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Üye ID veya kullanıcı adınız"
                        value={sponsor.username}
                        onChange={(e) => handleSponsorUsernameChange(index, e.target.value)}
                        className="w-full bg-[#232631] text-gray-200 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveSponsors}
                    disabled={isSaving}
                    className="bg-[#FF7A00] hover:bg-[#FF9633] text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Kaydediliyor...
                      </>
                    ) : (
                      'Kaydet'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 