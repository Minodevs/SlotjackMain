'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Shield, User } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { UserRank } from '@/types/user';

export default function UserPartnersPage({ params }: { params: { userId: string } }) {
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

    setLoading(false);
  }, [currentUser, router]);

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
            <h1 className="text-xl font-bold flex-1">Kullanıcı Partner Verileri</h1>
            <div className="bg-blue-900/30 px-3 py-1 rounded-md text-blue-300 text-sm flex items-center">
              <Shield size={14} className="mr-1.5" />
              <span>Admin Görünümü</span>
            </div>
          </div>
          
          <div className="bg-gray-750 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center mb-5">
              <User size={24} className="text-orange-500 mr-2" />
              <h2 className="text-lg font-semibold">Kullanıcı ID: {userId}</h2>
            </div>
            
            <p className="text-gray-400 mb-6">
              Bu kullanıcı için partner verileri henüz mevcut değil. Partner sistemi geliştirme aşamasındadır.
            </p>
            
            <div className="flex flex-col space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-300 font-medium mb-2">Partner Sistemi Özellikleri</div>
                <ul className="list-disc pl-5 text-gray-400">
                  <li>Kullanıcılar için özel davet bağlantıları</li>
                  <li>Davet edilen kullanıcıların aktivitelerine göre bonus puanlar</li>
                  <li>Toplam kayıt sayısı ve toplam kazanç istatistikleri</li>
                  <li>Çok seviyeli referans sistemi</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

export function generateStaticParams() {
  return [
    { userId: 'example-user-id' },
  ];
} 