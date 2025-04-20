'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import SpinWheel from '@/components/SpinWheel';
import { Gift, Coins, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SpinWheelPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [recentWin, setRecentWin] = useState<number | null>(null);
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user, loading } = authContext;
  
  // Handle successful spin
  const handleSuccessfulSpin = (reward: number) => {
    setRecentWin(reward);
  };
  
  // If not logged in, redirect to login
  if (!loading && !user) {
    router.push('/');
    return null;
  }
  
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-blue-400 hover:text-blue-300 mb-2">
            <ChevronLeft className="w-5 h-5 mr-1" /> Ana Sayfaya Dön
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Gift className="w-8 h-8 text-[#FF6B00] mr-2" />
            Günlük Çark Çevir
          </h1>
          <p className="text-gray-400 mt-1">Her gün çarkı çevir, JackCoin kazanma şansı yakala!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spin Wheel Component */}
          <div className="md:col-span-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <SpinWheel onSpin={handleSuccessfulSpin} />
          </div>
          
          {/* Info Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Çark Çevir Bilgileri</h2>
            
            {user && (
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-sm text-gray-400 mb-1">Mevcut JackCoin Bakiyeniz</h3>
                <div className="flex items-center text-yellow-400 font-bold text-xl">
                  <Coins className="w-5 h-5 mr-2" />
                  {user.jackPoints} JackCoin
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-white">Nasıl Oynanır?</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
                  <li>Her gün (24 saatte bir) çarkı çevirebilirsiniz</li>
                  <li>Çarkı çevirmek için butona tıklayın</li>
                  <li>Kazandığınız JackCoin otomatik olarak hesabınıza eklenir</li>
                  <li>JackCoin'lerinizi marketten indirim kodları almak için kullanabilirsiniz</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-white">Olası Ödüller</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                  <li>5 JackCoin</li>
                  <li>10 JackCoin</li>
                  <li>20 JackCoin</li>
                  <li>40 JackCoin</li>
                  <li>50 JackCoin</li>
                  <li>70 JackCoin</li>
                  <li>85 JackCoin</li>
                  <li>100 JackCoin</li>
                  <li>200 JackCoin (Nadir)</li>
                </ul>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-white flex items-center">
                  <Gift className="w-4 h-4 mr-1 text-[#FF6B00]" />
                  JackCoin Nasıl Kullanılır?
                </h3>
                <p className="text-gray-300 text-sm">
                  Market bölümünde JackCoin'lerinizi çeşitli indirim kodları ve özel ödüller için kullanabilirsiniz.
                </p>
                <Link href="/market" className="mt-3 inline-block px-4 py-2 bg-[#FF6B00] text-white rounded hover:bg-[#E05A00]">
                  Market'e Git
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 