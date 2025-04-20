'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// Types for sponsor entries
interface SponsorEntry {
  name: string;
  logo: string;
  username: string;
}

export default function UserPartnersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sponsorlar');
  const [sponsorEntries, setSponsorEntries] = useState<SponsorEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/giris');
    } else {
      setIsLoading(false);
      
      // Load saved sponsor entries from localStorage
      const savedEntries = localStorage.getItem('user_sponsor_entries');
      if (savedEntries) {
        try {
          setSponsorEntries(JSON.parse(savedEntries));
        } catch (e) {
          console.error('Error parsing saved sponsor entries:', e);
          // Initialize with default sponsors if there's an error
          initializeDefaultSponsors();
        }
      } else {
        // Initialize with default sponsors if none exist
        initializeDefaultSponsors();
      }
    }
  }, [user, router]);
  
  // Initialize default sponsors list
  const initializeDefaultSponsors = () => {
    const defaultSponsors: SponsorEntry[] = [
      { name: 'Esabet', logo: '/images/sponsors/esabet.png', username: '' },
      { name: 'Sterlinbet', logo: '/images/sponsors/sterlinbet.png', username: '' },
      { name: 'Etorobet', logo: '/images/sponsors/etorobet.png', username: '' },
      { name: 'Bahis', logo: '/images/sponsors/bahis.png', username: '' },
      { name: 'Risebet', logo: '/images/sponsors/risebet.png', username: '' },
      { name: 'Galabet', logo: '/images/sponsors/galabet.png', username: '' },
      { name: 'Betoffice', logo: '/images/sponsors/betoffice.png', username: '' },
      { name: 'Vegaslot', logo: '/images/sponsors/vegaslot.png', username: '' },
      { name: 'Darkbet', logo: '/images/sponsors/darkbet.png', username: '' },
      { name: 'Betraro', logo: '/images/sponsors/betraro.png', username: '' },
      { name: 'Wslot', logo: '/images/sponsors/wslot.png', username: '' },
      { name: 'Olamarket', logo: '/images/sponsors/olamarket.png', username: '' },
      { name: 'Asyabahis', logo: '/images/sponsors/asyabahis.png', username: '' },
      { name: 'Maltcasino', logo: '/images/sponsors/maltcasino.png', username: '' },
      { name: 'Getirbet', logo: '/images/sponsors/getirbet.png', username: '' },
      { name: 'Zlot', logo: '/images/sponsors/zlot.png', username: '' },
      { name: 'Baywin', logo: '/images/sponsors/baywin.png', username: '' },
      { name: 'Efesbet', logo: '/images/sponsors/efesbet.png', username: '' },
      { name: 'Siribet', logo: '/images/sponsors/siribet.png', username: '' },
      { name: 'Gambi', logo: '/images/sponsors/gambi.png', username: '' },
      { name: 'Napolibet', logo: '/images/sponsors/napolibet.png', username: '' },
      { name: 'Pasha', logo: '/images/sponsors/pasha.png', username: '' },
      { name: 'Moldebet', logo: '/images/sponsors/moldebet.png', username: '' },
      { name: 'Sportsbetio', logo: '/images/sponsors/sportsbetio.png', username: '' }
    ];
    
    setSponsorEntries(defaultSponsors);
  };
  
  // Handle sponsor username changes
  const handleSponsorUsernameChange = (index: number, value: string) => {
    const updatedEntries = [...sponsorEntries];
    updatedEntries[index].username = value;
    setSponsorEntries(updatedEntries);
  };
  
  // Save sponsor entries
  const handleSaveSponsors = () => {
    setIsSaving(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('user_sponsor_entries', JSON.stringify(sponsorEntries));
      
      // In a real app, you would also save to a backend:
      // await fetch('/api/user/sponsors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(sponsorEntries),
      // });
      
      // Show success message or handle UI feedback
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving sponsor entries:', error);
      setIsSaving(false);
    }
  };
  
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-transparent border-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Main content area */}
        <div className="border border-[#FF7A00] rounded-lg overflow-hidden">
          {/* User profile header */}
          <div className="flex flex-col items-start p-5 bg-[#101010]">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FF7A00] flex items-center justify-center mr-3">
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt={user.name || user.email.split('@')[0]} 
                    width={48} 
                    height={48} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xl font-bold text-white">
                    {(user.name || user.email.split('@')[0]).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">{user.name || user.email.split('@')[0]}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>
            
            <div className="w-full flex border-b border-gray-800">
              <Link href="/user/verifications" className="px-4 py-2 text-sm hover:text-white text-gray-400">
                Doğrulamalar
              </Link>
              <Link href="/user/profile" className="px-4 py-2 text-sm hover:text-white text-gray-400">
                Bilgilerim
              </Link>
              <Link href="/user/partners" className="px-4 py-2 text-sm border-b-2 border-[#FF7A00] text-white font-medium">
                Sponsorlar
              </Link>
              <Link href="/user/history" className="px-4 py-2 text-sm hover:text-white text-gray-400">
                Geçmişim
              </Link>
            </div>
          </div>
          
          {/* Content area */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sponsorEntries.map((sponsor, index) => (
              <div key={index} className="bg-[#1A1A1A] rounded-md overflow-hidden">
                <div className="h-10 flex items-center justify-center bg-[#101010] p-2">
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    className="max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x50/1A1A1A/808080?text=Logo';
                    }}
                  />
                </div>
                <div className="p-2">
                  <input
                    type="text"
                    value={sponsor.username}
                    onChange={(e) => handleSponsorUsernameChange(index, e.target.value)}
                    placeholder="Üye ID veya kullanıcı adınız"
                    className="w-full text-sm bg-[#1A1A1A] border-0 border-b border-gray-700 focus:border-[#FF7A00] text-gray-300 px-0 py-1 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Save button */}
          <div className="p-6 flex justify-center">
            <button 
              onClick={handleSaveSponsors}
              disabled={isSaving}
              className="bg-[#FF7A00] text-white px-8 py-2 rounded-md hover:bg-[#FF9633] transition-colors font-medium w-full md:w-auto flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 