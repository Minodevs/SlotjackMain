'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import Image from 'next/image';
import { 
  ChevronLeft, Plus, Search, 
  Building, X, Edit, Trash2, Save, Link2, ExternalLink, Globe, AlertTriangle
} from 'lucide-react';
import ClientLayout from '../../../components/ClientLayout';
import { getSponsors, updateSponsor, addSponsor, softDeleteSponsor, permanentlyDeleteSponsor, Sponsor } from '@/services/SponsorsService';

// Sponsor tier options with labels
const sponsorTiers = [
  { value: 'platinum', label: 'Platinum Sponsor' },
  { value: 'gold', label: 'Gold Sponsor' },
  { value: 'silver', label: 'Silver Sponsor' },
  { value: 'bronze', label: 'Bronze Sponsor' },
  { value: 'partner', label: 'Etkinlik Partneri' }
];

export default function AdminSponsorsPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{isOpen: boolean, sponsorId: string | null, sponsorName: string}>({
    isOpen: false, 
    sponsorId: null,
    sponsorName: ''
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Form state for adding/editing sponsor
  const [sponsorFormData, setSponsorFormData] = useState<{
    name: string;
    tier: string;
    website: string;
    logoUrl: string;
    description: string;
    primaryBonus: string;
    secondaryBonus: string;
    buttonText: string;
    featured: boolean;
    tags: string;
    includeTracking: boolean;
  }>({
    name: '',
    tier: '',
    website: '',
    logoUrl: '',
    description: '',
    primaryBonus: '',
    secondaryBonus: '',
    buttonText: 'Üye Ol',
    featured: false,
    tags: '',
    includeTracking: false
  });
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Load sponsors from storage
  const loadSponsors = () => {
    try {
      const sponsorData = getSponsors();
      // Include all sponsors, including inactive ones (soft-deleted)
      setSponsors(sponsorData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading sponsors:', error);
      setLoading(false);
    }
  };
  
  // Check if user is admin and load sponsors
  useEffect(() => {
    if (!loading && (!user || user.rank !== UserRank.ADMIN)) {
      router.push('/');
      return;
    }
    
    if (user) {
      loadSponsors();
    }
  }, [user, loading, router]);
  
  // Filter sponsors based on search
  const filteredSponsors = sponsors.filter(sponsor =>
    searchQuery === '' ||
    sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sponsor.tier && sponsor.tier.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (sponsor.description && sponsor.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Get tier label from value
  const getTierLabel = (tierValue: string | undefined) => {
    if (!tierValue) return '';
    const tier = sponsorTiers.find(t => t.value === tierValue);
    return tier ? tier.label : tierValue;
  };
  
  // Open modal for adding new sponsor
  const handleAddSponsor = () => {
    setEditingSponsorId(null);
    setSponsorFormData({
      name: '',
      tier: '',
      website: '',
      logoUrl: '',
      description: '',
      primaryBonus: '',
      secondaryBonus: '',
      buttonText: 'Üye Ol',
      featured: false,
      tags: '',
      includeTracking: false
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing sponsor
  const handleEditSponsor = (sponsor: Sponsor) => {
    try {
      console.log('Editing sponsor:', sponsor.name);
      setEditingSponsorId(sponsor.id);
      // Extract bonus texts
      const primaryBonus = sponsor.bonuses && sponsor.bonuses.length > 0 ? sponsor.bonuses[0].text : '';
      const secondaryBonus = sponsor.bonuses && sponsor.bonuses.length > 1 ? sponsor.bonuses[1].text : '';
      
      // Check if website already contains tracking
      const hasTracking = sponsor.website.includes('utm_source=');
      
      setSponsorFormData({
        name: sponsor.name,
        tier: sponsor.tier || '',
        website: sponsor.website,
        logoUrl: sponsor.logo || sponsor.logoUrl || '',
        description: sponsor.description || '',
        primaryBonus,
        secondaryBonus,
        buttonText: sponsor.buttonText || 'Üye Ol',
        featured: sponsor.featured,
        tags: sponsor.tags ? sponsor.tags.join(', ') : '',
        includeTracking: hasTracking
      });
      
      // Ensure modal opens
      setTimeout(() => {
        setIsModalOpen(true);
      }, 0);
    } catch (error) {
      console.error('Error while editing sponsor:', error);
      setMessage({ type: 'error', text: 'Düzenleme sırasında bir hata oluştu. Lütfen tekrar deneyin.' });
    }
  };
  
  // Open confirmation dialog for deleting sponsor
  const handleDeleteConfirmation = (sponsor: Sponsor) => {
    setConfirmDeleteModal({
      isOpen: true,
      sponsorId: sponsor.id,
      sponsorName: sponsor.name
    });
  };
  
  // Handle soft delete sponsor - marks as inactive but keeps data
  const handleSoftDeleteSponsor = () => {
    if (confirmDeleteModal.sponsorId) {
      const success = softDeleteSponsor(confirmDeleteModal.sponsorId);
      
      if (success) {
        setMessage({ type: 'success', text: `${confirmDeleteModal.sponsorName} başarıyla gizlendi.` });
        loadSponsors(); // Reload sponsors to see changes
      } else {
        setMessage({ type: 'error', text: 'Sponsor gizlenirken bir hata oluştu.' });
      }
      
      // Close delete confirmation
      setConfirmDeleteModal({ isOpen: false, sponsorId: null, sponsorName: '' });
      
      // Clear message after some time
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };
  
  // Handle hard delete sponsor - completely removes data
  const handleHardDeleteSponsor = () => {
    if (confirmDeleteModal.sponsorId) {
      const success = permanentlyDeleteSponsor(confirmDeleteModal.sponsorId);
      
      if (success) {
        setMessage({ type: 'success', text: `${confirmDeleteModal.sponsorName} kalıcı olarak silindi.` });
        loadSponsors(); // Reload sponsors to see changes
      } else {
        setMessage({ type: 'error', text: 'Sponsor silinirken bir hata oluştu.' });
      }
      
      // Close delete confirmation
      setConfirmDeleteModal({ isOpen: false, sponsorId: null, sponsorName: '' });
      
      // Clear message after some time
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };
  
  // Handle form submit for adding/editing sponsor
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Form submitted. Editing sponsor ID:', editingSponsorId);
      
      // Process tags from comma-separated string to array
      const tagsArray = sponsorFormData.tags
        ? sponsorFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];
      
      // Create bonuses array from primary and secondary bonus fields
      const bonuses = [
        { text: sponsorFormData.primaryBonus, type: 'primary' as const },
        { text: sponsorFormData.secondaryBonus, type: 'secondary' as const }
      ];
      
      // Add tracking parameters if needed
      let websiteUrl = sponsorFormData.website;
      if (sponsorFormData.includeTracking && !websiteUrl.includes('utm_source=')) {
        const separator = websiteUrl.includes('?') ? '&' : '?';
        websiteUrl = `${websiteUrl}${separator}utm_source=slotjack&utm_medium=referral&utm_campaign=sponsored`;
      }
      
      const sponsorData: Omit<Sponsor, 'id'> = {
        name: sponsorFormData.name,
        logo: sponsorFormData.logoUrl,
        website: websiteUrl,
        bonuses,
        featured: sponsorFormData.featured,
        tags: tagsArray,
        buttonText: sponsorFormData.buttonText,
        tier: sponsorFormData.tier,
        description: sponsorFormData.description,
        logoUrl: sponsorFormData.logoUrl,
        isActive: true // Ensure sponsor is active
      };
      
      console.log('Prepared sponsor data:', sponsorData);
      
      let success: boolean = false;
      
      if (editingSponsorId) {
        // Update existing sponsor
        console.log('Updating sponsor with ID:', editingSponsorId);
        const result = updateSponsor(editingSponsorId, sponsorData);
        success = !!result;
        console.log('Update result:', result);
        
        if (success) {
          setMessage({ type: 'success', text: `${sponsorData.name} başarıyla güncellendi.` });
        } else {
          setMessage({ type: 'error', text: 'Sponsor güncellenirken bir hata oluştu.' });
        }
      } else {
        // Add new sponsor
        const result = addSponsor(sponsorData);
        success = !!result;
        
        if (success) {
          setMessage({ type: 'success', text: `${sponsorData.name} başarıyla eklendi.` });
        } else {
          setMessage({ type: 'error', text: 'Sponsor eklenirken bir hata oluştu.' });
        }
      }
      
      if (success) {
        // Close modal and reload sponsors
        setIsModalOpen(false);
        loadSponsors();
        
        // Clear message after some time
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      setMessage({ type: 'error', text: 'İşlem sırasında bir hata oluştu. Hata detayı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') });
      
      // Don't hide the error message automatically
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  };
  
  // Restore a soft-deleted sponsor
  const handleRestoreSponsor = (id: string) => {
    const result = updateSponsor(id, { isActive: true });
    
    if (result) {
      setMessage({ type: 'success', text: 'Sponsor başarıyla geri yüklendi.' });
      loadSponsors();
      
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } else {
      setMessage({ type: 'error', text: 'Sponsor geri yüklenirken bir hata oluştu.' });
    }
  };
  
  // Function to close modal and reset state
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form state after a brief delay to prevent visual glitches
    setTimeout(() => {
      setEditingSponsorId(null);
      setSponsorFormData({
        name: '',
        tier: '',
        website: '',
        logoUrl: '',
        description: '',
        primaryBonus: '',
        secondaryBonus: '',
        buttonText: 'Üye Ol',
        featured: false,
        tags: '',
        includeTracking: false
      });
    }, 300);
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
            <p className="text-gray-400">
              Sponsorları ekle, düzenle veya gizle
              <Link href="/admin/sponsorlar/debug" className="ml-2 text-blue-400 hover:text-blue-300 text-xs">
                [Tanılama Sayfası]
              </Link>
            </p>
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
              onClick={handleAddSponsor}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" />
              Yeni Sponsor Ekle
            </button>
          </div>
        </div>
        
        {/* Success/Error message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 flex items-center ${
            message.type === 'success' ? 'bg-green-900/30 text-green-300 border border-green-800' : 
            'bg-red-900/30 text-red-300 border border-red-800'
          }`}>
            {message.type === 'success' ? (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">✓</div>
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
            )}
            <p>{message.text}</p>
          </div>
        )}
        
        {/* Sponsors Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-300 font-semibold">Sponsor Adı</th>
                  <th className="py-3 px-4 text-left text-gray-300 font-semibold">Seviye</th>
                  <th className="py-3 px-4 text-left text-gray-300 font-semibold">Website <span className="font-normal text-xs">(Tıkla & Test Et)</span></th>
                  <th className="py-3 px-4 text-center text-gray-300 font-semibold">Öne Çıkan</th>
                  <th className="py-3 px-4 text-center text-gray-300 font-semibold">Durum</th>
                  <th className="py-3 px-4 text-right text-gray-300 font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredSponsors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 px-4 text-center text-gray-400">
                      Sponsor bulunamadı. Yeni sponsor eklemek için "Yeni Sponsor Ekle" düğmesine tıklayın.
                    </td>
                  </tr>
                ) : (
                  filteredSponsors.map(sponsor => (
                    <tr 
                      key={sponsor.id} 
                      className={`hover:bg-gray-750 ${sponsor.isActive === false ? 'bg-gray-850 text-gray-500' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden mr-3">
                            {sponsor.logo ? (
                              <img 
                                src={sponsor.logo} 
                                alt={sponsor.name} 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // If logo fails to load, show first letter of name
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = sponsor.name.charAt(0).toUpperCase();
                                }}
                              />
                            ) : (
                              sponsor.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{sponsor.name}</div>
                            {sponsor.tags && sponsor.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sponsor.tags.map((tag, idx) => (
                                  <span key={idx} className="text-xs bg-gray-700 text-blue-300 px-1.5 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {getTierLabel(sponsor.tier)}
                      </td>
                      <td className="py-3 px-4">
                        <a 
                          href={sponsor.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center text-blue-400 hover:text-blue-300"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          <span className="truncate max-w-[180px]">
                            {sponsor.website.replace(/^https?:\/\//, '').split('/')[0]}
                          </span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                          {sponsor.website.includes('utm_') && (
                            <span className="ml-1 text-xs py-0.5 px-1 bg-blue-900/50 text-blue-300 rounded">
                              UTM
                            </span>
                          )}
                        </a>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                          {sponsor.website.includes('?') ? (
                            <span title={sponsor.website}>
                              {sponsor.website.split('?')[0]} + parametreler
                            </span>
                          ) : (
                            <span>{sponsor.website}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {sponsor.featured ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300">
                            Evet
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                            Hayır
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {sponsor.isActive === false ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-300">
                            Gizli
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                            Aktif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {sponsor.isActive === false ? (
                            <button
                              onClick={() => handleRestoreSponsor(sponsor.id)}
                              className="p-1 bg-green-700 text-white rounded hover:bg-green-600"
                              title="Geri Yükle"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault(); 
                                  e.stopPropagation();
                                  handleEditSponsor(sponsor);
                                }}
                                className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center"
                                title="Düzenle"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                <span className="text-xs">Düzenle</span>
                              </button>
                              <button
                                onClick={() => handleDeleteConfirmation(sponsor)}
                                className="p-1 bg-red-600 text-white rounded hover:bg-red-500"
                                title="Gizle/Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Add/Edit Sponsor Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 bg-gray-700 flex justify-between items-center rounded-t-lg">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  {editingSponsorId ? 'Sponsoru Düzenle' : 'Yeni Sponsor Ekle'}
                </h3>
                <button
                  onClick={() => closeModal()}
                  className="p-1 rounded hover:bg-gray-600"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Sponsor Adı</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sponsorFormData.name}
                      onChange={(e) => setSponsorFormData({ ...sponsorFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Sponsor Seviyesi</label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sponsorFormData.tier}
                      onChange={(e) => setSponsorFormData({ ...sponsorFormData, tier: e.target.value })}
                      required
                    >
                      <option value="">Seviye Seçin</option>
                      {sponsorTiers.map(tier => (
                        <option key={tier.value} value={tier.value}>{tier.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Website URL</label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-gray-600 border border-r-0 border-gray-600 rounded-l-md text-gray-400">
                          <Link2 className="w-4 h-4" />
                        </span>
                        <input
                          type="url"
                          className="w-full bg-gray-700 border border-gray-600 rounded-r-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={sponsorFormData.website}
                          onChange={(e) => setSponsorFormData({ ...sponsorFormData, website: e.target.value })}
                          placeholder="https://example.com"
                          required
                        />
                      </div>
                      {sponsorFormData.website && (
                        <div className="flex items-center text-xs">
                          <a 
                            href={sponsorFormData.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-400 hover:text-blue-300 flex items-center"
                          >
                            <span>Önizleme: {sponsorFormData.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      )}
                      <p className="text-xs text-gray-400">
                        Kullanıcılar bu URL'ye "{sponsorFormData.buttonText || 'Üye Ol'}" butonuna tıkladıklarında yönlendirilecekler.
                      </p>
                      
                      <div className="mt-2 flex items-center">
                        <input
                          type="checkbox"
                          id="includeTracking"
                          className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                          checked={sponsorFormData.includeTracking}
                          onChange={(e) => setSponsorFormData({ ...sponsorFormData, includeTracking: e.target.checked })}
                        />
                        <label htmlFor="includeTracking" className="ml-2 text-sm text-gray-300">
                          Takip parametreleri ekle (utm_source, utm_medium)
                        </label>
                      </div>
                      
                      {sponsorFormData.includeTracking && sponsorFormData.website && (
                        <div className="mt-1 text-xs text-gray-400">
                          <p>Oluşturulacak link:</p>
                          <code className="block mt-1 p-1 bg-gray-900 rounded overflow-x-auto">
                            {sponsorFormData.website + (sponsorFormData.website.includes('?') ? '&' : '?') + 'utm_source=slotjack&utm_medium=referral&utm_campaign=sponsored'}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Logo URL</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sponsorFormData.logoUrl}
                      onChange={(e) => setSponsorFormData({ ...sponsorFormData, logoUrl: e.target.value })}
                      placeholder="/sponsored parts/logo.png"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Önerilen format: /sponsored parts/sponsoradi.png</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Birincil Bonus Metni</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sponsorFormData.primaryBonus}
                      onChange={(e) => setSponsorFormData({ ...sponsorFormData, primaryBonus: e.target.value })}
                      placeholder="%50"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">İkincil Bonus Metni</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sponsorFormData.secondaryBonus}
                      onChange={(e) => setSponsorFormData({ ...sponsorFormData, secondaryBonus: e.target.value })}
                      placeholder="Hoşgeldin Bonusu"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Etiketler (virgülle ayırın)</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sponsorFormData.tags}
                      onChange={(e) => setSponsorFormData({ ...sponsorFormData, tags: e.target.value })}
                      placeholder="Güvenilir, Lisanslı, Hızlı Ödeme"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Buton Metni</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sponsorFormData.buttonText}
                      onChange={(e) => setSponsorFormData({ ...sponsorFormData, buttonText: e.target.value })}
                      placeholder="Üye Ol"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-1">Açıklama</label>
                    <textarea
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      value={sponsorFormData.description}
                      onChange={(e) => setSponsorFormData({ ...sponsorFormData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                        checked={sponsorFormData.featured}
                        onChange={(e) => setSponsorFormData({ ...sponsorFormData, featured: e.target.checked })}
                      />
                      <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                        VIP sponsor olarak göster
                      </label>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">VIP sponsorlar "VIP Siteler" bölümünde gösterilir ve yıldız işareti alır.</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => closeModal()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center font-medium"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingSponsorId ? 'Sponsoru Güncelle' : 'Sponsoru Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {confirmDeleteModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 bg-gray-700 flex justify-between items-center rounded-t-lg">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                  Sponsoru Sil
                </h3>
                <button
                  onClick={() => setConfirmDeleteModal({isOpen: false, sponsorId: null, sponsorName: ''})}
                  className="p-1 rounded hover:bg-gray-600"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-white mb-4">
                  <strong>{confirmDeleteModal.sponsorName}</strong> isimli sponsoru silmek istediğinizden emin misiniz?
                </p>
                
                <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 p-4 rounded-md mb-6">
                  <p className="text-sm">
                    <strong>Not:</strong> Sponsorlar gizli olarak işaretlenebilir veya kalıcı olarak silinebilir. 
                    Gizli işaretleme veriyi saklar ancak kullanıcıya göstermez. Kalıcı silme işlemi geri alınamaz!
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteModal({isOpen: false, sponsorId: null, sponsorName: ''})}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleSoftDeleteSponsor}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Gizle
                  </button>
                  <button
                    type="button"
                    onClick={handleHardDeleteSponsor}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Kalıcı Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 