// Define the Transaction type to match the one in AuthContext
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  timestamp: number;
  type: 'earn' | 'spend' | 'bonus' | 'event' | 'admin';
  userId: string;
}

// Define the storage key for wheel spin data
const WHEEL_SPIN_STORAGE_KEY = 'wheelSpinData';

// Define the structure of the spin wheel segments
export interface WheelSegment {
  id: number;
  value: number;
  color: string;
  probability: number; // Probability weight for landing on this segment
  label?: string;
}

// Define the structure of a user's spin history
export interface UserSpinData {
  lastSpinTime: number; // Timestamp of last spin
  spinHistory: SpinResult[];
  paidSpins: number; // Track how many additional paid spins the user has
}

// Define the structure of a spin result
export interface SpinResult {
  id: string;
  userId: string;
  segmentId: number;
  reward: number;
  timestamp: number;
}

// Define the wheel segments with their rewards and probabilities
export const wheelSegments: WheelSegment[] = [
  { id: 1, value: 5, color: '#E57373', probability: 25, label: '5' },
  { id: 2, value: 10, color: '#F06292', probability: 20, label: '10' },
  { id: 3, value: 20, color: '#BA68C8', probability: 15, label: '20' },
  { id: 4, value: 40, color: '#9575CD', probability: 12, label: '40' },
  { id: 5, value: 50, color: '#7986CB', probability: 10, label: '50' },
  { id: 6, value: 70, color: '#64B5F6', probability: 8, label: '70' },
  { id: 7, value: 85, color: '#4FC3F7', probability: 5, label: '85' },
  { id: 8, value: 100, color: '#4DD0E1', probability: 3, label: '100' },
  { id: 9, value: 200, color: '#4DB6AC', probability: 2, label: '200' },
];

// Get user's spin data from localStorage
export const getUserSpinData = (userId: string): UserSpinData => {
  try {
    const allData = localStorage.getItem(WHEEL_SPIN_STORAGE_KEY);
    const parsedData = allData ? JSON.parse(allData) : {};
    
    // Return user data if exists, otherwise initialize empty data
    return parsedData[userId] || {
      lastSpinTime: 0,
      spinHistory: [],
      paidSpins: 0
    };
  } catch (error) {
    console.error('Error getting user spin data:', error);
    // Return empty data on error
    return {
      lastSpinTime: 0,
      spinHistory: [],
      paidSpins: 0
    };
  }
};

// Save user's spin data to localStorage
export const saveUserSpinData = (userId: string, spinData: UserSpinData): boolean => {
  try {
    const allData = localStorage.getItem(WHEEL_SPIN_STORAGE_KEY);
    const parsedData = allData ? JSON.parse(allData) : {};
    
    // Update data for this user
    parsedData[userId] = spinData;
    
    // Save all data back to localStorage
    localStorage.setItem(WHEEL_SPIN_STORAGE_KEY, JSON.stringify(parsedData));
    return true;
  } catch (error) {
    console.error('Error saving user spin data:', error);
    return false;
  }
};

// Check if a user can spin (24 hour cooldown or has paid spins)
export const canUserSpin = (userId: string): boolean => {
  const userData = getUserSpinData(userId);
  
  // If user has paid spins, they can spin anytime
  if (userData.paidSpins > 0) {
    return true;
  }
  
  // Otherwise, check the 24 hour cooldown
  const now = Date.now();
  const hoursSinceLastSpin = (now - userData.lastSpinTime) / (1000 * 60 * 60);
  
  // Allow spin if it's been 24 hours since the last spin
  return hoursSinceLastSpin >= 24;
};

// Calculate time until next available spin
export const getTimeUntilNextSpin = (userId: string): number => {
  const userData = getUserSpinData(userId);
  const now = Date.now();
  const nextSpinTime = userData.lastSpinTime + (24 * 60 * 60 * 1000);
  
  return Math.max(0, nextSpinTime - now);
};

// Format the time until next spin in a friendly format
export const formatTimeUntilNextSpin = (milliseconds: number): string => {
  if (milliseconds <= 0) {
    return 'Now';
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Perform a spin and get the result based on probabilities
export const spinWheel = (userId: string, usePaidSpin: boolean = false): SpinResult | null => {
  const userData = getUserSpinData(userId);
  
  // Check if user can spin
  if (usePaidSpin) {
    // Check if user has paid spins available
    if (userData.paidSpins <= 0) {
      return null;
    }
  } else {
    // Check regular 24-hour cooldown
    const now = Date.now();
    const hoursSinceLastSpin = (now - userData.lastSpinTime) / (1000 * 60 * 60);
    if (hoursSinceLastSpin < 24) {
      return null;
    }
  }
  
  // Calculate the weighted random segment
  const segmentResult = getWeightedRandomSegment();
  if (!segmentResult) {
    return null;
  }
  
  // Create spin result
  const result: SpinResult = {
    id: Math.random().toString(36).substring(2, 15),
    userId,
    segmentId: segmentResult.id,
    reward: segmentResult.value,
    timestamp: Date.now()
  };
  
  // Update user spin data
  if (!usePaidSpin) {
    // Update last spin time only for regular spins (not paid ones)
    userData.lastSpinTime = result.timestamp;
  } else {
    // Decrement paid spins count
    userData.paidSpins = Math.max(0, userData.paidSpins - 1);
  }
  
  // Add to history
  userData.spinHistory.unshift(result); // Add to the beginning of the history array
  
  // Limit history to 20 entries to keep localStorage size manageable
  if (userData.spinHistory.length > 20) {
    userData.spinHistory = userData.spinHistory.slice(0, 20);
  }
  
  // Save updated data
  saveUserSpinData(userId, userData);
  
  return result;
};

// Get a random segment based on probability weights
export const getWeightedRandomSegment = (): WheelSegment | null => {
  // Calculate total probability weight
  const totalWeight = wheelSegments.reduce((sum, segment) => sum + segment.probability, 0);
  
  // Generate a random value between 0 and total weight
  const randomValue = Math.random() * totalWeight;
  
  // Find the segment that matches the random value
  let cumulativeWeight = 0;
  for (const segment of wheelSegments) {
    cumulativeWeight += segment.probability;
    if (randomValue <= cumulativeWeight) {
      return segment;
    }
  }
  
  // Fallback to first segment in case of any issues
  return wheelSegments[0];
};

// Get a segment by its ID
export const getSegmentById = (segmentId: number): WheelSegment | undefined => {
  return wheelSegments.find(segment => segment.id === segmentId);
};

// Format transaction for the JackCoins earned from the wheel
export const createWheelTransaction = (userId: string, reward: number): Transaction => {
  return {
    id: Math.random().toString(36).substring(2, 15),
    amount: reward,
    description: `Çark Çevir Ödülü: ${reward} JackCoin`,
    type: 'bonus' as const,
    timestamp: Date.now(),
    userId
  };
};

// Add paid spins to a user's account
export const addPaidSpins = (userId: string, spinCount: number): boolean => {
  try {
    const userData = getUserSpinData(userId);
    
    // Add paid spins
    userData.paidSpins = (userData.paidSpins || 0) + spinCount;
    
    // Save updated data
    return saveUserSpinData(userId, userData);
  } catch (error) {
    console.error('Error adding paid spins:', error);
    return false;
  }
};

// Get the number of paid spins a user has
export const getUserPaidSpins = (userId: string): number => {
  const userData = getUserSpinData(userId);
  return userData.paidSpins || 0;
}; 