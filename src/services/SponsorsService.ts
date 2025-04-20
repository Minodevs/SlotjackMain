// Sponsor type definition
export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website: string;
  bonuses: {
    text: string;
    type: 'primary' | 'secondary';
  }[];
  featured: boolean;
  tags?: string[];
  buttonText: string;
  tier?: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
}

// Key for storing sponsors in localStorage
const SPONSORS_STORAGE_KEY = 'slotjack_sponsors';

// Initial sponsors data based on the current implementation
const initialSponsors: Sponsor[] = [
  {
    id: '1',
    name: 'Zlot',
    logo: '/sponsored parts/zlot.png',
    website: 'https://zlot.com',
    bonuses: [
      { text: '%200', type: 'primary' },
      { text: 'Yatırım Bonusu', type: 'secondary' }
    ],
    featured: true,
    buttonText: 'Üye Ol'
  },
  {
    id: '2',
    name: 'ESBet',
    logo: '/sponsored parts/esbet.png',
    website: 'https://esbet.com',
    bonuses: [
      { text: '%50 Çevrimsiz Casino', type: 'primary' },
      { text: 'Hoşgeldin Bonusu', type: 'secondary' }
    ],
    featured: true,
    tags: ['Güvenilir', 'Lisanslı'],
    buttonText: 'Üye Ol'
  },
  {
    id: '3',
    name: 'SterlinBet',
    logo: '/sponsored parts/sterlinbet.png',
    website: 'https://sterlinbet.com',
    bonuses: [
      { text: '%100', type: 'primary' },
      { text: 'Hoşgeldin Bonusu', type: 'secondary' }
    ],
    featured: true,
    buttonText: 'Üye Ol'
  },
  {
    id: '4',
    name: 'EtoroBet',
    logo: '/sponsored parts/etorobet.png',
    website: 'https://etorobet.com',
    bonuses: [
      { text: '%100', type: 'primary' },
      { text: 'İlk Yatırım Bonusu', type: 'secondary' }
    ],
    featured: true,
    buttonText: 'Kayıt Ol'
  },
  {
    id: '5',
    name: 'BullBahis',
    logo: '/sponsored parts/bullbahis.png',
    website: 'https://bullbahis.com',
    bonuses: [
      { text: 'Ücretsiz 50 TL', type: 'primary' },
      { text: 'Deneme Bonusu', type: 'secondary' }
    ],
    featured: true,
    buttonText: 'Kayıt Ol'
  },
  {
    id: '6',
    name: 'RiseBet',
    logo: '/sponsored parts/risebet.png',
    website: 'https://risebet.com',
    bonuses: [
      { text: '%100 Çevrimsiz', type: 'primary' },
      { text: 'Casino Bonusu', type: 'secondary' }
    ],
    featured: false,
    buttonText: 'Üye Ol'
  },
  {
    id: '7',
    name: 'GalaBet',
    logo: '/sponsored parts/galabet.png',
    website: 'https://galabet.com',
    bonuses: [
      { text: 'Çevrimsiz Şartlı', type: 'primary' },
      { text: 'Casino Bonusu', type: 'secondary' }
    ],
    featured: false,
    buttonText: 'Üye Ol'
  },
  {
    id: '8',
    name: 'BetOffice',
    logo: '/sponsored parts/betoffice.png',
    website: 'https://betoffice.com',
    bonuses: [
      { text: '%50', type: 'primary' },
      { text: 'Spor Çevrim Deneme', type: 'secondary' }
    ],
    featured: false,
    buttonText: 'Üye Ol'
  },
  {
    id: '9',
    name: 'DumanBet',
    logo: '/sponsored parts/dumanbet.png',
    website: 'https://dumanbet.com',
    bonuses: [
      { text: '%100', type: 'primary' },
      { text: 'Hoşgeldin', type: 'secondary' }
    ],
    featured: false,
    buttonText: 'Üye Ol'
  },
  {
    id: '10',
    name: 'VegasSlot',
    logo: '/sponsored parts/vegasslot.png',
    website: 'https://vegasslot.com',
    bonuses: [
      { text: 'Casino Çevrim', type: 'primary' },
      { text: 'Bonus', type: 'secondary' }
    ],
    featured: false,
    buttonText: 'Üye Ol'
  }
];

/**
 * Gets all sponsors from localStorage or initializes with default data if none exists
 */
export const getSponsors = (): Sponsor[] => {
  // Only run in client-side environment
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedSponsors = localStorage.getItem(SPONSORS_STORAGE_KEY);
    if (storedSponsors) {
      return JSON.parse(storedSponsors);
    } else {
      // Initialize with default sponsors if none exists
      localStorage.setItem(SPONSORS_STORAGE_KEY, JSON.stringify(initialSponsors));
      return initialSponsors;
    }
  } catch (error) {
    console.error('Error loading sponsors from localStorage:', error);
    return [];
  }
};

/**
 * Saves the sponsors array to localStorage
 */
export const saveSponsors = (sponsors: Sponsor[]): boolean => {
  try {
    // Serialize and save to localStorage
    const serializedData = JSON.stringify(sponsors);
    localStorage.setItem(SPONSORS_STORAGE_KEY, serializedData);
    
    // Verify data was saved correctly by reading it back
    const savedData = localStorage.getItem(SPONSORS_STORAGE_KEY);
    if (!savedData) {
      console.error('Failed to verify saved sponsor data - localStorage returned null');
      return false;
    }
    
    // Verify data integrity
    try {
      const parsedData = JSON.parse(savedData);
      if (!Array.isArray(parsedData) || parsedData.length !== sponsors.length) {
        console.error('Data integrity check failed - array length mismatch');
        return false;
      }
      console.log('Sponsors saved successfully:', parsedData.length, 'sponsors');
      return true;
    } catch (parseError) {
      console.error('Failed to parse saved data for verification:', parseError);
      return false;
    }
  } catch (error) {
    console.error('Error saving sponsors to localStorage:', error);
    return false;
  }
};

/**
 * Updates an existing sponsor by ID
 */
export const updateSponsor = (id: string, sponsorData: Partial<Sponsor>): Sponsor | null => {
  try {
    console.log('Updating sponsor with ID:', id);
    console.log('Update data:', sponsorData);
    
    // Get fresh data from storage
    const sponsors = getSponsors();
    
    // Find the sponsor to update
    const index = sponsors.findIndex(s => s.id === id);
    
    if (index === -1) {
      console.error('Sponsor not found with ID:', id);
      return null;
    }
    
    // Log the original sponsor for debugging
    console.log('Original sponsor:', sponsors[index]);
    
    // Create a new object with merged properties from existing and new data
    const updatedSponsor = {
      ...sponsors[index],
      ...sponsorData,
      id // Ensure ID doesn't change
    };
    
    console.log('Updated sponsor object:', updatedSponsor);
    
    // Create a new array (avoid mutation)
    const updatedSponsors = [...sponsors];
    
    // Replace the sponsor in the array
    updatedSponsors[index] = updatedSponsor;
    
    // Save to localStorage
    const saveResult = saveSponsors(updatedSponsors);
    
    if (!saveResult) {
      console.error('Failed to save sponsors after update');
      return null;
    }
    
    // Double-check the update worked by reading back from storage
    const refreshedSponsors = getSponsors();
    const refreshedSponsor = refreshedSponsors.find(s => s.id === id);
    
    if (!refreshedSponsor) {
      console.error('Failed to find updated sponsor after save');
      return null;
    }
    
    console.log('Sponsor updated successfully:', refreshedSponsor);
    return refreshedSponsor;
  } catch (error) {
    console.error('Error updating sponsor:', error);
    return null;
  }
};

/**
 * Adds a new sponsor with generated ID
 */
export const addSponsor = (sponsorData: Omit<Sponsor, 'id'>): Sponsor | null => {
  try {
    // Get fresh data from storage
    const sponsors = getSponsors();
    
    // Generate a unique ID
    const newId = Date.now().toString();
    
    // Create the new sponsor object with ID
    const newSponsor: Sponsor = {
      id: newId,
      ...sponsorData
    };
    
    console.log('Adding new sponsor:', newSponsor);
    
    // Create a new array with the new sponsor (avoid mutation)
    const updatedSponsors = [...sponsors, newSponsor];
    
    // Save to localStorage
    const saveResult = saveSponsors(updatedSponsors);
    
    if (!saveResult) {
      console.error('Failed to save sponsors after adding new sponsor');
      return null;
    }
    
    // Double-check the add worked by reading back from storage
    const refreshedSponsors = getSponsors();
    const refreshedSponsor = refreshedSponsors.find(s => s.id === newId);
    
    if (!refreshedSponsor) {
      console.error('Failed to find new sponsor after save');
      return null;
    }
    
    console.log('Sponsor added successfully:', refreshedSponsor);
    return refreshedSponsor;
  } catch (error) {
    console.error('Error adding new sponsor:', error);
    return null;
  }
};

/**
 * Marks a sponsor as inactive (soft delete) instead of removing it completely
 */
export const softDeleteSponsor = (id: string): boolean => {
  try {
    // Get fresh data from storage
    const sponsors = getSponsors();
    
    // Find the sponsor
    const index = sponsors.findIndex(s => s.id === id);
    
    if (index === -1) {
      console.error('Sponsor not found with ID:', id);
      return false;
    }
    
    console.log('Soft deleting sponsor:', sponsors[index].name);
    
    // Create a new array (avoid mutation)
    const updatedSponsors = [...sponsors];
    
    // Update the isActive property
    updatedSponsors[index] = {
      ...updatedSponsors[index],
      isActive: false
    };
    
    // Save to localStorage
    const saveResult = saveSponsors(updatedSponsors);
    
    if (!saveResult) {
      console.error('Failed to save sponsors after soft delete');
      return false;
    }
    
    // Verify the update
    const refreshedSponsors = getSponsors();
    const refreshedSponsor = refreshedSponsors.find(s => s.id === id);
    
    if (!refreshedSponsor || refreshedSponsor.isActive !== false) {
      console.error('Failed to verify soft delete');
      return false;
    }
    
    console.log('Sponsor soft-deleted successfully');
    return true;
  } catch (error) {
    console.error('Error soft-deleting sponsor:', error);
    return false;
  }
};

/**
 * Permanently removes a sponsor from the data
 */
export const permanentlyDeleteSponsor = (id: string): boolean => {
  try {
    // Get fresh data from storage
    const sponsors = getSponsors();
    
    // Find the sponsor index
    const index = sponsors.findIndex(s => s.id === id);
    
    if (index === -1) {
      console.error('Sponsor not found with ID:', id);
      return false;
    }
    
    const sponsorName = sponsors[index].name;
    console.log('Permanently deleting sponsor:', sponsorName);
    
    // Create a new array without the deleted sponsor
    const updatedSponsors = sponsors.filter(sponsor => sponsor.id !== id);
    
    // Save to localStorage
    const saveResult = saveSponsors(updatedSponsors);
    
    if (!saveResult) {
      console.error('Failed to save sponsors after permanent delete');
      return false;
    }
    
    // Verify the delete
    const refreshedSponsors = getSponsors();
    const deletedSponsor = refreshedSponsors.find(s => s.id === id);
    
    if (deletedSponsor) {
      console.error('Failed to verify permanent delete - sponsor still exists');
      return false;
    }
    
    console.log('Sponsor permanently deleted successfully');
    return true;
  } catch (error) {
    console.error('Error permanently deleting sponsor:', error);
    return false;
  }
};

/**
 * Gets a single sponsor by ID
 */
export const getSponsorById = (id: string): Sponsor | null => {
  try {
    const sponsors = getSponsors();
    const sponsor = sponsors.find(s => s.id === id);
    return sponsor || null;
  } catch (error) {
    console.error('Error getting sponsor by ID:', error);
    return null;
  }
};

/**
 * Synchronizes admin sponsor data with regular sponsor data
 * This ensures compatibility between the admin panel format and the frontend display format
 */
export const syncAdminWithFrontend = (adminSponsor: any): Sponsor => {
  // Ensure we preserve any tracking parameters in the website URL
  const websiteUrl = adminSponsor.website || '';
  
  // Convert from admin format to frontend format
  return {
    id: adminSponsor.id,
    name: adminSponsor.name,
    logo: adminSponsor.logoUrl || `/sponsored parts/${adminSponsor.name.toLowerCase()}.png`,
    website: websiteUrl,
    bonuses: [
      { text: adminSponsor.primaryBonus || 'Bonus', type: 'primary' },
      { text: adminSponsor.secondaryBonus || 'Bonus', type: 'secondary' }
    ],
    featured: adminSponsor.featured || adminSponsor.tier === 'platinum' || adminSponsor.tier === 'gold',
    tags: adminSponsor.tags || [],
    buttonText: adminSponsor.buttonText || 'Üye Ol',
    tier: adminSponsor.tier,
    description: adminSponsor.description,
    logoUrl: adminSponsor.logoUrl
  };
};

/**
 * A helper function to map between admin and frontend sponsor formats
 */
export const mapAdminToFrontend = (adminSponsors: any[]): Sponsor[] => {
  return adminSponsors.map(sponsor => syncAdminWithFrontend(sponsor));
};

export default {
  getSponsors,
  addSponsor,
  updateSponsor,
  softDeleteSponsor,
  permanentlyDeleteSponsor,
  getSponsorById,
  syncAdminWithFrontend,
  mapAdminToFrontend
}; 