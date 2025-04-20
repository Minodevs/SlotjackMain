'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { UserRank } from '@/types/user';

// This is used for static export
export const generateStaticParams = () => {
  return [
    { userId: '1' },
    { userId: '2' },
    { userId: '3' },
    { userId: 'example-user' },
    { userId: 'admin-user' },
  ];
};

export default function BonusesPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Get userId from params
  const userId = params?.userId ? String(params.userId) : '';

  useEffect(() => {
    if (!currentUser || currentUser.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }
    
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [currentUser, router]);

  if (loading) {
    return (
      <ClientLayoutWrapper>
        <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayoutWrapper>
    );
  }

  return (
    <ClientLayoutWrapper>
      <div className="container mx-auto py-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center mb-6">
            <Link href={`/admin/users/${userId}`} className="flex items-center text-gray-400 hover:text-white mr-4">
              <ChevronLeft size={18} className="mr-1" />
              <span>Kullanıcı Profiline Dön</span>
            </Link>
            <h1 className="text-xl font-bold flex-1">Kullanıcı Bonusları</h1>
          </div>
          
          <div className="bg-gray-750 border border-gray-700 rounded-lg p-5">
            <div className="text-center p-8">
              <h2 className="text-xl font-semibold mb-2">Bonus Yönetimi</h2>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Bu sayfadan kullanıcıların bonuslarını yönetebilirsiniz. 
                Bonus sistemi henüz geliştirme aşamasındadır.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Yatırım Bonusları</h3>
                  <p className="text-sm text-gray-400">Kullanıcıların yatırımlarına bağlı olarak verilen bonuslar</p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Turnuva Bonusları</h3>
                  <p className="text-sm text-gray-400">Turnuvalara katılım ve başarılara bağlı olarak verilen bonuslar</p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">VIP Bonusları</h3>
                  <p className="text-sm text-gray-400">VIP kullanıcılara özel olarak sunulan bonuslar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayoutWrapper>
  );
} 