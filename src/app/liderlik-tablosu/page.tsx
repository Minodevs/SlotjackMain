'use client';

import { useState, useEffect } from 'react';
import { Trophy, Search, Filter, ArrowUp, ArrowDown, Coins } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function LeaderboardPage() {
  const { leaderboard, refreshLeaderboard, user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'points' | 'winRate'>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => {
      clearTimeout(timer);
      // Clear loading states on unmount
      setIsLoading(false);
    };
  }, []);
  
  // Refresh leaderboard on page load
  useEffect(() => {
    if (isMounted && !isLoading) {
      // Only refresh once when component mounts
      refreshLeaderboard();
    }
    
    // Clean up function to ensure state is reset when leaving the page
    return () => {
      setIsLoading(false);
    };
  }, [isMounted, isLoading]);
  
  // Filter out system accounts and assign ranks
  const systemEmails = ['admin@example.com', 'sezarpaypals2@gmail.com', 'vip@example.com', 'normal@example.com', 'user1@example.com', 'user2@example.com'];
  const testDomains = ['example.com', 'test.com', 'demo.com'];
  
  // Filter out system accounts and then assign ranks
  const rankedLeaderboard = leaderboard
    .filter(player => {
      const isSystemAccount = systemEmails.includes(player.email.toLowerCase());
      const isTestDomain = testDomains.some(domain => player.email.toLowerCase().endsWith(`@${domain}`));
      return !isSystemAccount && !isTestDomain;
    })
    .map((player, index) => ({
      ...player,
      rank: index + 1,
      winRate: Math.floor(Math.random() * 30) + 40 // Random win rate between 40-70% for demo
    }));
  
  // Filter and sort data
  const filteredData = rankedLeaderboard
    .filter(player => 
      (player.name || player.email).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      if (sortBy === 'rank') return (a.rank - b.rank) * multiplier;
      if (sortBy === 'points') return (a.jackPoints - b.jackPoints) * multiplier;
      return (a.winRate - b.winRate) * multiplier;
    });
  
  // Handle sort change
  const handleSort = (column: 'rank' | 'points' | 'winRate') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  // Show loading state if not mounted or still loading data
  if (!isMounted || loading || isLoading) {
    return (
      <ClientLayout>
        <div className="container mx-auto flex justify-center items-center" style={{ minHeight: "calc(100vh - 200px)" }}>
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Liderlik Tablosu Yükleniyor...</p>
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Eğer sayfa yüklenemezse, aşağıdaki linklerden birini kullanın:</p>
              <div className="flex justify-center space-x-4 mt-3">
                <a href="/" className="px-3 py-1 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">Ana Sayfa</a>
                <a href="/turnuvalar" className="px-3 py-1 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">Turnuvalar</a>
                <a href="/market" className="px-3 py-1 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">Market</a>
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Trophy className="w-8 h-8 text-[#FF6B00] mr-2" />
            Liderlik Tablosu
          </h1>
          
          <div className="relative flex-1 max-w-md ml-6">
            <input
              type="text"
              placeholder="Oyuncu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] border border-gray-700"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
        
        {/* Emergency Navigation */}
        <div className="mb-4 p-3 bg-gray-800 rounded-lg flex items-center justify-between">
          <div className="text-sm">Sayfa geçişi sorunlarıyla karşılaşıyorsanız, aşağıdaki bağlantıları kullanabilirsiniz:</div>
          <div className="flex space-x-2">
            <a href="/" className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm">Ana Sayfa</a>
            <a href="/turnuvalar" className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm">Turnuvalar</a>
            <a href="/market" className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm">Market</a>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th 
                  className="py-3 px-4 text-left cursor-pointer" 
                  onClick={() => handleSort('rank')}
                >
                  <div className="flex items-center">
                    <span>Sıralama</span>
                    {sortBy === 'rank' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="w-4 h-4 ml-1" /> : 
                        <ArrowDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-4 text-left">Oyuncu</th>
                <th 
                  className="py-3 px-4 text-right cursor-pointer"
                  onClick={() => handleSort('points')}
                >
                  <div className="flex items-center justify-end">
                    <span>JackPoints</span>
                    {sortBy === 'points' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="w-4 h-4 ml-1" /> : 
                        <ArrowDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-right cursor-pointer"
                  onClick={() => handleSort('winRate')}
                >
                  <div className="flex items-center justify-end">
                    <span>Kazanma Oranı</span>
                    {sortBy === 'winRate' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="w-4 h-4 ml-1" /> : 
                        <ArrowDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((player) => (
                <tr key={player.id} className={`border-t border-gray-700 hover:bg-gray-750 ${player.email === user?.email ? 'bg-gray-750' : ''}`}>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className={`
                        w-8 h-8 flex items-center justify-center rounded-full mr-2
                        ${player.rank === 1 ? 'bg-yellow-500' : 
                          player.rank === 2 ? 'bg-gray-400' : 
                          player.rank === 3 ? 'bg-amber-700' : 'bg-gray-700'}
                      `}>
                        <span className="font-bold">{player.rank}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                        {(player.name || player.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium">{player.name || player.email.split('@')[0]}</span>
                        {player.email === user?.email && (
                          <span className="ml-2 text-xs bg-[#FF6B00]/20 text-[#FF6B00] px-2 py-0.5 rounded">Siz</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end">
                      <Coins className="w-4 h-4 text-[#FF6B00] mr-2" />
                      <span>{player.jackPoints.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`
                      px-2 py-1 rounded
                      ${player.winRate >= 60 ? 'bg-green-900/40 text-green-400' : 
                        player.winRate >= 50 ? 'bg-blue-900/40 text-blue-400' : 
                        'bg-red-900/40 text-red-400'}
                    `}>
                      {player.winRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="bg-gray-800 p-8 rounded-lg text-center mt-4">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Oyuncu bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun oyuncu bulunamadı.</p>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 