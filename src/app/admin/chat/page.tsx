'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRank } from '@/types/user';
import { ChevronLeft, Search, Ban, UserCheck, Trash2, RefreshCw, UserX, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

// User type for the chat system
interface ChatUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  messageCount: number;
  lastActive: number;
  isBanned: boolean;
  banReason?: string;
}

// Chat message type
interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  isDeleted: boolean;
}

// Filter options
type FilterType = 'all' | 'active' | 'banned';

export default function AdminChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  
  // Check if user is admin
  useEffect(() => {
    if (!loading && user) {
      if (user.rank !== UserRank.ADMIN) {
        router.push('/');
        toast.error('Bu sayfaya erişim yetkiniz yok.');
      }
    }
  }, [user, loading, router]);
  
  // Fetch chat users and messages (mock data for now)
  useEffect(() => {
    // This would be an API call in a real implementation
    const fetchChatData = () => {
      setIsLoading(true);
      
      // Start with empty data initially - this will be replaced with real API data in production
      setChatUsers([]);
      setRecentMessages([]);
      
      // In a real implementation we would fetch data from an API:
      // const fetchUsers = async () => {
      //   const response = await fetch('/api/admin/chat/users');
      //   if (response.ok) {
      //     const data = await response.json();
      //     setChatUsers(data.users);
      //   }
      // };
      
      // const fetchMessages = async () => {
      //   const response = await fetch('/api/admin/chat/messages');
      //   if (response.ok) {
      //     const data = await response.json();
      //     setRecentMessages(data.messages);
      //   }
      // };
      
      // await Promise.all([fetchUsers(), fetchMessages()]);
      
      setIsLoading(false);
    };
    
    fetchChatData();
  }, []);
  
  // Handle user ban
  const handleBanUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowBanModal(true);
  };
  
  // Submit ban
  const submitBan = () => {
    if (!selectedUserId) return;
    
    setChatUsers(
      chatUsers.map(user => 
        user.id === selectedUserId 
          ? { ...user, isBanned: true, banReason: banReason || 'Kural ihlali' } 
          : user
      )
    );
    
    setShowBanModal(false);
    setSelectedUserId(null);
    setBanReason('');
    
    toast.success('Kullanıcı başarıyla engellendi.');
  };
  
  // Unban user
  const handleUnbanUser = (userId: string) => {
    setChatUsers(
      chatUsers.map(user => 
        user.id === userId 
          ? { ...user, isBanned: false, banReason: undefined } 
          : user
      )
    );
    
    toast.success('Kullanıcı engeli kaldırıldı.');
  };
  
  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    setRecentMessages(
      recentMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, isDeleted: true } 
          : msg
      )
    );
    
    toast.success('Mesaj silindi.');
  };
  
  // Format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR');
  };
  
  // Filter users based on search and filter
  const filteredUsers = chatUsers.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && !user.isBanned;
    if (filter === 'banned') return matchesSearch && user.isBanned;
    
    return matchesSearch;
  });
  
  // Refresh data
  const handleRefresh = () => {
    toast.success('Veriler yenileniyor...');
    // In a real app, this would refetch data from the API
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/admin" className="flex items-center mr-4 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Admin Panele Dön
          </Link>
          <h1 className="text-2xl font-bold flex-1">Sohbet Yönetimi</h1>
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <RefreshCw size={16} className="mr-1.5" />
            Yenile
          </button>
        </div>
        
        {/* Information panel about user restrictions */}
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-300 mb-1">Yalnızca Kayıtlı Kullanıcılara Açık</h3>
              <p className="text-gray-300 text-sm">
                Sohbet sistemi sadece kayıtlı ve giriş yapmış kullanıcılar tarafından kullanılabilir. 
                Ziyaretçiler ve kayıtsız kullanıcılar sohbete erişemezler.
                Moderatörler ve adminler, kullanıcı mesajlarını görebilir, silebilir ve uygunsuz içerik paylaşan kullanıcıları engelleyebilir.
              </p>
            </div>
          </div>
        </div>
        
        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <h3 className="text-gray-400 text-sm mb-1">Kullanıcılar</h3>
            <p className="text-2xl font-bold">{chatUsers.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <h3 className="text-gray-400 text-sm mb-1">Aktif Kullanıcılar</h3>
            <p className="text-2xl font-bold text-green-500">{chatUsers.filter(u => !u.isBanned).length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <h3 className="text-gray-400 text-sm mb-1">Engellenen Kullanıcılar</h3>
            <p className="text-2xl font-bold text-red-500">{chatUsers.filter(u => u.isBanned).length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <h3 className="text-gray-400 text-sm mb-1">Toplam Mesaj</h3>
            <p className="text-2xl font-bold text-blue-500">
              {chatUsers.reduce((total, user) => total + user.messageCount, 0)}
            </p>
          </div>
        </div>
        
        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User list */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg">
              <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0">
                <h2 className="text-xl font-semibold flex-1">Sohbet Kullanıcıları</h2>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Kullanıcı ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-700 text-white rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="bg-gray-700 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tümü</option>
                    <option value="active">Aktif</option>
                    <option value="banned">Engellenmiş</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-700/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kullanıcı</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mesaj Sayısı</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Son Aktivite</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Durum</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-center text-gray-400">Yükleniyor...</td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-center text-gray-400">Kullanıcı bulunamadı</td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id} className={`${user.isBanned ? 'bg-red-900/10' : ''} hover:bg-gray-750`}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex-shrink-0 flex items-center justify-center mr-3">
                                {user.avatar ? (
                                  <Image
                                    src={user.avatar}
                                    alt={user.username}
                                    width={32}
                                    height={32}
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-white">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{user.username}</div>
                                <div className="text-sm text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm">{user.messageCount}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm">{formatTime(user.lastActive)}</span>
                            <div className="text-xs text-gray-500">{formatDate(user.lastActive)}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {user.isBanned ? (
                              <>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900 text-red-200">
                                  <Ban size={12} className="mr-1" /> Engellenmiş
                                </span>
                                {user.banReason && (
                                  <div className="mt-1 text-xs text-gray-400">{user.banReason}</div>
                                )}
                              </>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-200">
                                <UserCheck size={12} className="mr-1" /> Aktif
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {user.isBanned ? (
                              <button
                                onClick={() => handleUnbanUser(user.id)}
                                className="text-green-400 hover:text-green-300 mr-3"
                              >
                                <UserCheck size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(user.id)}
                                className="text-red-400 hover:text-red-300 mr-3"
                              >
                                <UserX size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Recent messages */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg h-full">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Son Mesajlar</h2>
              </div>
              
              <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: '600px' }}>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-400">Yükleniyor...</div>
                ) : recentMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">Mesaj bulunamadı</div>
                ) : (
                  recentMessages.map(message => (
                    <div 
                      key={message.id} 
                      className={`flex items-start space-x-3 p-3 rounded-md ${message.isDeleted ? 'bg-red-900/10' : 'bg-gray-750'}`}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {message.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{message.username}</span>
                          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                        </div>
                        
                        {message.isDeleted ? (
                          <p className="text-sm mt-1 italic text-gray-500">
                            Bu mesaj moderatör tarafından silindi.
                          </p>
                        ) : (
                          <p className="text-sm mt-1">{message.message}</p>
                        )}
                      </div>
                      
                      {!message.isDeleted && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Mesajı Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat rules section */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-blue-400 mr-2" />
            <h2 className="text-xl font-semibold">Sohbet Kuralları</h2>
          </div>
          
          <div className="text-sm text-gray-300 space-y-2">
            <p>1. Diğer kullanıcılara saygılı olun ve hakaret içeren mesajlar yazmayın.</p>
            <p>2. Spam yapmayın ve aynı mesajı tekrar tekrar göndermeyin.</p>
            <p>3. Kumar, bahis veya yasa dışı içerikler hakkında konuşmayın.</p>
            <p>4. Kişisel bilgilerinizi (telefon numarası, adres vb.) paylaşmayın.</p>
            <p>5. Reklam veya tanıtım yapmayın.</p>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>Kurallara uymayan kullanıcılar geçici veya kalıcı olarak engellenebilir. Engelleme kararları tamamen site yönetiminin takdirindedir.</p>
          </div>
        </div>
      </div>
      
      {/* Ban modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Kullanıcıyı Engelle</h3>
            <p className="text-gray-300 mb-4">
              Bu kullanıcıyı sohbetten engellemek istediğinize emin misiniz? Engellenen kullanıcılar sohbete mesaj gönderemezler.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Engelleme Nedeni (opsiyonel)
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Kullanıcının neden engellendiğini belirtin..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedUserId(null);
                  setBanReason('');
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                İptal
              </button>
              <button
                onClick={submitBan}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <Ban size={16} className="mr-1.5" />
                Engelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 