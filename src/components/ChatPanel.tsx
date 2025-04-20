'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X, Send, AlertCircle, UserX, Flag, Ban, Shield } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { UserRank } from '@/types/user';

// Define message structure
interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: number;
  isBanned?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// List of words to filter out
const BAD_WORDS = [
  'kumar', 'bahis', 'bet', 'casino', 'illegal', 'yasadışı', 'iddia', 'poker',
  // Add more words as needed
];

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0); // Initialize with 0 instead of hardcoded value
  const [errorMessage, setErrorMessage] = useState('');
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Check if user is admin or moderator
  const isAdmin = user?.rank === UserRank.ADMIN;
  const isModerator = isAdmin || user?.rank === UserRank.VIP; // VIP users are moderators

  // Add a function to fetch online users count
  const fetchOnlineUsers = async () => {
    try {
      // In a real implementation, this would be an API call to get active users
      // For now, we'll just count the current user as the only online user
      // since there's no actual backend to track other logged in users
      setOnlineUsers(1); // Only the current user is online
      
      // When the site has a real backend, uncomment this code:
      // const response = await fetch('/api/users/online');
      // if (response.ok) {
      //   const data = await response.json();
      //   setOnlineUsers(data.count);
      // }
    } catch (error) {
      console.error('Error fetching online users:', error);
      // Fallback to at least 1 (the current user)
      setOnlineUsers(1);
    }
  };

  // Call fetchOnlineUsers when the component mounts or when chat opens
  useEffect(() => {
    if (isOpen) {
      fetchOnlineUsers();
      
      // Refresh online users count every 30 seconds
      const interval = setInterval(fetchOnlineUsers, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Fetch real chat messages instead of mock data
  useEffect(() => {
    if (!user) return; // Only fetch messages if user is logged in
    
    // This would be an API call in a real implementation
    const fetchChatMessages = async () => {
      try {
        // Mock empty chat initially
        setMessages([]);
        
        // In a real application, you would fetch messages from a database
        // const response = await fetch('/api/chat/messages');
        // if (response.ok) {
        //   const data = await response.json();
        //   setMessages(data.messages);
        // }
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        setErrorMessage('Mesajlar yüklenirken bir hata oluştu.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    };
    
    fetchChatMessages();
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Close context menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check for bad words in a message
  const containsBadWords = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return BAD_WORDS.some(word => lowerText.includes(word.toLowerCase()));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    // Check for bad words
    if (containsBadWords(newMessage)) {
      setErrorMessage('Uygunsuz içerik tespit edildi. Lütfen mesajınızı düzenleyin.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    // Create message with only the properties we need
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      userId: user.id.toString(),
      username: user.name || user.email.split('@')[0],
      avatar: user.avatar || '',
      message: newMessage.trim(),
      timestamp: Date.now(),
      isAdmin: user.rank === UserRank.ADMIN,
      isModerator: user.rank === UserRank.VIP,
    };
    
    // In a real app, you would send this to an API first
    // const response = await fetch('/api/chat/messages', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newMsg)
    // });
    
    // If successful, add to local state
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  // Admin actions
  const handleBanUser = (userId: string) => {
    if (!isModerator) return;
    
    // In a real implementation, this would call an API
    console.log(`Banning user with ID: ${userId}`);
    setMessages(messages.map(msg => 
      msg.userId === userId ? {...msg, isBanned: true} : msg
    ));
    setShowContextMenu(null);
    
    // Show success message
    setErrorMessage('Kullanıcı sohbetten engellendi.');
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!isModerator) return;
    
    // In a real implementation, this would call an API
    console.log(`Deleting message with ID: ${messageId}`);
    setMessages(messages.filter(msg => msg.id !== messageId));
    setShowContextMenu(null);
  };

  const handleReportMessage = (messageId: string) => {
    // In a real implementation, this would call an API
    console.log(`Reporting message with ID: ${messageId}`);
    setShowContextMenu(null);
    
    // Show success message
    setErrorMessage('Mesaj başarıyla bildirildi. Teşekkürler!');
    setTimeout(() => setErrorMessage(''), 3000);
  };

  // Show context menu for message actions
  const handleMessageContextMenu = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    setShowContextMenu(messageId);
  };

  // Add a listener for the userLoginStateChanged event
  useEffect(() => {
    // Listen for login state changes from other components
    const handleLoginStateChange = () => {
      if (isOpen) {
        fetchOnlineUsers();
      }
    };
    
    window.addEventListener('userLoginStateChanged', handleLoginStateChange);
    
    return () => {
      window.removeEventListener('userLoginStateChanged', handleLoginStateChange);
    };
  }, [isOpen]);

  // If user isn't logged in, show login prompt
  if (!user) {
    return (
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-y-0 right-0 w-full sm:w-96 z-40 bg-[#0F1118] shadow-xl flex flex-col"
      >
        <div className="flex items-center bg-[#1A1F2B] p-4 border-b border-[#232631]">
          <button onClick={onClose} className="mr-3 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
          <h2 className="text-white font-bold">Slotjack Chat</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-gray-300 mb-4">Sohbet edebilmek için giriş yapmanız gerekiyor.</p>
            <div className="flex justify-center space-x-3">
              <a href="/giris" className="bg-[#FF7A00] text-white px-4 py-2 rounded-md hover:bg-[#FF9633]">
                Giriş Yap
              </a>
              <a href="/kayit" className="bg-[#272A31] text-white px-4 py-2 rounded-md hover:bg-[#2F3238]">
                Kayıt Ol
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-y-0 right-0 w-full sm:w-96 z-40 bg-[#0F1118] shadow-xl flex flex-col"
    >
      <div className="flex items-center bg-[#1A1F2B] p-4 border-b border-[#232631]">
        <button onClick={onClose} className="mr-3 text-gray-400 hover:text-white">
          <X size={18} />
        </button>
        <h2 className="text-white font-bold">Slotjack Chat</h2>
        <div className="ml-3 text-gray-400 text-sm flex items-center">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
          {onlineUsers === 1 ? (
            <span>Sadece siz</span> // "Only you" in Turkish
          ) : onlineUsers > 0 ? (
            <span>{onlineUsers} Online</span>
          ) : (
            <span className="animate-pulse">Yükleniyor...</span>
          )}
        </div>
        {isAdmin && (
          <div className="ml-auto">
            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs bg-red-900/50 text-red-300">
              <Shield size={12} className="mr-1" /> Admin
            </span>
          </div>
        )}
        {!isAdmin && isModerator && (
          <div className="ml-auto">
            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs bg-yellow-900/50 text-yellow-300">
              <Shield size={12} className="mr-1" /> Moderator
            </span>
          </div>
        )}
      </div>
      
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-[#0F1118]"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="text-gray-400 text-sm mb-4">
              Henüz mesaj yok. İlk mesajı göndermek için sohbete başlayın!
            </div>
            {isAdmin && (
              <div className="bg-blue-900/30 border border-blue-800 rounded-md p-3 max-w-xs">
                <div className="flex items-center text-blue-300 text-xs mb-2">
                  <Shield size={14} className="mr-1.5" />
                  <span className="font-medium">Admin Bilgisi</span>
                </div>
                <p className="text-gray-300 text-xs text-left">
                  Şu anda admin modundasınız. Mesajları silebilir ve kullanıcıları engelleyebilirsiniz.
                  Sağ tık menüsü ile moderasyon işlemlerini yapabilirsiniz.
                </p>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`hover:bg-[#1A1F2B]/30 relative ${msg.isBanned ? 'opacity-50' : ''}`}
              onContextMenu={(e) => handleMessageContextMenu(e, msg.id)}
            >
              <div className="flex items-start space-x-2 p-3">
                <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${
                  msg.isAdmin ? 'bg-red-600' : msg.isModerator ? 'bg-yellow-600' : 'bg-blue-600'
                }`}>
                  {msg.avatar ? (
                    <Image
                      src={msg.avatar}
                      alt={msg.username}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white">
                      {msg.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline">
                    <span className={`font-medium text-sm ${
                      msg.isAdmin ? 'text-red-400' : msg.isModerator ? 'text-yellow-400' : 'text-gray-200'
                    }`}>
                      {msg.username}
                      {msg.isAdmin && (
                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs bg-red-900/50 text-red-300">
                          <Shield size={10} className="mr-0.5" /> Admin
                        </span>
                      )}
                      {msg.isModerator && !msg.isAdmin && (
                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs bg-yellow-900/50 text-yellow-300">
                          <Shield size={10} className="mr-0.5" /> Mod
                        </span>
                      )}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-snug">
                    {msg.isBanned 
                      ? <span className="italic text-gray-500">Bu mesaj moderatör tarafından gizlendi.</span> 
                      : msg.message
                    }
                  </p>
                </div>
              </div>
              
              {/* Context menu */}
              {showContextMenu === msg.id && (
                <div 
                  ref={contextMenuRef}
                  className="absolute right-2 bottom-2 bg-[#252A37] border border-[#323845] rounded-md shadow-lg py-1 z-10"
                >
                  {isModerator ? (
                    <>
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-[#1a1f2b] flex items-center"
                      >
                        <UserX size={12} className="mr-1.5" /> Mesajı Sil
                      </button>
                      <button 
                        onClick={() => handleBanUser(msg.userId)}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-[#1a1f2b] flex items-center"
                      >
                        <Ban size={12} className="mr-1.5" /> Kullanıcıyı Engelle
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleReportMessage(msg.id)}
                      className="w-full text-left px-3 py-1.5 text-xs text-yellow-400 hover:bg-[#1a1f2b] flex items-center"
                    >
                      <Flag size={12} className="mr-1.5" /> Bildir
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {errorMessage && (
        <div className={`p-2 text-sm flex items-center ${errorMessage.includes('engellendi') || errorMessage.includes('bildirildi') ? 'bg-green-900/70 border border-green-800' : 'bg-red-900/70 border border-red-800'} text-white`}>
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="p-3 bg-[#1A1F2B] border-t border-[#232631] flex items-center">
        <input
          type="text"
          placeholder="Mesajınızı yazın..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-[#0F1118] text-gray-200 rounded-l-md px-4 py-2 text-sm focus:outline-none border border-[#232631] border-r-0"
        />
        <button 
          type="submit" 
          className="bg-[#FF7A00] text-white p-2 rounded-r-md hover:bg-[#FF9633] flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
      
      {isModerator && (
        <div className="bg-[#1A1F2B] p-2 border-t border-[#232631] text-xs text-gray-400">
          <p>Moderatör modu aktif - Sağ tıklayarak mesajları silebilir veya kullanıcıları engelleyebilirsiniz.</p>
        </div>
      )}
    </motion.div>
  );
} 