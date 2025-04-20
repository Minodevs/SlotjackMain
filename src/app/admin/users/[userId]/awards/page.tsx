'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Shield, Award, Star, Trophy, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { UserRank, UserAward, AwardType } from '@/types/user';
import AwardModal from './AwardModal';
import { toast } from 'react-hot-toast';

// Type definition for the params
type ParamsType = {
  params: {
    userId: string;
  };
};

// Define static parameters for static export
export function generateStaticParams() {
  // In a real app, you would fetch this data from your database
  // For static builds, we include several example userIds for pre-rendering
  return [
    { userId: 'example-user-id' },
    { userId: 'test-user' },
    { userId: 'admin-user' },
    { userId: '12345' },
    { userId: 'johndoe' }
  ];
}

export default function UserAwardsPage({ params }: ParamsType) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [awards, setAwards] = useState<UserAward[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAward, setEditAward] = useState<UserAward | null>(null);
  
  // Get userId from params
  const userId = params?.userId ? String(params.userId) : '';

  useEffect(() => {
    if (!currentUser || currentUser.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }

    // Simulate loading awards from storage/API
    const loadAwards = () => {
      try {
        // In a real app, fetch from API: 
        // const response = await fetch(`/api/users/${userId}/awards`);
        // const data = await response.json();
        
        // For now, get from localStorage if any exist
        const storedAwards = localStorage.getItem(`user_${userId}_awards`);
        
        if (storedAwards) {
          setAwards(JSON.parse(storedAwards));
        } else {
          // Sample data if none exists
          const sampleAwards: UserAward[] = [
            {
              id: '1',
              userId: userId,
              type: 'achievement',
              title: 'İlk Katılım',
              description: 'Platformumuza ilk katılımınız',
              icon: 'star',
              color: '#FFD700', // Gold
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '2',
              userId: userId,
              type: 'medal',
              title: 'Etkinlik Katılımcısı',
              description: '5 etkinliğe katıldınız',
              icon: 'trophy',
              color: '#C0C0C0', // Silver
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '3',
              userId: userId,
              type: 'trophy',
              title: 'VIP Statüsü',
              description: '1000 puan biriktirdiniz',
              icon: 'award',
              color: '#CD7F32', // Bronze
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ];
          
          setAwards(sampleAwards);
          localStorage.setItem(`user_${userId}_awards`, JSON.stringify(sampleAwards));
        }
      } catch (error) {
        console.error('Error loading awards:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAwards();
  }, [currentUser, router, userId]);

  const handleAddAward = () => {
    setEditAward(null);
    setIsModalOpen(true);
  };

  const handleEditAward = (award: UserAward) => {
    setEditAward(award);
    setIsModalOpen(true);
  };

  const handleDeleteAward = (awardId: string) => {
    if (confirm('Bu ödülü silmek istediğinizden emin misiniz?')) {
      const updatedAwards = awards.filter(award => award.id !== awardId);
      setAwards(updatedAwards);
      localStorage.setItem(`user_${userId}_awards`, JSON.stringify(updatedAwards));
      toast.success('Ödül başarıyla silindi');
    }
  };

  const handleSaveAward = (award: UserAward) => {
    const isEdit = Boolean(award.id);
    const updatedAwards = isEdit
      ? awards.map(a => a.id === award.id ? award : a)
      : [...awards, { ...award, id: Date.now().toString() }];
    
    setAwards(updatedAwards);
    
    try {
      localStorage.setItem(`user_${userId}_awards`, JSON.stringify(updatedAwards));
      toast.success(isEdit ? 'Ödül güncellendi!' : 'Yeni ödül eklendi!');
    } catch (error) {
      console.error('Failed to save awards:', error);
      toast.error('Ödül kaydedilemedi!');
    }
    
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'star':
        return <Star className="h-8 w-8" />;
      case 'trophy':
        return <Trophy className="h-8 w-8" />;
      case 'award':
      default:
        return <Award className="h-8 w-8" />;
    }
  };

  const getTypeLabel = (type: AwardType) => {
    switch (type) {
      case 'achievement':
        return 'Başarı';
      case 'medal':
        return 'Madalya';
      case 'trophy':
        return 'Ödül';
      default:
        return 'Ödül';
    }
  };

  // Check if user is admin
  const hasPermission = currentUser?.rank === UserRank.ADMIN;

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
            <h1 className="text-xl font-bold flex-1">Kullanıcı Ödülleri</h1>
            <div className="bg-blue-900/30 px-3 py-1 rounded-md text-blue-300 text-sm flex items-center">
              <Shield size={14} className="mr-1.5" />
              <span>Admin Görünümü</span>
            </div>
          </div>
          
          <div className="bg-gray-750 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Award size={24} className="text-orange-500 mr-2" />
                <h2 className="text-lg font-semibold">Kullanıcı ID: {userId}</h2>
              </div>
              
              {hasPermission && (
                <button 
                  onClick={handleAddAward}
                  className="flex items-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <Plus size={16} className="mr-1.5" />
                  <span>Ödül Ekle</span>
                </button>
              )}
            </div>
            
            {awards.length === 0 ? (
              <div className="text-center py-8 bg-gray-800/50 rounded-lg">
                <Award size={48} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400 mb-2">Bu kullanıcı için ödül kaydı bulunmamaktadır.</p>
                <p className="text-sm text-gray-500">Kullanıcıya yeni bir ödül eklemek için yukarıdaki "Ödül Ekle" butonunu kullanabilirsiniz.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {awards.map((award) => (
                  <div 
                    key={award.id} 
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow relative group"
                  >
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {hasPermission && (
                        <>
                          <button
                            onClick={() => handleEditAward(award)}
                            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-400 hover:text-white"
                            title="Düzenle"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAward(award.id)}
                            className="p-1.5 bg-gray-700 hover:bg-red-700 rounded-md text-gray-400 hover:text-white"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                    
                    <div className="flex justify-between mb-3">
                      <div 
                        className="p-3 rounded-full" 
                        style={{ backgroundColor: `${award.color}20` }} // 20% opacity of the color
                      >
                        <div style={{ color: award.color }}>
                          {getIconComponent(award.icon)}
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded bg-gray-700/50 text-gray-300 font-medium">
                        {getTypeLabel(award.type)}
                      </div>
                    </div>
                    
                    <h3 className="text-white font-bold text-lg mb-1">{award.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{award.description}</p>
                    
                    <div className="flex items-center text-gray-500 text-xs mt-auto">
                      <Calendar size={12} className="mr-1" />
                      <span>{formatDate(award.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 text-gray-400 text-sm">
              <p>Toplam ödül sayısı: <span className="text-white font-medium">{awards.length}</span></p>
            </div>
          </div>
        </div>
      </div>
      
      <AwardModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAward}
        userId={userId}
        editAward={editAward}
      />
    </ClientLayout>
  );
} 