'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, BarChart2, Trophy, Gift, Calendar, ShoppingBag, Ticket, MessageSquare, LogOut, Coins, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { UserRank } from '@/types/user';
import LivestreamBanner from './LivestreamBanner';
import { useSiteSettings } from './SiteSettingsProvider';
import Navigation from './layout/Navigation';
import UserProfileHeader from './UserProfileHeader';

function HeaderContent() {
  const { user, signOut, navigate } = useAuth();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      
      // Clear all possible storage locations
      const keysToRemove = [
        'slotjack_user',
        'slotjack_browser_id',
        'slotjack_last_login'
      ];
      
      // Clear localStorage
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error(`Error removing ${key} from localStorage:`, e);
        }
      });
      
      // Clear sessionStorage
      keysToRemove.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (e) {
          console.error(`Error removing ${key} from sessionStorage:`, e);
        }
      });
      
      // Clear auth cookie
      document.cookie = 'slotjack_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Use a small timeout to ensure state updates have time to process
      setTimeout(() => {
        // Force hard navigation on logout for complete page refresh
        window.location.href = '/giris?logged_out=true';
      }, 300);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      // Even if there's an error, still try to redirect
      window.location.href = '/giris?error=true';
    }
  };
  
  // Direct navigation helper that bypasses Next.js router
  const directNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <header className="bg-[#1A1A1A] py-4 px-6 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center">
        {/* On mobile, replace logo with spacer to accommodate menu button */}
        {isMobile ? (
          <div className="w-8"></div> 
        ) : (
          <button onClick={() => directNavigate('/')} className="text-2xl font-bold" style={{ color: settings.primaryColor }}>
            {settings.siteName}
          </button>
        )}
      </div>
      <div>
        {!isMobile && user ? (
          <UserProfileHeader />
        ) : isMobile && user ? (
          <div className="flex items-center">
            <span className="text-sm text-gray-300 mr-2 truncate max-w-[150px]">{user.name || user.email}</span>
            <span className="px-2 py-1 bg-[#FF6B00] text-white text-xs rounded-full">
              {user.jackPoints} JP
            </span>
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => directNavigate('/kayit')} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base">
              Kayıt Ol
            </button>
            <button onClick={() => directNavigate('/giris')} className="text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base" style={{ backgroundColor: settings.primaryColor }}>
              Giriş Yap
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default function ClientLayout({
  children,
  showLivestream = true
}: {
  children: React.ReactNode;
  showLivestream?: boolean;
}) {
  const { user, loading, navigate } = useAuth();
  const { settings } = useSiteSettings();
  const [isMounted, setIsMounted] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/');
  const [isNavigating, setIsNavigating] = useState(false);
  const [stableRender, setStableRender] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check for mobile menu open state from Navigation component
  useEffect(() => {
    const handleMenuToggle = (e: CustomEvent) => {
      setIsMobileMenuOpen(e.detail.isOpen);
    };
    
    window.addEventListener('mobileMenuToggle' as any, handleMenuToggle);
    
    return () => {
      window.removeEventListener('mobileMenuToggle' as any, handleMenuToggle);
    };
  }, []);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Add a safety timeout to prevent infinite loading
    const safetyTimer = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout triggered - resetting loading state');
        // Force reset loading state if it's been too long
        // syncUserData();
      }
    }, 5000); // 5 second safety timeout
    
    // Set initial active route
    if (typeof window !== 'undefined') {
      setActiveRoute(window.location.pathname);
      
      // No longer needed with JWT authentication
      // syncUserData();
      
      // No longer needed with JWT authentication
      // setTimeout(() => {
      //   if (typeof auth.shareCookiesForCrossBrowserAccess === 'function') {
      //     console.log('Sharing cookies from ClientLayout');
      //     auth.shareCookiesForCrossBrowserAccess();
      //   }
      // }, 100);
      
      // Look for any credentials in cookies as a fallback recovery method
      if (!user && !loading) {
        try {
          console.log('No user found, checking for JWT token...');
          
          // Check for JWT token in localStorage
          const token = localStorage.getItem('slotjack_auth_token');
          if (token) {
            console.log('Found JWT token, attempting to restore session');
            // The auth context will handle the rest during initialization
          }
        } catch (e) {
          console.error('Error checking for auth data:', e);
        }
      }
    }
    
    return () => {
      clearTimeout(safetyTimer);
    };
  }, []);
  
  // Add stabilization effect to prevent flickering
  useEffect(() => {
    if (isMounted) {
      // Short delay to ensure fonts and styles are properly loaded
      const timer = setTimeout(() => {
        setStableRender(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);
  
  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (path === activeRoute) return;
    
    setIsNavigating(true);
    setActiveRoute(path);
    
    setTimeout(() => {
      navigate(path);
      setTimeout(() => {
        setIsNavigating(false);
      }, 300);
    }, 100);
  };
  
  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Add GPU acceleration to prevent text flickering */}
      <style jsx global>{`
        * {
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        /* Fix flickering text in Webkit/Chrome browsers */
        .main-content {
          backface-visibility: hidden;
          transform: translateZ(0);
        }
        @media (max-width: 767px) {
          body {
            overflow-x: hidden;
          }
        }
      `}</style>
      
      <Navigation />
      
      <HeaderContent />
      
      {/* Livestream banner */}
      {showLivestream && <LivestreamBanner />}
      
      <div className="flex-grow flex">
        <main 
          className={`flex-grow main-content transition-all duration-300 
                     md:pl-60 ${stableRender ? 'opacity-100' : 'opacity-98'} transition-opacity duration-150
                     ${isMobileMenuOpen ? 'blur-sm md:blur-none' : ''}`}
        >
          {isNavigating ? (
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg">Yükleniyor...</p>
              </div>
            </div>
          ) : (
            <div className="p-4 md:p-6">
              {children}
            </div>
          )}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#121212] py-4 px-6 text-center text-gray-400 text-sm">
        {settings.footerText}
      </footer>
    </div>
  );
} 