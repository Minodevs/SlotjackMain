'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Award } from 'lucide-react';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { UserRank } from '@/types/user';

export default function AwardsClient({ params }: { params: { userId: string } }) {
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
            <h1 className="text-xl font-bold flex-1">Kullanıcı Ödülleri</h1>
          </div>
          
          <div className="bg-gray-750 border border-gray-700 rounded-lg p-5">
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-900/30 rounded-full mb-4">
                <Award size={32} className="text-yellow-400" />
              </div>
              
              <h2 className="text-xl font-semibold mb-2">Ödül Sistemi</h2>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Bu sayfadan kullanıcının kazandığı ödülleri ve başarılarını görüntüleyebilirsiniz.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Turnuva Ödülleri</h3>
                  <p className="text-sm text-gray-400">Kullanıcının kazandığı turnuva ödülleri</p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Başarı Rozetleri</h3>
                  <p className="text-sm text-gray-400">Kullanıcının unlocked ettiği başarı rozetleri</p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Özel Ödüller</h3>
                  <p className="text-sm text-gray-400">Admin tarafından verilen özel ödüller</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayoutWrapper>
  );
} 