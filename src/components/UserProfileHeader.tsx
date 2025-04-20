'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { MessageSquare, ChevronDown, LogOut } from 'lucide-react';
import ChatPanel from './ChatPanel';

export default function UserProfileHeader() {
  const { user, signOut } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
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
  
  if (!user) {
    return null; // Don't render anything if user is not logged in
  }
  
  // Access properties safely without type casting
  const username = user.name || user.email.split('@')[0];
  const balance = user.jackPoints.toLocaleString();
  const avatar = user.avatar;

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadCount(0); // Clear unread count when opening chat
    }
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
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
      
      // Force hard navigation on logout
      window.location.href = '/giris?logged_out=true';
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      // Even if there's an error, still try to redirect
      window.location.href = '/giris?error=true';
    }
  };

  // Add a custom event for user login state changes
  useEffect(() => {
    if (user) {
      // Dispatch a custom event when a user logs in
      const event = new CustomEvent('userLoginStateChanged', {
        detail: { isLoggedIn: true, userId: user.id }
      });
      window.dispatchEvent(event);
    }
  }, [user]);

  // For very small screens, render a simplified header
  if (isMobile) {
    return (
      <div className="flex items-center space-x-1">
        {/* Compact balance display */}
        <div className="bg-[#FF7A00] text-white px-2 py-1 rounded-md flex items-center text-sm">
          <span className="font-semibold">{balance}</span>
          <div className="w-4 h-4 ml-1 bg-black rounded-full flex items-center justify-center">
            <span className="text-[8px] font-bold">₺</span>
          </div>
        </div>
        
        {/* User info with dropdown */}
        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className="flex items-center bg-[#272A31] hover:bg-[#2F3238] text-white px-1.5 py-1 rounded-md transition-colors"
            aria-label="User menu"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 relative">
              {avatar ? (
                <Image 
                  src={avatar} 
                  alt={username} 
                  width={20} 
                  height={20}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600">
                  <span className="text-xs font-bold">{username.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-[#1A1F2B] border border-gray-800 rounded-md shadow-lg z-50">
              <div className="py-1">
                <div className="px-3 py-1 text-xs text-gray-400 truncate border-b border-gray-800">
                  {user.email}
                </div>
                <a href="/profil" className="block px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800">
                  Profilim
                </a>
                <a href="/settings" className="block px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800">
                  Ayarlar
                </a>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-gray-800 flex items-center"
                >
                  <LogOut size={14} className="mr-1.5" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Balance display */}
        <div className="bg-[#FF7A00] text-white px-3 py-1.5 rounded-md flex items-center">
          <span className="font-semibold">{balance}</span>
          <div className="w-5 h-5 ml-1.5 bg-black rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold">₺</span>
          </div>
        </div>
        
        {/* User info with dropdown */}
        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className="flex items-center space-x-1 bg-[#272A31] hover:bg-[#2F3238] text-white px-2 py-1.5 rounded-md transition-colors"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 relative">
              {avatar ? (
                <Image 
                  src={avatar} 
                  alt={username} 
                  width={24} 
                  height={24}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600">
                  <span className="text-xs font-bold">{username.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <span className="text-sm font-medium">{username}</span>
            <ChevronDown size={14} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-[#1A1F2B] border border-gray-800 rounded-md shadow-lg z-50">
              <div className="py-1">
                <a href="/profil" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                  Profilim
                </a>
                <a href="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                  Ayarlar
                </a>
                <hr className="border-gray-800 mx-2 my-1" />
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Çıkış Yapılıyor...</span>
                    </>
                  ) : (
                    <>
                      <LogOut size={14} className="mr-2" />
                      <span>Çıkış Yap</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat button with notification counter */}
        <button 
          onClick={toggleChat}
          className="w-10 h-10 flex items-center justify-center bg-[#272A31] hover:bg-[#2F3238] text-white rounded-md transition-colors relative"
          aria-label="Chat"
        >
          <MessageSquare size={20} className="text-white" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
              {unreadCount}
            </div>
          )}
        </button>
      </div>
      
      {/* Chat panel */}
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
} 