'use client';

import { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { getSponsors, Sponsor } from '@/services/SponsorsService';
import { VIPSiteCard, VIPSiteCardMobile, SiteCardsGrid } from '@/components/VIPSiteCard';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Define the tag type to match what's used in VIPSiteCard
type ExtraTag = {text: string, className?: string};

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Debug flag - added for Netlify rebuild
  const forceRebuild = true;
  
  useEffect(() => {
    // Load sponsors from the service
    const loadSponsors = () => {
      try {
        const sponsorData = getSponsors();
        // Only show active sponsors (not soft-deleted)
        const activeSponsors = sponsorData.filter(sponsor => 
          sponsor.isActive !== false // Show if isActive is true or undefined
        );
        setSponsors(activeSponsors);
      } catch (error) {
        console.error('Error loading sponsors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSponsors();
  }, []);
  
  // Separate featured sponsors from regular sponsors
  const featuredSponsors = sponsors.filter(sponsor => sponsor.featured);
  const regularSponsors = sponsors.filter(sponsor => !sponsor.featured);
  
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
  
  return (
    <ClientLayout>
      <div className="bg-gray-900 min-h-screen pb-10">
        {/* Slotjack section */}
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">SLOTJACK'İN TERCİHİ</h2>
          
          {/* Desktop View - Original */}
          <div className="relative pb-10 hidden md:block">
            <SiteCardsGrid>
              {featuredSponsors.map(sponsor => {
                // Find any specific tags to display
                const extraTags: ExtraTag[] = [];
                
                // Some examples based on your screenshots
                if (sponsor.name === "Zlot") {
                  extraTags.push({text: "%30 VIP Kayıp Bonusu"});
                } else if (sponsor.name === "ESBet") {
                  extraTags.push({text: "Sınırsız Çekim İmkanı"});
                  extraTags.push({text: "slotjack25", className: "bg-gray-800 text-yellow-500"});
                }
                
                return (
                  <VIPSiteCard
                    key={sponsor.id}
                    logo={sponsor.logo}
                    name={sponsor.name}
                    primaryBonus={sponsor.bonuses[0].text}
                    secondaryBonus={sponsor.bonuses[1].text}
                    tags={sponsor.tags}
                    buttonText="Kayıt Ol"
                    buttonLink={sponsor.website}
                    extraTags={extraTags}
                  />
                );
              })}
            </SiteCardsGrid>
          </div>
          
          {/* Mobile View - 2-column Grid Layout (as in screenshot) */}
          <div className="relative pb-8 md:hidden">
            <div className="grid grid-cols-2 gap-3">
              {featuredSponsors.map(sponsor => {
                // Find any specific tags to display
                const extraTags: ExtraTag[] = [];
                
                // Prepare appropriate tags for each sponsor based on screenshot
                if (sponsor.name === "Zlot") {
                  extraTags.push({text: "%30 VIP"});
                  extraTags.push({text: "Kayıp Bonusu"});
                } else if (sponsor.name === "ESBet") {
                  extraTags.push({text: "slotjack25", className: "text-yellow-500"});
                  extraTags.push({text: "Sınırsız Çekim İmkanı"});
                } else if (sponsor.name === "Sterlinbet") {
                  extraTags.push({text: "Sınırsız Çekim"});
                } else if (sponsor.name === "Etoro") {
                  extraTags.push({text: "Kayıplarınıza Günlük"});
                  extraTags.push({text: "%15 Geri Ödeme"});
                } else if (sponsor.name === "Bullbahis") {
                  extraTags.push({text: "slotjack25"});
                } else if (sponsor.name === "Risebet") {
                  extraTags.push({text: "%100"});
                }
                
                return (
                  <div key={`mobile-${sponsor.id}`} className="relative mb-3">
                    {/* Crown icon */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="rounded-full bg-yellow-500 p-1 w-8 h-8 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-black" />
                      </div>
                    </div>
                    
                    <div className="pt-5 bg-gray-800/90 border border-gray-700 rounded-lg overflow-hidden h-full flex flex-col">
                      {/* Logo */}
                      <div className="px-2 py-3 flex items-center justify-center">
                        <img 
                          src={sponsor.logo} 
                          alt={sponsor.name} 
                          className="object-contain max-h-10" 
                        />
                      </div>
                      
                      {/* Main Bonus */}
                      <div className="px-2 text-center">
                        <h3 className="text-yellow-500 font-bold text-lg">{sponsor.bonuses[0].text}</h3>
                        <p className="text-white text-sm mb-2">{sponsor.bonuses[1].text}</p>
                      </div>
                      
                      {/* Tag items in smaller boxes */}
                      <div className="grid grid-cols-1 gap-1 p-2">
                        {extraTags.map((tag, idx) => (
                          <div key={idx} className="bg-gray-900/70 text-center py-1 px-1 rounded">
                            <span className={cn("text-xs", tag.className || "text-white")}>
                              {tag.text}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Button */}
                      <a 
                        href={sponsor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-[#FF6B00] text-white text-sm font-medium py-2 text-center mt-auto"
                      >
                        Kayıt Ol
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Regular Sponsors Section - Desktop Only */}
          {regularSponsors.length > 0 && (
            <div className="mt-12 hidden md:block">
              <SiteCardsGrid>
                {regularSponsors.map(sponsor => (
                  <VIPSiteCard
                    key={sponsor.id}
                    logo={sponsor.logo}
                    name={sponsor.name}
                    primaryBonus={sponsor.bonuses[0].text}
                    secondaryBonus={sponsor.bonuses[1].text}
                    tags={sponsor.tags}
                    buttonText="Kayıt Ol"
                    buttonLink={sponsor.website}
                  />
                ))}
              </SiteCardsGrid>
            </div>
          )}
          
          {/* Regular Sponsors Section - Mobile 2-column Grid */}
          {regularSponsors.length > 0 && (
            <div className="mt-8 md:hidden">
              <div className="grid grid-cols-2 gap-3">
                {regularSponsors.map(sponsor => {
                  const extraTags: ExtraTag[] = [];
                  // Add any special tags for regular sponsors if needed
                  
                  return (
                    <div key={`mobile-reg-${sponsor.id}`} className="relative mb-3">
                      {/* Crown icon */}
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="rounded-full bg-yellow-500 p-1 w-8 h-8 flex items-center justify-center">
                          <Crown className="w-5 h-5 text-black" />
                        </div>
                      </div>
                      
                      <div className="pt-5 bg-gray-800/90 border border-gray-700 rounded-lg overflow-hidden h-full flex flex-col">
                        {/* Logo */}
                        <div className="px-2 py-3 flex items-center justify-center">
                          <img 
                            src={sponsor.logo} 
                            alt={sponsor.name} 
                            className="object-contain max-h-10" 
                          />
                        </div>
                        
                        {/* Main Bonus */}
                        <div className="px-2 text-center">
                          <h3 className="text-yellow-500 font-bold text-lg">{sponsor.bonuses[0].text}</h3>
                          <p className="text-white text-sm mb-2">{sponsor.bonuses[1].text}</p>
                        </div>
                        
                        {/* Tag items in smaller boxes */}
                        <div className="grid grid-cols-1 gap-1 p-2">
                          {sponsor.tags && sponsor.tags.length > 0 && sponsor.tags.map((tag, idx) => (
                            <div key={idx} className="bg-gray-900/70 text-center py-1 px-1 rounded">
                              <span className="text-xs text-white">{tag}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Button */}
                        <a 
                          href={sponsor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-[#FF6B00] text-white text-sm font-medium py-2 text-center mt-auto"
                        >
                          Kayıt Ol
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* No sponsors message */}
          {sponsors.length === 0 && !loading && (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">Henüz sponsor bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
} 