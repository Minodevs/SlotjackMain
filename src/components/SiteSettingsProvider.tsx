'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Settings interface
export interface SiteSettings {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    telegram: string;
    kick: string;
  };
  maintenanceMode: boolean;
  allowRegistration: boolean;
  footerText: string;
  banners: {
    id: number;
    title: string;
    imageUrl: string;
    dimensions?: {
      width: number;
      height: number;
    };
  }[];
}

// Default settings
export const defaultSettings: SiteSettings = {
  siteName: 'JACKCOIN MARKET',
  primaryColor: '#FF6B00',
  secondaryColor: '#121212',
  contactEmail: 'contact@example.com',
  contactPhone: '+90 555 123 4567',
  socialLinks: {
    facebook: 'https://facebook.com/',
    twitter: 'https://twitter.com/',
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/',
    telegram: 'https://t.me/',
    kick: 'https://kick.com/'
  },
  maintenanceMode: false,
  allowRegistration: true,
  footerText: '© 2024 JACKCOIN MARKET. Tüm hakları saklıdır.',
  banners: [
    { id: 1, title: "HOŞGELDIN BONUSU 500 JACKPUAN", imageUrl: "/silders/silder1.jpg" },
    { id: 2, title: "%100 RİSKSİZ BONUSLAR", imageUrl: "/silders/silder2.jpg" },
    { id: 3, title: "HOŞ GELDİN SPOR VEYA SLOT BONUSLARI", imageUrl: "/silders/silder3.jpg" },
    { id: 4, title: "5.000.000TL GÜNLÜK ÇEKİM", imageUrl: "/silders/silder1.jpg" }
  ]
};

// Settings storage key
export const SETTINGS_STORAGE_KEY = 'slotjack_site_settings';

// Create context
interface SiteSettingsContextValue {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => void;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load settings from localStorage on client side
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (err) {
      console.error('Error loading site settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update settings function
  const updateSettings = (newSettings: SiteSettings) => {
    try {
      setSettings(newSettings);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (err) {
      console.error('Error saving site settings:', err);
    }
  };
  
  // Create dynamic CSS variables for theme colors
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', settings.primaryColor);
      root.style.setProperty('--secondary-color', settings.secondaryColor);
    }
  }, [settings.primaryColor, settings.secondaryColor]);
  
  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
} 