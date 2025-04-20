'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Send, User, Users, Settings, Bell, MessageSquare, Info, Smile } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';

// Mock data for chat messages
interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

// Mock data for online users
interface OnlineUser {
  id: string;
  name: string;
  status: 'online' | 'away' | 'busy';
  avatar?: string;
}

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Initial mock messages
const initialMessages: ChatMessage[] = [
  {
    id: generateId(),
    userId: 'system',
    userName: 'SLOTJACK',
    message: 'Sohbet odasına hoş geldiniz! Lütfen sohbet kurallarına uyunuz.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    isSystem: true,
  },
  {
    id: generateId(),
    userId: 'user1',
    userName: 'Ali',
    message: 'Merhaba! Yeni oyun çıkacak mı?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: generateId(),
    userId: 'user2',
    userName: 'Ayşe',
    message: 'Evet, önümüzdeki hafta yeni bir turnuva başlayacak!',
    timestamp: new Date(Date.now() - 1000 * 60 * 28), // 28 mins ago
  },
  {
    id: generateId(),
    userId: 'user3',
    userName: 'Mehmet',
    message: 'Bu turnuvaya kayıt nasıl yapılıyor?',
    timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 mins ago
  },
  {
    id: generateId(),
    userId: 'user2',
    userName: 'Ayşe',
    message: 'Etkinlikler sayfasından kayıt olabilirsin.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
  },
];

// Initial mock online users
const initialOnlineUsers: OnlineUser[] = [
  { id: 'user1', name: 'Ali', status: 'online' },
  { id: 'user2', name: 'Ayşe', status: 'online' },
  { id: 'user3', name: 'Mehmet', status: 'away' },
  { id: 'user4', name: 'Fatma', status: 'online' },
  { id: 'user5', name: 'Can', status: 'busy' },
  { id: 'user6', name: 'Zeynep', status: 'online' },
  { id: 'user7', name: 'Emre', status: 'online' },
  { id: 'user8', name: 'Seda', status: 'away' },
];

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>(initialOnlineUsers);
  const [messageInput, setMessageInput] = useState('');
  const [chatTab, setChatTab] = useState<'general' | 'support'>('general');
  const [showUserList, setShowUserList] = useState(true);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add simulated incoming messages
  useEffect(() => {
    const simulateIncomingMessages = () => {
      const randomMessages = [
        'Bugün şansım yerinde!',
        'Yeni bir jackpot kazandım!',
        'Turnuvada birinci oldum!',
        'Bu oyun gerçekten eğlenceli',
        'Herkese başarılar dilerim',
        'JackPoint\'lerimi nasıl kullanabilirim?',
        'Yeni etkinlikleri sabırsızlıkla bekliyorum'
      ];
      
      const randomUserIndex = Math.floor(Math.random() * onlineUsers.length);
      const randomUser = onlineUsers[randomUserIndex];
      const randomMessageIndex = Math.floor(Math.random() * randomMessages.length);
      
      // Add random message
      const newMessage: ChatMessage = {
        id: generateId(),
        userId: randomUser.id,
        userName: randomUser.name,
        message: randomMessages[randomMessageIndex],
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
    };
    
    // Simulate message every 45-90 seconds
    const intervalTime = Math.floor(Math.random() * 45000) + 45000;
    const interval = setInterval(simulateIncomingMessages, intervalTime);
    
    return () => clearInterval(interval);
  }, [onlineUsers]);

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !user) return;
    
    const newMessage: ChatMessage = {
      id: generateId(),
      userId: user.id,
      userName: user.name || user.email.split('@')[0],
      message: messageInput.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <ClientLayout>
      <div className="container mx-auto h-[calc(100vh-200px)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold flex items-center">
            <MessageSquare className="w-8 h-8 text-[#FF6B00] mr-2" />
            Canlı Sohbet
          </h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowUserList(!showUserList)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Chat tabs */}
        <div className="flex mb-4 border-b border-gray-700">
          <button 
            className={`px-4 py-2 font-medium ${chatTab === 'general' ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]' : 'text-gray-400'}`}
            onClick={() => setChatTab('general')}
          >
            Genel Sohbet
          </button>
          <button 
            className={`px-4 py-2 font-medium ${chatTab === 'support' ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]' : 'text-gray-400'}`}
            onClick={() => setChatTab('support')}
          >
            Destek
          </button>
        </div>
        
        <div className="flex flex-grow h-0">
          {/* Messages container */}
          <div className="flex-grow bg-gray-900 rounded-lg overflow-hidden">
            {!user ? (
              <div className="h-full flex items-center justify-center flex-col p-8">
                <Info className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Sohbete katılmak için giriş yapın</h3>
                <p className="text-gray-500 text-center mb-4">Diğer oyuncularla sohbet etmek ve deneyimlerinizi paylaşmak için lütfen giriş yapınız.</p>
                <a href="/giris" className="px-6 py-2 bg-[#FF6B00] hover:bg-[#FF8533] transition-colors rounded-lg font-medium">
                  Giriş Yap
                </a>
              </div>
            ) : (
              <>
                <div className="h-full flex flex-col">
                  <div className="flex-grow overflow-y-auto p-4" ref={messageContainerRef}>
                    {messages.map(message => (
                      <div 
                        key={message.id}
                        className={`mb-4 ${message.userId === user.id ? 'ml-auto mr-0 max-w-[80%]' : 'mr-auto ml-0 max-w-[80%]'}`}
                      >
                        {message.userId !== user.id && !message.isSystem && (
                          <span className="text-[#FF6B00] text-sm font-semibold block mb-1">{message.userName}</span>
                        )}
                        
                        <div 
                          className={`p-3 rounded-lg ${
                            message.isSystem 
                              ? 'bg-blue-900/30 border border-blue-800 text-blue-200' 
                              : message.userId === user.id 
                                ? 'bg-[#FF6B00] text-white' 
                                : 'bg-gray-800 text-white'
                          }`}
                        >
                          <p className="break-words">{message.message}</p>
                          <span className={`text-xs ${message.userId === user.id ? 'text-white/70' : 'text-gray-400'} block text-right mt-1`}>
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                    <div className="flex items-center">
                      <button 
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-200"
                      >
                        <Smile className="w-6 h-6" />
                      </button>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        className="flex-grow bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mx-2 focus:outline-none focus:border-[#FF6B00]"
                      />
                      <button 
                        type="submit"
                        disabled={!messageInput.trim()}
                        className={`p-2 rounded-lg ${messageInput.trim() ? 'bg-[#FF6B00] hover:bg-[#FF8533]' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`}
                      >
                        <Send className="w-6 h-6" />
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
          
          {/* Online users sidebar */}
          {showUserList && (
            <div className="w-64 ml-4 bg-gray-900 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold flex items-center">
                  <Users className="w-4 h-4 text-[#FF6B00] mr-2" />
                  Çevrimiçi Kullanıcılar ({onlineUsers.filter(u => u.status === 'online').length})
                </h3>
              </div>
              <div className="p-2 overflow-y-auto max-h-[calc(100%-60px)]">
                {onlineUsers.map(onlineUser => (
                  <div key={onlineUser.id} className="flex items-center p-2 hover:bg-gray-800 rounded-lg cursor-pointer">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <span 
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                          onlineUser.status === 'online' ? 'bg-green-500' : 
                          onlineUser.status === 'away' ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                      ></span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-sm">{onlineUser.name}</h4>
                      <span className="text-xs text-gray-400">
                        {onlineUser.status === 'online' ? 'Çevrimiçi' : 
                         onlineUser.status === 'away' ? 'Uzakta' : 
                         'Meşgul'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
} 