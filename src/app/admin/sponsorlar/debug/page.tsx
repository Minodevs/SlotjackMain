'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import { getSponsors } from '@/services/SponsorsService';
import { ChevronLeft } from 'lucide-react';
import ClientLayout from '../../../../components/ClientLayout';

export default function SponsorDebugPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [localStorageRaw, setLocalStorageRaw] = useState<string>('');
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Load sponsors and raw data from localStorage
  useEffect(() => {
    if (!loading && (!user || user.rank !== UserRank.ADMIN)) {
      router.push('/');
      return;
    }
    
    if (user) {
      try {
        // Get formatted sponsors
        const sponsorData = getSponsors();
        setSponsors(sponsorData);
        
        // Get raw localStorage data
        const rawData = localStorage.getItem('sponsors') || '';
        setLocalStorageRaw(rawData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user, loading, router]);
  
  const refreshData = () => {
    try {
      // Get formatted sponsors
      const sponsorData = getSponsors();
      setSponsors(sponsorData);
      
      // Get raw localStorage data
      const rawData = localStorage.getItem('sponsors') || '';
      setLocalStorageRaw(rawData);
    } catch (error) {
      console.error('Error refreshing data:', error);
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
        <div className="mb-6">
          <Link href="/admin/sponsorlar" className="flex items-center text-blue-400 hover:text-blue-300 mb-2">
            <ChevronLeft className="w-5 h-5 mr-1" /> Sponsor Yönetimine Dön
          </Link>
          <h1 className="text-2xl font-bold text-white">Sponsor Veri Tanılama</h1>
          <p className="text-gray-400">LocalStorage'daki ham sponsorlar verisini görüntüleyin</p>
        </div>
        
        <div className="flex justify-end mb-4">
          <button 
            onClick={refreshData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Verileri Yenile
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-4">İşlenmiş Sponsor Verileri</h2>
            <p className="text-sm text-gray-400 mb-2">Toplam Sponsor Sayısı: {sponsors.length}</p>
            <div className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-[500px]">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(sponsors, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-4">Ham LocalStorage Verileri</h2>
            <p className="text-sm text-gray-400 mb-2">Veri Boyutu: {localStorageRaw.length} karakter</p>
            <div className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-[500px]">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {localStorageRaw ? JSON.stringify(JSON.parse(localStorageRaw), null, 2) : 'Veri bulunamadı'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 