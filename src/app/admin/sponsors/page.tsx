'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import { 
  ChevronLeft, Plus, Heart, Edit, Trash2, ExternalLink, Image as ImageIcon,
  Search, X, Check
} from 'lucide-react';
import ClientLayout from '../../../components/ClientLayout';
import Image from 'next/image';

// Sample sponsors for demonstration
const demoSponsors = [
  { id: '1', name: 'Acme Corporation', logoUrl: '/sponsor-logos/acme.jpg', website: 'https://example.com/acme', discount: 10, description: 'Global technology sponsor offering exclusive discounts for our VIP members.' },
  { id: '2', name: 'TechGiant', logoUrl: '/sponsor-logos/techgiant.jpg', website: 'https://example.com/techgiant', discount: 15, description: 'Electronics provider with special promotions for our community.' },
  { id: '3', name: 'SportsBrand', logoUrl: '/sponsor-logos/sportsbrand.jpg', website: 'https://example.com/sports', discount: 5, description: 'Sporting equipment and apparel with member-only offers.' },
];

export default function AdminSponsorsPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [sponsors, setSponsors] = useState(demoSponsors);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form state for adding/editing sponsor
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    logoUrl: '',
    website: '',
    discount: 0,
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  
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
    
    if (user) {
      setLoading(false);
    }
  }, [user, loading, router]);
  
  // Filter sponsors based on search
  const filteredSponsors = sponsors.filter(s => 
    searchQuery === '' || 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle form submit (add/edit sponsor)
  const handleSponsorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update existing sponsor
      setSponsors(prev => prev.map(s => 
        s.id === formData.id ? { ...formData } : s
      ));
    } else {
      // Add new sponsor
      const newSponsor = {
        ...formData,
        id: Date.now().toString(), // Generate a simple ID
      };
      setSponsors(prev => [...prev, newSponsor]);
    }
    
    // Reset form and close modal
    setFormData({
      id: '',
      name: '',
      logoUrl: '',
      website: '',
      discount: 0,
      description: ''
    });
    setIsEditing(false);
    setIsAddModalOpen(false);
  };
  
  // Handle edit sponsor
  const handleEditSponsor = (sponsor: typeof demoSponsors[0]) => {
    setFormData(sponsor);
    setIsEditing(true);
    setIsAddModalOpen(true);
  };
  
  // Handle delete sponsor
  const handleDeleteSponsor = (id: string) => {
    if (confirm('Bu sponsoru silmek istediğinizden emin misiniz?')) {
      setSponsors(prev => prev.filter(s => s.id !== id));
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
            <h1 className="text-3xl font-bold text-white">Sponsor Yönetimi</h1>
            <p className="text-gray-400">Sponsorları ekleyin, düzenleyin ve silin</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Sponsor ara..."
                className="bg-gray-700 text-white px-4 py-2 pl-10 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" /> Yeni Sponsor
            </button>
          </div>
        </div>
        
        {/* Sponsors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.length > 0 ? (
            filteredSponsors.map((sponsor) => (
              <div key={sponsor.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">{sponsor.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSponsor(sponsor)}
                      className="p-1.5 bg-blue-500 rounded hover:bg-blue-600"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDeleteSponsor(sponsor.id)}
                      className="p-1.5 bg-red-500 rounded hover:bg-red-600"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    {sponsor.logoUrl ? (
                      <div className="w-24 h-24 bg-gray-700 rounded-md flex items-center justify-center">
                        <Image
                          src={sponsor.logoUrl}
                          alt={`${sponsor.name} logo`}
                          width={96}
                          height={96}
                          className="max-h-20 max-w-20 object-contain"
                          // Fallback for demo images that don't exist
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-700 rounded-md flex items-center justify-center text-gray-500">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">{sponsor.description}</p>
                  
                  <div className="flex justify-between items-center text-sm">
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" /> Website
                    </a>
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      {sponsor.discount}% İndirim
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-gray-800 rounded-lg p-8 text-center">
              <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Sponsor Bulunamadı</h3>
              <p className="text-gray-400 mb-6">Henüz sponsor eklenmemiş veya arama kriterlerinize uygun sponsor yok.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-1" /> İlk Sponsoru Ekle
              </button>
            </div>
          )}
        </div>
        
        {/* Add/Edit Sponsor Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 bg-gray-700 flex justify-between items-center rounded-t-lg">
                <h3 className="text-lg font-semibold text-white">
                  {isEditing ? 'Sponsoru Düzenle' : 'Yeni Sponsor Ekle'}
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditing(false);
                    setFormData({
                      id: '',
                      name: '',
                      logoUrl: '',
                      website: '',
                      discount: 0,
                      description: ''
                    });
                  }}
                  className="p-1 rounded hover:bg-gray-600"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>
              
              <form onSubmit={handleSponsorSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Sponsor Adı</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Logo URL</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Website</label>
                    <input
                      type="url"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">İndirim Oranı (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Açıklama</label>
                    <textarea
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditing(false);
                      setFormData({
                        id: '',
                        name: '',
                        logoUrl: '',
                        website: '',
                        discount: 0,
                        description: ''
                      });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {isEditing ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 