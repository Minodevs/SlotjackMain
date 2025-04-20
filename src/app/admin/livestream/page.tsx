'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import { ChevronLeft, Save, Play, Pause, Youtube, Link as LinkIcon, Globe, AlertCircle } from 'lucide-react';
import ClientLayout from '../../../components/ClientLayout';
import { toast } from 'react-hot-toast';

export default function AdminLivestreamPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    isLive: false,
    url: ''
  });
  
  // YouTube video ID
  const [videoId, setVideoId] = useState<string | null>(null);
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user, livestream, updateLivestream } = authContext;
  
  // Check if user is admin and load current livestream settings
  useEffect(() => {
    if (!loading && (!user || user.rank !== UserRank.ADMIN)) {
      router.push('/');
      return;
    }
    
    if (user) {
      // Load current livestream settings
      setFormData({
        isLive: livestream.isLive,
        url: livestream.url
      });
      
      // Extract video ID if URL exists
      if (livestream.url) {
        const extractedId = getYouTubeId(livestream.url);
        setVideoId(extractedId);
      }
      
      setLoading(false);
    }
  }, [user, loading, router, livestream]);
  
  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // Update URL and extract video ID
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, url });
    
    // Extract video ID if it's a YouTube URL
    const extractedId = getYouTubeId(url);
    setVideoId(extractedId);
  };
  
  // Toggle livestream status
  const toggleLivestreamStatus = () => {
    setFormData({ ...formData, isLive: !formData.isLive });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate URL if livestream is active
      if (formData.isLive && !formData.url.trim()) {
        throw new Error('Canlı yayın için bir URL gereklidir');
      }
      
      // Validate YouTube URL
      if (formData.isLive && formData.url.trim() && !videoId) {
        throw new Error('Geçerli bir YouTube URL\'si gereklidir');
      }
      
      // Update livestream settings
      updateLivestream({
        isLive: formData.isLive,
        url: formData.url.trim()
      });
      
      toast.success(formData.isLive ? 'Canlı yayın başlatıldı' : 'Canlı yayın durduruldu');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Bilinmeyen bir hata oluştu');
      }
    } finally {
      setIsSubmitting(false);
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin" className="flex items-center text-blue-400 hover:text-blue-300 mb-2">
              <ChevronLeft className="w-5 h-5 mr-1" /> Admin Paneline Dön
            </Link>
            <h1 className="text-3xl font-bold text-white">Canlı Yayın Yönetimi</h1>
            <p className="text-gray-400">YouTube canlı yayın ayarlarını yönetin</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Hata oluştu</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Youtube className="w-5 h-5 text-red-500 mr-2" />
              Canlı Yayın Ayarları
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <div 
                    className={`w-12 h-6 rounded-full flex items-center transition duration-300 ease-in-out ${formData.isLive ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'}`}
                    onClick={toggleLivestreamStatus}
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow-md transform mx-0.5"></div>
                  </div>
                  <span>
                    {formData.isLive ? (
                      <span className="text-green-400 font-medium flex items-center">
                        <Play className="w-4 h-4 mr-1" fill="currentColor" />
                        Canlı Yayın Aktif
                      </span>
                    ) : (
                      <span className="text-gray-400 flex items-center">
                        <Pause className="w-4 h-4 mr-1" />
                        Canlı Yayın Devre Dışı
                      </span>
                    )}
                  </span>
                </label>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  YouTube Canlı Yayın URL'si
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="bg-gray-700 text-white w-full pl-10 pr-12 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.url}
                    onChange={handleUrlChange}
                  />
                  {formData.url && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {videoId ? (
                        <div className="text-green-500">
                          <Globe className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="text-red-500">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {formData.url && !videoId && (
                  <p className="mt-2 text-red-400 text-sm">Geçerli bir YouTube URL'si giriniz</p>
                )}
                {videoId && (
                  <p className="mt-2 text-green-400 text-sm">Video ID: {videoId}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Önizleme</h2>
            
            {videoId ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Youtube className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500">YouTube video önizlemesi</p>
                  <p className="text-gray-600 text-sm">Önizleme için geçerli bir YouTube URL'si girin</p>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Nasıl Görünecek</h3>
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <div className={`bg-black border-b border-red-800 py-2 px-4 flex items-center justify-center ${!formData.isLive && 'opacity-50'}`}>
                  <div className="flex items-center text-red-500">
                    <Pause className="w-5 h-5 mr-2" />
                    <span className="font-medium">Canlı Yayın</span>
                  </div>
                </div>
                <div className="bg-gray-900 p-4 text-center">
                  <p className="text-gray-400">
                    {formData.isLive 
                      ? 'Bu banner sitenin üst kısmında görünecek ve kullanıcılar tıklayarak canlı yayını açabilecek.' 
                      : 'Canlı yayın aktif olmadığı için banner gösterilmeyecek.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 