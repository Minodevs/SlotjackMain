'use client';

import { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Clock, Filter } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Mock tournaments data
const tournamentData = [
  {
    id: 1,
    name: 'Haftalık Mega Turnuva',
    date: '23 Haziran 2024',
    time: '20:00',
    prizePool: 25000,
    entryFee: 50,
    participants: {
      current: 87,
      max: 128
    },
    status: 'upcoming', // upcoming, active, completed
    isVipOnly: false,
    description: 'Haftalık büyük turnuvamıza katılın ve büyük ödülleri kazanma şansı yakalayın!'
  },
  {
    id: 2,
    name: 'VIP Özel Turnuva',
    date: '25 Haziran 2024',
    time: '21:00',
    prizePool: 10000,
    entryFee: 0,
    participants: {
      current: 32,
      max: 64
    },
    status: 'upcoming',
    isVipOnly: true,
    description: 'Sadece VIP üyelerimize özel turnuva ile ayrıcalıklı ödüller sizi bekliyor.'
  },
  {
    id: 3,
    name: 'Aylık Şampiyona',
    date: '30 Haziran 2024',
    time: '19:00',
    prizePool: 50000,
    entryFee: 100,
    participants: {
      current: 156,
      max: 256
    },
    status: 'upcoming',
    isVipOnly: false,
    description: 'Ayın en büyük turnuvası! Büyük ödül havuzu ve rekabet sizi bekliyor.'
  },
  {
    id: 4,
    name: 'Hızlı Turnuva',
    date: '20 Haziran 2024',
    time: '18:00',
    prizePool: 5000,
    entryFee: 25,
    participants: {
      current: 48,
      max: 64
    },
    status: 'upcoming',
    isVipOnly: false,
    description: 'Hızlı tempolu turnuva ile kısa sürede büyük kazançlar elde edin.'
  },
  {
    id: 5,
    name: 'Düşük Giriş Ücretli Turnuva',
    date: '22 Haziran 2024',
    time: '17:00',
    prizePool: 3000,
    entryFee: 10,
    participants: {
      current: 78,
      max: 128
    },
    status: 'upcoming',
    isVipOnly: false,
    description: 'Düşük giriş ücreti, yüksek ödül havuzu! Herkes için uygun turnuva.'
  },
  {
    id: 6,
    name: 'Geçmiş Turnuva',
    date: '15 Haziran 2024',
    time: '20:00',
    prizePool: 15000,
    entryFee: 50,
    participants: {
      current: 128,
      max: 128
    },
    status: 'completed',
    isVipOnly: false,
    winner: 'emre_85',
    description: 'Tamamlanmış turnuva örneği.'
  },
];

type TournamentFilter = 'all' | 'upcoming' | 'active' | 'completed' | 'vip';

export default function TournamentsPage() {
  const { loading } = useAuth();
  const [filter, setFilter] = useState<TournamentFilter>('all');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Filter tournaments based on selected filter
  const filteredTournaments = tournamentData.filter(tournament => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return tournament.status === 'upcoming';
    if (filter === 'active') return tournament.status === 'active';
    if (filter === 'completed') return tournament.status === 'completed';
    if (filter === 'vip') return tournament.isVipOnly;
    return true;
  });
  
  // Handle loading state
  if (loading || !isMounted) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[500px]">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Trophy className="w-8 h-8 text-[#FF6B00] mr-2" />
            Turnuvalar
          </h1>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              filter === 'all'
                ? 'bg-[#FF6B00] text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Tümü
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              filter === 'upcoming'
                ? 'bg-[#FF6B00] text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Yaklaşan
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              filter === 'active'
                ? 'bg-[#FF6B00] text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Aktif
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              filter === 'completed'
                ? 'bg-[#FF6B00] text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Tamamlandı
          </button>
          <button
            onClick={() => setFilter('vip')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              filter === 'vip'
                ? 'bg-[#FF6B00] text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="w-4 h-4 flex items-center justify-center mr-2 text-xs font-bold">VIP</span>
            VIP Özel
          </button>
        </div>
        
        {/* Tournaments grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <div key={tournament.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
              <div className="p-6 border-b border-gray-700 relative">
                {tournament.isVipOnly && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-purple-900/60 text-purple-300 text-xs rounded-full">
                      VIP
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-semibold mb-2 pr-16">{tournament.name}</h2>
                <p className="text-gray-400 text-sm mb-4">{tournament.description}</p>
                <div className="flex flex-wrap gap-y-2">
                  <div className="w-1/2 flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-[#FF6B00] mr-2" />
                    <span>{tournament.date}</span>
                  </div>
                  <div className="w-1/2 flex items-center text-sm">
                    <Clock className="w-4 h-4 text-[#FF6B00] mr-2" />
                    <span>{tournament.time}</span>
                  </div>
                  <div className="w-1/2 flex items-center text-sm">
                    <Users className="w-4 h-4 text-[#FF6B00] mr-2" />
                    <span>{tournament.participants.current}/{tournament.participants.max}</span>
                  </div>
                  <div className="w-1/2 flex items-center text-sm">
                    <Trophy className="w-4 h-4 text-[#FF6B00] mr-2" />
                    <span>{tournament.prizePool.toLocaleString()} JP</span>
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Giriş Ücreti</div>
                  <div className="font-semibold">
                    {tournament.entryFee > 0 ? `${tournament.entryFee} JP` : 'Ücretsiz'}
                  </div>
                </div>
                {tournament.status === 'completed' ? (
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Kazanan</div>
                    <div className="font-semibold text-green-400">{tournament.winner}</div>
                  </div>
                ) : (
                  <button 
                    className={`px-4 py-2 rounded-lg ${
                      tournament.status === 'upcoming' 
                        ? 'bg-[#FF6B00] hover:bg-[#FF8533] text-white'
                        : tournament.status === 'active'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    } transition-colors`}
                    disabled={tournament.status === 'completed'}
                  >
                    {tournament.status === 'upcoming' ? 'Katıl' : tournament.status === 'active' ? 'İzle' : 'Tamamlandı'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredTournaments.length === 0 && (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Turnuva bulunamadı</h3>
            <p className="text-gray-500">Seçilen filtreye uygun turnuva bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 