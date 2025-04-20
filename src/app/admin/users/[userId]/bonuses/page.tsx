'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Shield, GitBranch, Coins, Gift, Calendar, AlertCircle, Plus, User, CalendarClock } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { UserRank } from '@/types/user';

type Bonus = {
  id: string;
  userId: string;
  points: number;
  reason: string;
  createdAt: string;
};

// Type definition for the params
type ParamsType = {
  params: {
    userId: string;
  };
};

export default function UserBonusesPage({ params }: ParamsType) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  
  // Get userId from params
  const userId = params?.userId ? String(params.userId) : '';

  useEffect(() => {
    if (!currentUser || currentUser.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }

    // Simulate loading bonuses from storage/API
    const loadBonuses = () => {
      try {
        // In a real app, fetch from API: 
        // const response = await fetch(`/api/users/${userId}/bonuses`);
        // const data = await response.json();
        
        // For now, get from localStorage if any exist
        const storedBonuses = localStorage.getItem(`user_${userId}_bonuses`);
        
        if (storedBonuses) {
          setBonuses(JSON.parse(storedBonuses));
        } else {
          // Sample data if none exists
          const sampleBonuses: Bonus[] = [
            {
              id: '1',
              userId: userId,
              points: 100,
              reason: 'Hoş geldin bonusu',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '2',
              userId: userId,
              points: 50,
              reason: 'Etkinlik katılım ödülü',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '3',
              userId: userId,
              points: 25,
              reason: 'Günlük giriş bonusu',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ];
          
          setBonuses(sampleBonuses);
          localStorage.setItem(`user_${userId}_bonuses`, JSON.stringify(sampleBonuses));
        }
      } catch (error) {
        console.error('Error loading bonuses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBonuses();
  }, [currentUser, router, userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
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
      <div className="container mx-auto py-8">
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="flex items-center mb-6">
            <Link href={`/admin/users/${userId}`} className="flex items-center text-gray-400 hover:text-white mr-4">
              <ChevronLeft size={18} className="mr-1" />
              <span>Kullanıcı Profiline Dön</span>
            </Link>
            <h1 className="text-xl font-bold flex-1">Kullanıcı Bonusları</h1>
            <div className="bg-blue-900/30 px-3 py-1 rounded-md text-blue-300 text-sm flex items-center">
              <Shield size={14} className="mr-1.5" />
              <span>Admin Görünümü</span>
            </div>
          </div>
          
          <div className="bg-gray-750 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center mb-5">
              <Gift size={24} className="text-orange-500 mr-2" />
              <h2 className="text-lg font-semibold">Kullanıcı ID: {userId}</h2>
            </div>
            
            {bonuses.length === 0 ? (
              <p className="text-gray-400">Bu kullanıcı için bonus kaydı bulunmamaktadır.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700/50 text-left">
                      <th className="p-3 font-medium text-sm">Tarih</th>
                      <th className="p-3 font-medium text-sm">Puan</th>
                      <th className="p-3 font-medium text-sm">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {bonuses.map((bonus) => (
                      <tr key={bonus.id} className="hover:bg-gray-700/20">
                        <td className="p-3 text-gray-300">
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-2" />
                            {formatDate(bonus.createdAt)}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-green-400 font-medium">+{bonus.points}</span>
                        </td>
                        <td className="p-3 text-gray-300">{bonus.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              <div className="text-gray-400 text-sm">
                <p>Toplam bonus sayısı: <span className="text-white font-medium">{bonuses.length}</span></p>
              </div>
              <div className="text-gray-400 text-sm">
                <p>Toplam puan: <span className="text-green-400 font-medium">
                  {bonuses.reduce((total, bonus) => total + bonus.points, 0)}
                </span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 