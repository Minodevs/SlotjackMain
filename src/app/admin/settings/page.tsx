'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import { 
  ChevronLeft, Globe, Palette, Mail, Phone, 
  Link as LinkIcon, Save, RefreshCw, AlertCircle, ImageIcon, Upload, Loader
} from 'lucide-react';
import Image from 'next/image';
import ClientLayout from '../../../components/ClientLayout';
import { toast } from 'react-hot-toast';
import { useSiteSettings, defaultSettings } from '@/components/SiteSettingsProvider';

export default function AdminSettingsPage() {
  const router = useRouter();
  const authContext = useAuth();
  const { settings: globalSettings, updateSettings: updateGlobalSettings } = useSiteSettings();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(globalSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || user.rank !== UserRank.ADMIN)) {
      router.push('/');
      return;
    }
    
    if (user && user.rank === UserRank.ADMIN) {
      // Ensure banners property exists, even for older settings objects
      const updatedSettings = {
        ...globalSettings,
        banners: globalSettings.banners || defaultSettings.banners
      };
      setSettings(updatedSettings);
      setLoading(false);
    }
  }, [user, loading, router, globalSettings]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setIsDirty(true);
    
    if (name.includes('.')) {
      // Handle nested properties (like socialLinks.facebook)
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      // Handle boolean checkboxes
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setSettings(prev => ({
          ...prev,
          [name]: checked
        }));
      } else {
        // Handle regular inputs
        setSettings(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };
  
  // Save settings
  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Update global settings
      updateGlobalSettings(settings);
      
      // Reset dirty state
      setIsDirty(false);
      
      // Show success message
      toast.success('Ayarlar başarıyla kaydedildi');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Ayarlar kaydedilirken bir hata oluştu');
      toast.error('Ayarlar kaydedilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset settings to default
  const resetToDefault = () => {
    if (window.confirm('Tüm ayarları varsayılana sıfırlamak istediğinizden emin misiniz?')) {
      setSettings(defaultSettings);
      setIsDirty(true);
      toast.success('Ayarlar varsayılana sıfırlandı (kaydetmeyi unutmayın)');
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
            <h1 className="text-3xl font-bold text-white">Genel Ayarlar</h1>
            <p className="text-gray-400">Site genelindeki ayarları yapılandırın</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={resetToDefault}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
              disabled={isSubmitting}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Varsayılana Sıfırla
            </button>
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
        
        <form onSubmit={saveSettings}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Globe className="w-5 h-5 text-blue-400 mr-2" />
                Genel Site Ayarları
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Site Adı
                  </label>
                  <input
                    type="text"
                    name="siteName"
                    className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.siteName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    name="maintenanceMode"
                    className="h-4 w-4 bg-gray-700 border-gray-500 rounded focus:ring-blue-500"
                    checked={settings.maintenanceMode}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-gray-300">
                    Bakım Modu Aktif
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    name="allowRegistration"
                    className="h-4 w-4 bg-gray-700 border-gray-500 rounded focus:ring-blue-500"
                    checked={settings.allowRegistration}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="allowRegistration" className="ml-2 block text-gray-300">
                    Yeni Kayıtlara İzin Ver
                  </label>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Alt Bilgi Metni
                  </label>
                  <textarea
                    name="footerText"
                    rows={2}
                    className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.footerText}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Theme Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Palette className="w-5 h-5 text-purple-400 mr-2" />
                Tema Ayarları
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Ana Renk
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="primaryColor"
                      className="h-10 w-10 border-0 cursor-pointer"
                      value={settings.primaryColor}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="primaryColor"
                      className="bg-gray-700 text-white flex-grow px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={settings.primaryColor}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    İkincil Renk
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="secondaryColor"
                      className="h-10 w-10 border-0 cursor-pointer"
                      value={settings.secondaryColor}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="secondaryColor"
                      className="bg-gray-700 text-white flex-grow px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={settings.secondaryColor}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="p-4 rounded-md mt-6" style={{ backgroundColor: settings.secondaryColor }}>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: settings.primaryColor }}>
                    Tema Önizleme
                  </h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <button 
                      type="button" 
                      className="px-3 py-1 rounded-md text-white"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      Örnek Buton
                    </button>
                    <div className="px-3 py-1 rounded-md border" style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}>
                      Örnek Metin
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Mail className="w-5 h-5 text-green-400 mr-2" />
                İletişim Bilgileri
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    İletişim E-posta
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.contactEmail}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    İletişim Telefon
                  </label>
                  <input
                    type="text"
                    name="contactPhone"
                    className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.contactPhone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Social Media Links */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <LinkIcon className="w-5 h-5 text-yellow-400 mr-2" />
                Sosyal Medya Bağlantıları
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    name="socialLinks.facebook"
                    className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.socialLinks.facebook}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="socialLinks.twitter"
                    className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.socialLinks.twitter}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="socialLinks.instagram"
                    className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.socialLinks.instagram}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    YouTube
                  </label>
                  <input
                    type="url"
                    name="socialLinks.youtube"
                    className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.socialLinks.youtube}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Telegram
                  </label>
                  <input
                    type="url"
                    name="socialLinks.telegram"
                    className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.socialLinks.telegram}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Kick
                  </label>
                  <input
                    type="url"
                    name="socialLinks.kick"
                    className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.socialLinks.kick}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Banner Management Section */}
            <div className="bg-gray-800 rounded-lg p-6 col-span-1 md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 text-pink-400 mr-2" />
                Banner Yönetimi
              </h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">
                  Ana sayfada görüntülenen banner'ları buradan yönetebilirsiniz. Mevcut banner'ları düzenleyebilir, yenilerini ekleyebilir veya silebilirsiniz.
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Existing Banners */}
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-700 font-medium">Mevcut Banner'lar</div>
                  
                  <div className="p-4 grid gap-4">
                    {(settings.banners || []).map((banner, index) => (
                      <div key={banner.id} className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
                        <div className="flex flex-col md:flex-row">
                          {/* Banner Preview */}
                          <div className="w-full md:w-1/3 bg-gray-900 p-3 flex items-center justify-center">
                            <div className="relative w-full h-32 bg-gray-800 rounded overflow-hidden">
                              <Image 
                                src={banner.imageUrl} 
                                alt={banner.title}
                                fill
                                style={{ 
                                  objectFit: 'cover'
                                }}
                                className="w-full h-full"
                                onError={(e) => {
                                  // Fallback for images that don't exist
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-image.jpg';
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Banner Form */}
                          <div className="w-full md:w-2/3 p-4">
                            <div className="mb-3">
                              <label className="block text-gray-400 text-sm font-medium mb-1">
                                Banner Başlığı
                              </label>
                              <input
                                type="text"
                                value={banner.title}
                                onChange={(e) => {
                                  const newBanners = [...settings.banners];
                                  newBanners[index].title = e.target.value;
                                  setSettings({...settings, banners: newBanners});
                                  setIsDirty(true);
                                }}
                                className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div className="mb-3">
                              <label className="block text-gray-400 text-sm font-medium mb-1">
                                Resim Yükleme
                              </label>
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="file"
                                    id={`file-upload-${banner.id}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      if (!e.target.files || e.target.files.length === 0) return;
                                      
                                      const file = e.target.files[0];
                                      const fileInput = document.getElementById(`file-upload-${banner.id}`) as HTMLInputElement;
                                      
                                      // Create a FormData object
                                      const formData = new FormData();
                                      formData.append('file', file);
                                      
                                      // Show loading state
                                      const uploadButton = document.getElementById(`upload-button-${banner.id}`);
                                      if (uploadButton) {
                                        uploadButton.innerHTML = '<span class="animate-spin mr-2">⟳</span> Yükleniyor...';
                                        uploadButton.setAttribute('disabled', 'true');
                                      }
                                      
                                      try {
                                        // Upload the file
                                        const response = await fetch('/api/upload', {
                                          method: 'POST',
                                          body: formData,
                                        });
                                        
                                        if (!response.ok) {
                                          throw new Error('Upload failed');
                                        }
                                        
                                        const data = await response.json();
                                        
                                        // Update the banner's imageUrl and dimensions
                                        const newBanners = [...settings.banners];
                                        newBanners[index].imageUrl = data.fileUrl;
                                        if (data.dimensions) {
                                          newBanners[index].dimensions = data.dimensions;
                                        }
                                        setSettings({...settings, banners: newBanners});
                                        setIsDirty(true);
                                        
                                        toast.success('Resim başarıyla yüklendi');
                                      } catch (error) {
                                        console.error('Error uploading file:', error);
                                        toast.error('Resim yüklenirken bir hata oluştu');
                                      } finally {
                                        // Reset the file input
                                        if (fileInput) fileInput.value = '';
                                        
                                        // Reset upload button
                                        if (uploadButton) {
                                          uploadButton.innerHTML = 'Resim Yükle';
                                          uploadButton.removeAttribute('disabled');
                                        }
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    id={`upload-button-${banner.id}`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center"
                                    onClick={() => {
                                      const fileInput = document.getElementById(`file-upload-${banner.id}`);
                                      if (fileInput) fileInput.click();
                                    }}
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Resim Yükle
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500">
                                  Veya resim URL'si girin:
                                </p>
                                <input
                                  type="text"
                                  value={banner.imageUrl}
                                  onChange={(e) => {
                                    const newBanners = [...settings.banners];
                                    newBanners[index].imageUrl = e.target.value;
                                    setSettings({...settings, banners: newBanners});
                                    setIsDirty(true);
                                  }}
                                  className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const newBanners = settings.banners.filter((_, i) => i !== index);
                                  setSettings({...settings, banners: newBanners});
                                  setIsDirty(true);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Add New Banner */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = Math.max(0, ...settings.banners.map(b => b.id)) + 1;
                      const newBanner = {
                        id: newId,
                        title: "Yeni Banner",
                        imageUrl: "/placeholder-image.jpg"
                      };
                      setSettings({...settings, banners: [...settings.banners, newBanner]});
                      setIsDirty(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
                  >
                    <span className="mr-2">+</span> Yeni Banner Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">Değişiklikleri Kaydet</h3>
                <p className="text-gray-400 text-sm">Tüm ayarlarınızı gözden geçirin ve kaydedin</p>
              </div>
              
              <button
                type="submit"
                className={`px-6 py-3 rounded-md flex items-center font-medium ${
                  isDirty 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!isDirty || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isDirty ? 'Değişiklikleri Kaydet' : 'Değişiklik Yok'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ClientLayout>
  );
} 