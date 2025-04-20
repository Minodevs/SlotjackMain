'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRank } from '@/types/user';
import { ChevronLeft, Save, Edit, Trash2, Plus, X, MoveUp, MoveDown } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Local storage key for homepage settings
const HOMEPAGE_TABS_KEY = 'homepage_tabs_settings';

// Tab content type
interface TabContent {
  id: string;
  title: string;
  content: string;
  linkText: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
}

// Default tabs if none exist in storage
const defaultTabs: TabContent[] = [
  {
    id: '1',
    title: 'Öne Çıkanlar',
    content: '<h4 class="text-2xl font-semibold mb-3">Haftanın En İyileri</h4><div class="mb-4"><a href="/liderlik-tablosu" class="text-blue-400 hover:text-blue-300 text-sm inline-block mb-3">Tüm Liderlik Tablosu</a></div><h4 class="text-2xl font-semibold mt-6 mb-3">Yaklaşan Etkinlik</h4><div class="bg-[#111111] p-5 rounded-lg"><p class="font-bold text-xl">Haftalık Mega Turnuva</p><p class="text-sm text-gray-400 mt-1">23 Haziran 2024 - Ödül Havuzu: 25,000 JP</p><button class="mt-3 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">Hemen Katıl!</button></div>',
    linkText: 'Tüm Etkinlikler',
    linkUrl: '/etkinlikler',
    isActive: true,
    order: 0
  },
  {
    id: '2',
    title: 'Turnuvalar',
    content: '<h4 class="text-2xl font-semibold mb-3">Aktif & Yaklaşan Turnuvalar</h4><div class="mb-5 bg-[#111111] p-4 rounded-lg"><h5 class="font-bold text-lg">Haftalık Mega Turnuva</h5><p class="text-sm text-gray-400 mt-1">Tarih: 23 Haziran 2024 | Ödül: 25,000 JP | Giriş: 50 JP</p><p class="text-sm text-gray-400 mt-0.5">Katılımcı: 128</p><button class="mt-3 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">Katıl</button></div>',
    linkText: 'Tüm Turnuvalar',
    linkUrl: '/turnuvalar',
    isActive: true,
    order: 1
  },
  {
    id: '3',
    title: 'Etkinlikler',
    content: '<h4 class="text-2xl font-semibold mb-3">Özel Etkinlikler</h4><div class="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-lg mb-4"><h5 class="font-bold text-xl text-white">Hafta Sonu Jackpot Çılgınlığı!</h5><p class="text-sm text-purple-100 mt-1">Bu hafta sonu tüm slot oyunlarında %20 ekstra JackPoint kazanın!</p><span class="text-xs text-purple-200 block mt-2">22 Haziran - 23 Haziran</span></div>',
    linkText: 'Tüm Etkinlikler',
    linkUrl: '/etkinlikler',
    isActive: true,
    order: 2
  },
  {
    id: '4',
    title: 'Haberler',
    content: '<h4 class="text-2xl font-semibold mb-3">Son Haberler & Duyurular</h4><div class="mb-4 bg-[#111111] p-4 rounded-lg"><h5 class="font-bold text-lg">Mobil Uygulamamız Güncellendi!</h5><p class="text-sm text-gray-400 mt-1">Daha hızlı ve stabil bir deneyim için uygulamayı güncellemeyi unutmayın.</p><span class="text-xs text-gray-500 mt-2 block">20 Haziran 2024</span></div>',
    linkText: 'Tüm Haberler',
    linkUrl: '/haberler',
    isActive: true,
    order: 3
  }
];

export default function AdminHomepageEditor() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [tabs, setTabs] = useState<TabContent[]>([]);
  const [editingTab, setEditingTab] = useState<TabContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Load tabs from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTabs = localStorage.getItem(HOMEPAGE_TABS_KEY);
      if (savedTabs) {
        setTabs(JSON.parse(savedTabs));
      } else {
        setTabs(defaultTabs);
        localStorage.setItem(HOMEPAGE_TABS_KEY, JSON.stringify(defaultTabs));
      }
    }
  }, []);
  
  // Check if user is admin
  useEffect(() => {
    if (!loading && user) {
      if (user.rank !== UserRank.ADMIN) {
        router.push('/');
        toast.error('Bu sayfaya erişim yetkiniz yok.');
      }
    }
  }, [user, loading, router]);
  
  // Save tabs to localStorage
  const saveTabs = (updatedTabs: TabContent[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HOMEPAGE_TABS_KEY, JSON.stringify(updatedTabs));
      setTabs(updatedTabs);
      toast.success('Değişiklikler kaydedildi.');
    }
  };
  
  // Add or update a tab
  const saveTab = (tab: TabContent) => {
    let updatedTabs;
    
    if (editingTab) {
      // Update existing tab
      updatedTabs = tabs.map(t => (t.id === tab.id ? tab : t));
    } else {
      // Add new tab
      const newTab = {
        ...tab,
        id: crypto.randomUUID(),
        order: tabs.length
      };
      updatedTabs = [...tabs, newTab];
    }
    
    saveTabs(updatedTabs);
    setEditingTab(null);
    setIsModalOpen(false);
  };
  
  // Delete a tab
  const deleteTab = (id: string) => {
    if (confirm('Bu sekmeyi silmek istediğinizden emin misiniz?')) {
      const updatedTabs = tabs.filter(tab => tab.id !== id);
      // Reorder remaining tabs
      const reorderedTabs = updatedTabs.map((tab, index) => ({
        ...tab,
        order: index
      }));
      saveTabs(reorderedTabs);
    }
  };
  
  // Toggle tab active state
  const toggleTabActive = (id: string) => {
    const updatedTabs = tabs.map(tab => {
      if (tab.id === id) {
        return { ...tab, isActive: !tab.isActive };
      }
      return tab;
    });
    saveTabs(updatedTabs);
  };
  
  // Move tab up in order
  const moveTabUp = (id: string) => {
    const index = tabs.findIndex(tab => tab.id === id);
    if (index <= 0) return;
    
    const updatedTabs = [...tabs];
    const temp = updatedTabs[index - 1].order;
    updatedTabs[index - 1].order = updatedTabs[index].order;
    updatedTabs[index].order = temp;
    
    saveTabs(updatedTabs.sort((a, b) => a.order - b.order));
  };
  
  // Move tab down in order
  const moveTabDown = (id: string) => {
    const index = tabs.findIndex(tab => tab.id === id);
    if (index >= tabs.length - 1) return;
    
    const updatedTabs = [...tabs];
    const temp = updatedTabs[index + 1].order;
    updatedTabs[index + 1].order = updatedTabs[index].order;
    updatedTabs[index].order = temp;
    
    saveTabs(updatedTabs.sort((a, b) => a.order - b.order));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const tab: TabContent = {
      id: editingTab?.id || '',
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      linkText: formData.get('linkText') as string,
      linkUrl: formData.get('linkUrl') as string,
      isActive: formData.get('isActive') === 'true',
      order: editingTab?.order || 0
    };
    
    saveTab(tab);
  };
  
  // Reset tabs to default
  const resetToDefault = () => {
    if (confirm('Tüm sekmeleri varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      saveTabs(defaultTabs);
      toast.success('Sekmeler varsayılan değerlere sıfırlandı.');
    }
  };
  
  const handleAddTab = () => {
    setEditingTab(null);
    setIsModalOpen(true);
  };
  
  const handleEditTab = (tab: TabContent) => {
    setEditingTab(tab);
    setIsModalOpen(true);
  };
  
  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/admin" className="flex items-center mr-4 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Admin Panele Dön
          </Link>
          <h1 className="text-2xl font-bold flex-1">Anasayfa Sekme Yönetimi</h1>
          <button
            onClick={resetToDefault}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Varsayılana Sıfırla
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Anasayfa Sekmeleri</h2>
            <button
              onClick={handleAddTab}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-1" /> Yeni Sekme Ekle
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="text-left p-3 rounded-tl-lg">Sıra</th>
                  <th className="text-left p-3">Başlık</th>
                  <th className="text-left p-3">Link Metni</th>
                  <th className="text-left p-3">Link URL</th>
                  <th className="text-center p-3">Durum</th>
                  <th className="text-right p-3 rounded-tr-lg">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {tabs.sort((a, b) => a.order - b.order).map(tab => (
                  <tr key={tab.id} className="border-t border-gray-700">
                    <td className="p-3">{tab.order + 1}</td>
                    <td className="p-3 font-medium">{tab.title}</td>
                    <td className="p-3">{tab.linkText}</td>
                    <td className="p-3">{tab.linkUrl}</td>
                    <td className="p-3 text-center">
                      <span 
                        className={`px-2 py-1 rounded text-xs ${
                          tab.isActive 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-red-600/20 text-red-400'
                        }`}
                      >
                        {tab.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => moveTabUp(tab.id)}
                        className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 inline-flex items-center"
                        disabled={tab.order === 0}
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveTabDown(tab.id)}
                        className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 inline-flex items-center"
                        disabled={tab.order === tabs.length - 1}
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleTabActive(tab.id)}
                        className={`px-2 py-1 rounded inline-flex items-center ${
                          tab.isActive
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {tab.isActive ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                      </button>
                      <button
                        onClick={() => handleEditTab(tab)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Düzenle
                      </button>
                      <button
                        onClick={() => deleteTab(tab.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Önizleme</h2>
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex flex-wrap gap-2 mb-4">
              {tabs
                .filter(tab => tab.isActive)
                .sort((a, b) => a.order - b.order)
                .map(tab => (
                  <button
                    key={tab.id}
                    className="px-6 py-2 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white"
                  >
                    {tab.title}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit/Add Tab Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingTab ? 'Sekme Düzenle' : 'Yeni Sekme Ekle'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Sekme Başlığı</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingTab?.title || ''}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">HTML İçerik</label>
                <textarea
                  name="content"
                  defaultValue={editingTab?.content || ''}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] font-mono text-sm"
                  required
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">
                  HTML içeriğini doğrudan düzenleyebilirsiniz. Tailwind CSS sınıfları desteklenir.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Link Metni</label>
                  <input
                    type="text"
                    name="linkText"
                    defaultValue={editingTab?.linkText || ''}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Link URL</label>
                  <input
                    type="text"
                    name="linkUrl"
                    defaultValue={editingTab?.linkUrl || ''}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Durum</label>
                <select
                  name="isActive"
                  defaultValue={editingTab?.isActive ? 'true' : 'false'}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Pasif</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 mr-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-1" /> 
                  {editingTab ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 