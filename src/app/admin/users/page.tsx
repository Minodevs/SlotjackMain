'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Search, User, Edit, Plus, Shield, CheckCircle, XCircle, Clock, RefreshCw, UserMinus, UserCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import ClientLayout from '@/components/ClientLayout';

type UserStatus = 'all' | 'active' | 'inactive' | 'verified' | 'unverified';

interface UserListItem {
  id: string;
  name: string;
  email: string;
  rank: UserRank;
  jackPoints: number;
  isVerified: boolean;
  phoneVerified?: boolean;
  lastActive: number;
  createdAt: number;
  phoneNumber?: string;
  platform?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 15;

  // Load users from localStorage (in a real app, this would be an API call)
  useEffect(() => {
    if (!currentUser || currentUser.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }

    const loadUsers = () => {
      setLoading(true);
      
      // In a real application, this would be fetched from an API
      const registeredUsersStr = localStorage.getItem('slotjack_registered_users');
      if (!registeredUsersStr) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const registeredUsers = JSON.parse(registeredUsersStr);
      const userArray: UserListItem[] = Object.entries(registeredUsers).map(([email, userData]: [string, any]) => ({
        id: userData.id,
        name: userData.name || email.split('@')[0],
        email,
        rank: userData.rank || UserRank.NORMAL,
        jackPoints: userData.jackPoints || 0,
        isVerified: userData.isVerified || false,
        phoneVerified: userData.phoneVerified || false,
        lastActive: userData.lastActive || userData.lastUpdated || Date.now(),
        createdAt: userData.createdAt || Date.now(),
        phoneNumber: userData.phoneNumber || '',
        platform: userData.platform || 'web'
      }));

      setUsers(userArray);
      setTotalPages(Math.ceil(userArray.length / usersPerPage));
      setLoading(false);
    };

    loadUsers();

    // Set up storage event listener to refresh data when it changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'slotjack_registered_users') {
        loadUsers();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser, router]);

  // Filter and paginate users
  const filteredUsers = users
    .filter(user => {
      // Search filter
      const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      let statusMatch = true;
      if (statusFilter === 'active') {
        statusMatch = Date.now() - user.lastActive < 30 * 24 * 60 * 60 * 1000; // Active in last 30 days
      } else if (statusFilter === 'inactive') {
        statusMatch = Date.now() - user.lastActive >= 30 * 24 * 60 * 60 * 1000; // Inactive for 30+ days
      } else if (statusFilter === 'verified') {
        statusMatch = user.isVerified || user.phoneVerified || false;
      } else if (statusFilter === 'unverified') {
        statusMatch = !(user.isVerified || user.phoneVerified || false);
      }
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      return b.lastActive - a.lastActive; // Sort by most recently active
    });

  const paginatedUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

  // Generate time ago string
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} yıl önce`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} ay önce`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} gün önce`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} saat önce`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} dakika önce`;
    }
    
    return `${Math.floor(seconds)} saniye önce`;
  };

  // Refresh users list
  const handleRefresh = () => {
    const registeredUsersStr = localStorage.getItem('slotjack_registered_users');
    if (!registeredUsersStr) {
      setUsers([]);
      return;
    }

    const registeredUsers = JSON.parse(registeredUsersStr);
    const userArray: UserListItem[] = Object.entries(registeredUsers).map(([email, userData]: [string, any]) => ({
      id: userData.id,
      name: userData.name || email.split('@')[0],
      email,
      rank: userData.rank || UserRank.NORMAL,
      jackPoints: userData.jackPoints || 0,
      isVerified: userData.isVerified || false,
      phoneVerified: userData.phoneVerified || false,
      lastActive: userData.lastActive || userData.lastUpdated || Date.now(),
      createdAt: userData.createdAt || Date.now(),
      phoneNumber: userData.phoneNumber || '',
      platform: userData.platform || 'web'
    }));

    setUsers(userArray);
    setTotalPages(Math.ceil(userArray.length / usersPerPage));
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ClientLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Kullanıcı Yönetimi</h1>
            <p className="text-gray-400">Tüm kullanıcıları görüntüle, düzenle ve yönet</p>
          </div>
          
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <button 
              onClick={handleRefresh}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              <span>Yenile</span>
            </button>
            
            <button 
              onClick={() => {
                // In a real app, this would navigate to a user creation page
                alert('Yeni kullanıcı ekleme özelliği henüz eklenmedi.');
              }}
              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <UserPlus size={16} />
              <span>Yeni Kullanıcı</span>
            </button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Kullanıcı ara..."
                className="bg-gray-700 border border-gray-600 text-white pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                  statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Clock size={14} className="mr-1" />
                Aktif
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                  statusFilter === 'inactive' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <UserMinus size={14} className="mr-1" />
                İnaktif
              </button>
              <button
                onClick={() => setStatusFilter('verified')}
                className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                  statusFilter === 'verified' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <CheckCircle size={14} className="mr-1" />
                Doğrulanmış
              </button>
              <button
                onClick={() => setStatusFilter('unverified')}
                className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                  statusFilter === 'unverified' ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <XCircle size={14} className="mr-1" />
                Doğrulanmamış
              </button>
            </div>
          </div>
        </div>
        
        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Kullanıcı Bulunamadı</h2>
            <p className="text-gray-400 mb-4">Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Tüm Kullanıcıları Göster
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gray-800 overflow-hidden rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        JackPoints
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Son Aktivite
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Kayıt Tarihi
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{user.name}</div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                              {user.rank === UserRank.ADMIN && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-red-900 text-red-200 inline-flex items-center">
                                  <Shield size={10} className="mr-1" /> Admin
                                </span>
                              )}
                              {user.rank === UserRank.VIP && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-900 text-yellow-200">VIP</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{user.jackPoints.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-900 text-indigo-200">
                              {user.platform || 'web'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {user.phoneNumber ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-200">
                                {user.phoneNumber}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">---</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {user.isVerified || user.phoneVerified ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-200">
                                Doğrulanmış
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">
                                Doğrulanmamış
                              </span>
                            )}
                            
                            {Date.now() - user.lastActive < 30 * 24 * 60 * 60 * 1000 ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-200">
                                Aktif
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-900 text-orange-200">
                                İnaktif
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="text-sm text-gray-300">{timeAgo(user.lastActive)}</div>
                          <div className="text-xs text-gray-400">{formatDate(user.lastActive)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="text-sm text-gray-300">{timeAgo(user.createdAt)}</div>
                          <div className="text-xs text-gray-400">{formatDate(user.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/admin/users/${user.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2 inline-flex items-center"
                          >
                            <User size={14} className="mr-1" />
                            Profil
                          </Link>
                          <Link 
                            href={`/admin/users/${user.id}/partners`}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded inline-flex items-center"
                          >
                            <Plus size={14} className="mr-1" />
                            Partners
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setPage(page > 1 ? page - 1 : 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      page === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                  >
                    Önceki
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = page <= 3 
                      ? i + 1 
                      : page >= totalPages - 2 
                        ? totalPages - 4 + i 
                        : page - 2 + i;
                    
                    return pageNumber <= totalPages ? (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          page === pageNumber ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ) : null;
                  })}
                  
                  <button
                    onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      page === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ClientLayout>
  );
} 