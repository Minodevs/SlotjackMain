'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRank } from '@/types/user';
import { Send, X, MessageSquare, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { useSiteSettings } from './SiteSettingsProvider';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRank: UserRank;
  text: string;
  timestamp: number;
}

interface ActiveUser {
  id: string;
  name: string;
  isActive: boolean;
  lastSeen: number;
  isSystemGenerated: boolean;
  rank: UserRank;
}

// Local storage keys
const CHAT_MESSAGES_KEY = 'slotjack_chat_messages';
const ACTIVE_USERS_KEY = 'slotjack_active_users';

export default function LiveChat() {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat messages from localStorage
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }

      const storedUsers = localStorage.getItem(ACTIVE_USERS_KEY);
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        // Filter out system-generated users as requested
        setActiveUsers(parsedUsers.filter((u: ActiveUser) => !u.isSystemGenerated));
      } else {
        // Create some initial demo users if none exist
        const initialUsers: ActiveUser[] = [
          { id: '1', name: 'Admin', isActive: true, lastSeen: Date.now(), isSystemGenerated: false, rank: UserRank.ADMIN },
          { id: '2', name: 'Casino Pro', isActive: true, lastSeen: Date.now(), isSystemGenerated: false, rank: UserRank.VIP },
          { id: '3', name: 'Slot Master', isActive: false, lastSeen: Date.now() - 1000 * 60 * 10, isSystemGenerated: false, rank: UserRank.NORMAL }
        ];
        localStorage.setItem(ACTIVE_USERS_KEY, JSON.stringify(initialUsers));
        setActiveUsers(initialUsers);
      }
    } catch (err) {
      console.error('Error loading chat data:', err);
    }
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update user activity status
  useEffect(() => {
    if (!user) return;

    const updateUserActivity = () => {
      try {
        const storedUsers = localStorage.getItem(ACTIVE_USERS_KEY);
        let updatedUsers = storedUsers ? JSON.parse(storedUsers) : [];
        
        // Filter out system-generated users
        updatedUsers = updatedUsers.filter((u: ActiveUser) => !u.isSystemGenerated);
        
        // Check if current user exists
        const existingUserIndex = updatedUsers.findIndex((u: ActiveUser) => u.id === user.id);
        
        if (existingUserIndex !== -1) {
          // Update existing user
          updatedUsers[existingUserIndex] = {
            ...updatedUsers[existingUserIndex],
            isActive: true,
            lastSeen: Date.now(),
            rank: user.rank
          };
        } else {
          // Add new user
          updatedUsers.push({
            id: user.id,
            name: user.name || user.email.split('@')[0],
            isActive: true,
            lastSeen: Date.now(),
            isSystemGenerated: false,
            rank: user.rank
          });
        }
        
        // Update users who haven't been active in the last 5 minutes as inactive
        updatedUsers = updatedUsers.map((u: ActiveUser) => ({
          ...u,
          isActive: Date.now() - u.lastSeen < 5 * 60 * 1000
        }));
        
        localStorage.setItem(ACTIVE_USERS_KEY, JSON.stringify(updatedUsers));
        setActiveUsers(updatedUsers.filter((u: ActiveUser) => !u.isSystemGenerated));
      } catch (err) {
        console.error('Error updating user activity:', err);
      }
    };
    
    // Update activity when component mounts
    updateUserActivity();
    
    // Set interval to update activity status
    const interval = setInterval(updateUserActivity, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !message.trim()) return;
    
    try {
      // Create new message
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name || user.email.split('@')[0],
        userRank: user.rank,
        text: message.trim(),
        timestamp: Date.now()
      };
      
      // Add message to state
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // Save to localStorage
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(updatedMessages.slice(-100))); // Keep only last 100 messages
      
      // Clear input
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed right-4 bottom-0 z-40 w-80">
      {/* Chat Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-gray-800 text-white p-3 rounded-t-lg border-b border-gray-700"
        style={{ backgroundColor: settings.secondaryColor }}
      >
        <div className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" style={{ color: settings.primaryColor }} />
          <span className="font-medium">Canlı Sohbet</span>
          <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
            {activeUsers.filter(u => u.isActive).length}
          </span>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </button>
      
      {/* Chat Content */}
      {isOpen && (
        <div className="bg-gray-800 rounded-b-lg shadow-lg flex flex-col h-96">
          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-3">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center text-sm py-4">Henüz mesaj yok.</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex items-start">
                    <div className="flex-shrink-0 mr-2">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
                        {msg.userName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <span 
                          className={`font-semibold text-sm ${
                            msg.userRank === UserRank.ADMIN 
                              ? 'text-red-400' 
                              : msg.userRank === UserRank.VIP 
                                ? 'text-yellow-400' 
                                : 'text-white'
                          }`}
                        >
                          {msg.userName}
                        </span>
                        {msg.userRank === UserRank.ADMIN && (
                          <span className="ml-1 bg-red-900 text-red-200 text-xs px-1.5 py-0.5 rounded flex items-center">
                            <Shield className="w-3 h-3 mr-0.5" /> Admin
                          </span>
                        )}
                        {msg.userRank === UserRank.VIP && (
                          <span className="ml-1 bg-yellow-900 text-yellow-200 text-xs px-1.5 py-0.5 rounded">
                            VIP
                          </span>
                        )}
                        <span className="ml-2 text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-300 break-words">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Active Users */}
          <div className="border-t border-gray-700 p-2">
            <div className="text-xs text-gray-400 mb-1 flex items-center">
              <span>Aktif Kullanıcılar:</span>
              <span className="ml-1 bg-green-500 text-white px-1 rounded-sm text-xs">
                {activeUsers.filter(u => u.isActive).length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {activeUsers
                .filter(u => u.isActive)
                .map(user => (
                  <div 
                    key={user.id}
                    className={`text-xs px-1.5 py-0.5 rounded flex items-center ${
                      user.rank === UserRank.ADMIN 
                        ? 'bg-red-900 text-white' 
                        : user.rank === UserRank.VIP 
                          ? 'bg-yellow-900 text-white' 
                          : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {user.rank === UserRank.ADMIN && <Shield className="w-3 h-3 mr-0.5" />}
                    {user.name}
                  </div>
                ))}
            </div>
          </div>
          
          {/* Input Area */}
          {user ? (
            <form onSubmit={handleSendMessage} className="border-t border-gray-700 p-2">
              <div className="flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-grow bg-gray-700 text-white px-3 py-2 rounded-l-md focus:outline-none"
                />
                <button 
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-blue-600 text-white p-2 rounded-r-md disabled:opacity-50"
                  style={{ backgroundColor: message.trim() ? settings.primaryColor : undefined }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-gray-700 p-3 text-center">
              <p className="text-sm text-gray-400 mb-2">Mesaj göndermek için giriş yapmalısınız</p>
              <a 
                href="/giris"
                className="inline-block px-4 py-1 rounded-md text-white text-sm font-medium"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Giriş Yap
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 