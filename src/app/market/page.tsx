'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Coins } from 'lucide-react';
import { MarketItem, MARKET_ITEMS_STORAGE_KEY } from '@/types/market';
import { toast } from 'react-hot-toast';
import ClientLayout from '@/components/ClientLayout';

export default function MarketPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get user from auth context
  const { user } = authContext || {};
  const userPoints = user?.jackPoints || 0;

  // Load market items from API and fall back to localStorage if API fails
  useEffect(() => {
    const loadMarketItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add timestamp to prevent caching
        const response = await fetch(`/api/market/items?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.items && Array.isArray(data.items)) {
          console.log('Loaded market items:', data.items.length);
          setMarketItems(data.items);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error loading market items:', error);
        setError('Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        
        // Try to load from localStorage as fallback
        try {
          const storedItems = localStorage.getItem(MARKET_ITEMS_STORAGE_KEY);
          if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
            if (Array.isArray(parsedItems) && parsedItems.length > 0) {
              setMarketItems(parsedItems);
              toast.success('Veriler çevrimdışı modda yüklendi');
            }
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadMarketItems();
  }, []);
  
  if (loading) {
    return (
      <ClientLayout>
        <div className="w-full flex items-center justify-center min-h-[500px] bg-gray-900">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-base text-gray-300">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const handlePurchase = (item: MarketItem) => {
    if (!user) {
      toast.error('Satın alma işlemi için giriş yapmalısınız');
      return;
    }
    
    if (userPoints < item.points) {
      toast.error('Yeterli JackPoint\'iniz bulunmamaktadır');
      return;
    }
    
    // Simple logic for purchase
    if (authContext?.updateJackPoints) {
      authContext.updateJackPoints(
        -item.points, 
        `${item.name} satın alındı`, 
        'spend'
      );
      toast.success('Satın alma işlemi başarılı! Telegram üzerinden bizimle iletişime geçin: @slotjack');
    }
  };
  
  return (
    <ClientLayout>
      <div className="bg-gray-900 min-h-screen pb-10">
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <h1 className="text-2xl font-bold text-white mb-4">Puan Marketi</h1>
          <p className="text-gray-400 mb-8">Kazandığınız puanlar ile markette bulunan kartlardan taleplerinizi gerçekleştirin!</p>
          
          {/* Warning Banner */}
          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <div className="bg-amber-500 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                <AlertTriangle className="text-black w-4 h-4" />
              </div>
              <div>
                <p className="text-amber-500 font-semibold text-sm mb-1">Üyeler Ayda 1 Kere Nakit Ödül Alabilir.</p>
                <p className="text-amber-200 text-xs">Multi hesapla kasım sağlayanların puanları iptal edilmeyecek ve etkinliklerden men edilecektir.</p>
              </div>
            </div>
          </div>
          
          {/* Market Item Grid - Desktop View */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketItems.map((item) => (
              <div key={`desktop-${item.id}`} className="rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700 flex flex-col">
                {/* Item Image */}
                <div className="relative w-full h-40 bg-blue-900">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Item Content */}
                <div className="p-4">
                  <h3 className="text-white text-lg font-bold mb-1">{item.name}</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        <span className="text-white font-bold">{item.points}</span>
                      </div>
                      
                      <button 
                        className="bg-[#FF6B00] hover:bg-[#E05A00] text-white px-4 py-2 rounded-md text-sm font-medium"
                        onClick={() => handlePurchase(item)}
                      >
                        Satın Al
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Market Item Grid - Mobile View */}
          <div className="flex flex-col md:hidden space-y-5">
            {marketItems.map((item) => (
              <div key={`mobile-${item.id}`} className="rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700 flex flex-col">
                {/* Item Banner Image - Larger for mobile */}
                <div className="relative w-full" style={{ backgroundColor: '#192350' }}>
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full object-contain py-6"
                    style={{ maxHeight: '180px' }}
                  />
                </div>
                
                {/* Item Content */}
                <div className="p-5">
                  <h3 className="text-white text-xl font-bold mb-2">{item.name}</h3>
                  
                  <div className="text-gray-400 text-sm mb-4">
                    {item.description}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="bg-gray-700/70 py-2 px-4 rounded-full flex items-center">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        <span className="text-white font-bold">{item.points}</span>
                      </div>
                    </div>
                    
                    <button 
                      className="bg-[#FF6B00] hover:bg-[#E05A00] text-white px-6 py-3 rounded-full text-sm font-medium"
                      onClick={() => handlePurchase(item)}
                    >
                      Satın Al
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Error/No items message */}
          {(error || marketItems.length === 0) && (
            <div className="bg-gray-800 rounded-lg p-8 text-center mt-8">
              <p className="text-gray-400">{error || "Henüz market ürünü bulunmamaktadır."}</p>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
} 