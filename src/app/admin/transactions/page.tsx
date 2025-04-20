'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import { 
  ChevronLeft, Filter, Search, ArrowUp, ArrowDown, 
  Download, Coins, CreditCard, Calendar, User, Trash, RefreshCw,
  Phone, Send as TelegramIcon, MessageCircle as DiscordIcon, Eye, ExternalLink
} from 'lucide-react';
import ClientLayout from '../../../components/ClientLayout';
import { format } from 'date-fns';
import * as TransactionsService from '@/services/TransactionsService';
import { Transaction } from '@/types/transactions';
import { migrateTransactionsToSupabase } from '@/scripts/migrateTransactions';
import toast from 'react-hot-toast';

// Constants
const TRANSACTION_TYPES = ['All', 'DEPOSIT', 'WITHDRAWAL', 'BONUS', 'REFUND', 'FEE'];
const LEADERBOARD_STORAGE_KEY = 'slotjack_leaderboard';

export default function AdminTransactionsPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'earn' | 'spend'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  
  const [isLoading, setIsLoading] = useState(false);
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Check if user is admin and load transactions
  useEffect(() => {
    if (!loading && (!user || user.rank !== UserRank.ADMIN)) {
      router.push('/');
      return;
    }
    
    if (user && user.rank === UserRank.ADMIN) {
      loadTransactions();
    }
  }, [user, loading, router]);

  // Function to load transactions from Supabase
  const loadTransactions = async () => {
    setRefreshing(true);
    
    try {
      console.log('Loading transactions from database...');
      // Fetch transactions from Supabase via our service
      const allTransactions = await TransactionsService.getAllTransactions();
      
      if (allTransactions.length === 0) {
        console.log('No transactions found in the database');
        toast.success('No transactions found in the database');
      } else {
        console.log(`Loaded ${allTransactions.length} transactions successfully`);
        toast.success(`Loaded ${allTransactions.length} transactions`);
      }
      
      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error(`Failed to load transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Try to load from local cache as fallback
      try {
        const cachedTransactions = JSON.parse(localStorage.getItem('slotjack_transactions_cache') || '[]');
        if (cachedTransactions.length > 0) {
          setTransactions(cachedTransactions);
          setFilteredTransactions(cachedTransactions);
          toast.success(`Loaded ${cachedTransactions.length} transactions from cache`);
        }
      } catch (cacheError) {
        console.error('Error loading from cache:', cacheError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Set up periodic refresh
  useEffect(() => {
    // Set up an interval to refresh data periodically
    const refreshInterval = setInterval(() => {
      if (!refreshing) {
        loadTransactions();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [refreshing]);
  
  // Function to manually refresh transactions
  const refreshTransactions = () => {
    loadTransactions();
  };
  
  // Apply filters whenever filter states change
  useEffect(() => {
    let result = [...transactions];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tx => 
        tx.description.toLowerCase().includes(query) || 
        tx.userEmail.toLowerCase().includes(query) ||
        (tx.userName && tx.userName.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(tx => tx.type === typeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
      
      switch (dateFilter) {
        case 'today':
          result = result.filter(tx => tx.timestamp >= today);
          break;
        case 'week':
          result = result.filter(tx => tx.timestamp >= weekAgo);
          break;
        case 'month':
          result = result.filter(tx => tx.timestamp >= monthAgo);
          break;
      }
    }
    
    setFilteredTransactions(result);
  }, [searchQuery, typeFilter, dateFilter, transactions]);
  
  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), 'dd/MM/yyyy HH:mm');
    } catch (err) {
      return 'Invalid date';
    }
  };
  
  // Format phone number for display and calling
  const formatPhoneNumber = (phoneNumber?: string) => {
    if (!phoneNumber) return '';
    // Ensure it has a plus sign if it doesn't already
    return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  };
  
  // Get contact links for social platforms
  const getSocialMediaLink = (platform: string, username?: string) => {
    if (!username) return '';
    
    switch (platform.toLowerCase()) {
      case 'telegram':
        return `https://t.me/${username.replace('@', '')}`;
      case 'discord':
        return `https://discord.com/users/${username}`;
      case 'instagram':
        return `https://instagram.com/${username.replace('@', '')}`;
      default:
        return '';
    }
  };
  
  // Export transactions as CSV
  const exportCSV = () => {
    const headers = ['Date', 'User', 'Email', 'Phone', 'Telegram', 'Discord', 'Type', 'Amount', 'Description'];
    const csvData = filteredTransactions.map(tx => [
      formatDate(tx.timestamp),
      tx.userName || tx.userEmail.split('@')[0],
      tx.userEmail,
      formatPhoneNumber(tx.userPhone || ''),
      tx.userSocialMedia?.telegram || '',
      tx.userSocialMedia?.discord || '',
      tx.type === 'earn' ? 'Earn' : tx.type === 'spend' ? 'Spend' : tx.type === 'bonus' ? 'Bonus' : tx.type === 'event' ? 'Event' : 'Admin',
      tx.amount,
      tx.description
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMigrateTransactions = async () => {
    if (confirm('This will migrate all transactions from localStorage to the Supabase database. Continue?')) {
      try {
        setIsLoading(true);
        const result = await migrateTransactionsToSupabase();
        setIsLoading(false);
        
        if (result && result.success && result.migrated > 0) {
          toast.success(`Successfully migrated ${result.migrated} transactions. Failed: ${result.errors}`);
          loadTransactions(); // Refresh transactions list
        } else {
          toast.error('No transactions were migrated. Check console for details.');
        }
      } catch (error) {
        console.error('Migration error:', error);
        setIsLoading(false);
        toast.error('Failed to migrate transactions. See console for details.');
      }
    }
  };
  
  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin" className="flex items-center text-blue-400 hover:text-blue-300 mb-2">
              <ChevronLeft className="w-5 h-5 mr-1" /> Admin Paneline Dön
            </Link>
            <h1 className="text-3xl font-bold text-white">İşlem Geçmişi</h1>
            <p className="text-gray-400">Tüm kullanıcıların işlemlerini görüntüle ve yönet</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshTransactions} 
              className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:opacity-50"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            
            <button
              onClick={exportCSV} 
              className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:opacity-50"
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>

            <button
              onClick={handleMigrateTransactions} 
              className="px-3 py-2 bg-purple-600 text-white rounded-md flex items-center disabled:opacity-50"
              disabled={isLoading}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Migrate from Local
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-700 text-white w-full pl-10 pr-4 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ara (açıklama, kullanıcı)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                İşlem Tipi
              </label>
              <select
                className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'earn' | 'spend')}
              >
                <option value="all">Tümü</option>
                <option value="earn">Kazanılan</option>
                <option value="spend">Harcanan</option>
                <option value="bonus">Bonus</option>
                <option value="event">Etkinlik</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Tarih Aralığı
              </label>
              <select
                className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
              >
                <option value="all">Tüm Zamanlar</option>
                <option value="today">Bugün</option>
                <option value="week">Son 7 Gün</option>
                <option value="month">Son 30 Gün</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="bg-gray-700 px-4 py-2 rounded-md w-full text-center">
                <span className="text-gray-400 block text-sm">Toplam İşlem</span>
                <span className="text-xl font-bold">{filteredTransactions.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Tarih
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Kullanıcı
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      İletişim
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      İşlem Tipi
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Coins className="w-4 h-4 mr-1" />
                      Miktar
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Açıklama
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-center">
                        <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">İşlem bulunamadı</h3>
                        <p className="text-gray-400">Farklı filtreler deneyerek içeriği görebilirsiniz</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{tx.userName || tx.userEmail.split('@')[0]}</div>
                        <div className="text-xs text-gray-400">{tx.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {tx.userPhone ? (
                            <a 
                              href={`tel:${formatPhoneNumber(tx.userPhone)}`}
                              className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-300 hover:bg-blue-800"
                            >
                              <Phone className="w-3 h-3 mr-1" /> {formatPhoneNumber(tx.userPhone)}
                            </a>
                          ) : (
                            <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-400">
                              <Phone className="w-3 h-3 mr-1" /> Telefon yok
                            </span>
                          )}
                          
                          {tx.userSocialMedia?.telegram && (
                            <a 
                              href={getSocialMediaLink('telegram', tx.userSocialMedia.telegram)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-sky-900 text-sky-300 hover:bg-sky-800"
                            >
                              <TelegramIcon className="w-3 h-3 mr-1" /> {tx.userSocialMedia.telegram}
                            </a>
                          )}
                          
                          {tx.userSocialMedia?.discord && (
                            <a 
                              href={getSocialMediaLink('discord', tx.userSocialMedia.discord)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-indigo-900 text-indigo-300 hover:bg-indigo-800"
                            >
                              <DiscordIcon className="w-3 h-3 mr-1" /> {tx.userSocialMedia.discord}
                            </a>
                          )}
                          
                          {(tx.userId || tx.userEmail) && (
                            <button 
                              onClick={() => {
                                // Get the user from localStorage to ensure we're using the correct format
                                try {
                                  const registeredUsersStr = localStorage.getItem('slotjack_registered_users');
                                  if (registeredUsersStr) {
                                    const registeredUsers = JSON.parse(registeredUsersStr);
                                    
                                    // Check if we can find this user in the registered users
                                    let foundUserId = null;
                                    
                                    Object.entries(registeredUsers).forEach(([email, userData]: [string, any]) => {
                                      if (
                                        (tx.userId && userData.id === tx.userId) || 
                                        (tx.userEmail && email === tx.userEmail)
                                      ) {
                                        foundUserId = userData.id;
                                        console.log('Found user ID:', foundUserId, 'for email:', tx.userEmail);
                                      }
                                    });
                                    
                                    if (foundUserId) {
                                      router.push(`/admin/users/${foundUserId}`);
                                    } else if (tx.userId) {
                                      // Fallback to using the transaction userId directly
                                      router.push(`/admin/users/${tx.userId}`);
                                      console.log('User not found in registered users, using transaction userId directly:', tx.userId);
                                    } else {
                                      toast.error(`Kullanıcı bulunamadı: ${tx.userEmail || 'E-posta bilgisi eksik'}`);
                                      console.error('User not found in registered users:', tx.userEmail);
                                    }
                                  } else if (tx.userId) {
                                    // Fallback if no registered users found
                                    router.push(`/admin/users/${tx.userId}`);
                                  } else {
                                    toast.error(`Kullanıcı verileri yüklenemedi: Kullanıcı kayıtları bulunamadı`);
                                  }
                                } catch (error) {
                                  console.error('Error getting user data:', error);
                                  // Fallback to direct navigation if we have userId
                                  if (tx.userId) {
                                    router.push(`/admin/users/${tx.userId}`);
                                  } else {
                                    toast.error(`Kullanıcı bilgilerine erişilemiyor: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                                  }
                                }
                              }}
                              className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 mt-1"
                            >
                              <Eye className="w-3 h-3 mr-1" /> Profili Gör
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.type === 'earn' && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                            <ArrowUp className="w-3 h-3 mr-1" /> Kazanç
                          </span>
                        )}
                        {tx.type === 'spend' && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">
                            <ArrowDown className="w-3 h-3 mr-1" /> Harcama
                          </span>
                        )}
                        {tx.type === 'bonus' && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-300">
                            <ArrowUp className="w-3 h-3 mr-1" /> Bonus
                          </span>
                        )}
                        {tx.type === 'event' && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-900 text-purple-300">
                            <ArrowUp className="w-3 h-3 mr-1" /> Etkinlik
                          </span>
                        )}
                        {tx.type === 'admin' && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 text-yellow-300">
                            <ArrowUp className="w-3 h-3 mr-1" /> Admin
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${tx.type === 'spend' ? 'text-red-400' : 'text-green-400'}`}>
                          {tx.type === 'spend' ? '-' : '+'}{Math.abs(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {tx.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 