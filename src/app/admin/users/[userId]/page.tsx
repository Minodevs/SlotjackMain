'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Shield, User, Award, Gift, Users } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { useAuth } from '@/contexts/AuthContext';
import { UserRank } from '@/types/user';

// Prevent static generation of this page
export const dynamic = 'force-dynamic';

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // Get userId from params
  const userId = params?.userId ? String(params.userId) : '';

  useEffect(() => {
    if (!currentUser || currentUser.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }

    // Simulate loading user data
    const loadUserData = () => {
      try {
        // In a real app, fetch from API: 
        // const response = await fetch(`/api/users/${userId}`);
        // const data = await response.json();
        
        // For now, get from localStorage if any exist
        const storedUsers = localStorage.getItem('users');
        
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const user = users.find((u: any) => u.id === userId);
          
          if (user) {
            setUserData(user);
          } else {
            console.error('User not found');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, router, userId]);

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
            <Link href="/admin/users" className="flex items-center text-gray-400 hover:text-white mr-4">
              <ChevronLeft size={18} className="mr-1" />
              <span>Kullanıcı Listesine Dön</span>
            </Link>
            <h1 className="text-xl font-bold flex-1">Kullanıcı Profili</h1>
            <div className="bg-blue-900/30 px-3 py-1 rounded-md text-blue-300 text-sm flex items-center">
              <Shield size={14} className="mr-1.5" />
              <span>Admin Görünümü</span>
            </div>
          </div>
          
          <div className="bg-gray-750 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gray-800 rounded-full mr-4">
                <User size={24} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{userData?.name || 'Kullanıcı'}</h2>
                <p className="text-gray-400">{userData?.email || 'email@example.com'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Link 
                href={`/admin/users/${userId}/awards`}
                className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg flex items-center transition-colors"
              >
                <Award size={20} className="text-yellow-500 mr-3" />
                <span>Ödüller</span>
              </Link>
              
              <Link 
                href={`/admin/users/${userId}/bonuses`}
                className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg flex items-center transition-colors"
              >
                <Gift size={20} className="text-green-500 mr-3" />
                <span>Bonuslar</span>
              </Link>
              
              <Link 
                href={`/admin/users/${userId}/partners`}
                className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg flex items-center transition-colors"
              >
                <Users size={20} className="text-blue-500 mr-3" />
                <span>Referanslar</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
