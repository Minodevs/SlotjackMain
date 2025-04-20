'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import * as authService from '../utils/auth';
import { addTransaction } from '@/services/TransactionsService';
import { createClient } from '@/lib/supabase/client';

// User Rank enumeration
export enum UserRank {
  ADMIN = 'admin',
  VIP = 'vip',
  NORMAL = 'normal'
}

// Transaction type for JackPoints
interface Transaction {
  id: string;
  amount: number;
  description: string;
  timestamp: number;
  type: 'earn' | 'spend' | 'bonus' | 'event' | 'admin';
}

// Mock user type
export type User = {
  id: string;
  email: string;
  name?: string;
  jackPoints: number;
  transactions: Transaction[];
  lastUpdated: number;
  hasReceivedInitialBonus: boolean;
  rank: UserRank;
  isVerified: boolean;
  avatar?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  socialAccounts?: Record<string, string>;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateJackPoints: (amount: number, description: string, type: Transaction['type']) => Promise<Transaction | null>;
  getRecentTransactions: (limit?: number) => Transaction[];
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  leaderboard: User[];
  refreshLeaderboard: () => void;
  navigate: (path: string) => void;
  livestream: {
    isLive: boolean;
    url: string;
  };
  updateLivestream: (data: { isLive: boolean; url: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the context so it can be imported directly
export { AuthContext };

// Local storage keys
const USER_STORAGE_KEY = 'slotjack_user';
const REGISTERED_USERS_KEY = 'slotjack_registered_users';
const LEADERBOARD_STORAGE_KEY = 'slotjack_leaderboard';

// The table name for user profiles in Supabase
const PROFILES_TABLE = 'profiles';

// Type for registered users in localStorage
interface RegisteredUserData {
  email: string;
  name?: string;
  password: string;
  verified?: boolean;
  provider?: 'google' | 'github' | 'email';
  hasReceivedInitialBonus?: boolean;
  rank?: UserRank;
  isVerified?: boolean;
  id?: string;
  jackPoints?: number;
  transactions?: Transaction[];
  avatar?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  socialAccounts?: Record<string, string>;
  socialVerifications?: Record<string, any>;
  browserId?: string; // Browser ID field for cross-browser recovery
  lastLogin?: number; // Timestamp of last login
  registrationDate?: number; // Timestamp of registration
}

// Helper to create a transaction
const createTransaction = (amount: number, description: string, type: Transaction['type']): Transaction => {
  return {
    id: Math.random().toString(36).substring(2, 15),
    amount,
    description,
    timestamp: Date.now(),
    type
  };
};

export type UpdateProfileData = {
  name?: string;
  avatar?: string;
  rank?: UserRank;
  phoneNumber?: string;
  phoneVerified?: boolean;
  socialAccounts?: Record<string, string>;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [livestream, setLivestream] = useState({
    isLive: false,
    url: ''
  });
  const [isClient, setIsClient] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Helper for smoother navigation
  const navigate = (path: string) => {
    // Don't navigate to the same page
    if (path === pathname) return;
    
    // Reset all state variables regardless of previous values
    setNavigating(true);
    setLoading(true);
    
    // Special case for leaderboard page - use hard navigation
    if (pathname === '/liderlik-tablosu') {
      console.log('Hard navigating from leaderboard context');
      // For leaderboard, use direct browser navigation which completely resets everything
      window.location.href = path;
      return;
    }
    
    // For other pages, use Next.js router
    setTimeout(() => {
      try {
        router.push(path);
      } catch (error) {
        console.error('Router navigation failed:', error);
        // Fall back to direct navigation if router fails
        window.location.href = path;
      }
      
      // Reset loading states after navigation completes
      setTimeout(() => {
        setNavigating(false);
        setLoading(false);
      }, 250);
    }, 50);
  };

  // Set isClient to true once component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
    
    // Set a brief loading timeout to ensure we don't render too quickly
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          const storedUser = localStorage.getItem(USER_STORAGE_KEY);
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              // Initialize transactions array if it doesn't exist in stored data
              if (!userData.transactions) {
                userData.transactions = [];
              }
              // Initialize lastUpdated if it doesn't exist
              if (!userData.lastUpdated) {
                userData.lastUpdated = Date.now();
              }
              // Initialize hasReceivedInitialBonus if it doesn't exist
              if (userData.hasReceivedInitialBonus === undefined) {
                userData.hasReceivedInitialBonus = userData.jackPoints >= 150;
              }
              // Initialize rank if it doesn't exist
              if (userData.rank === undefined) {
                userData.rank = UserRank.NORMAL;
              }
              
              // Special case for primary admin account
              if (userData.email && userData.email.toLowerCase() === 'sezarpaypals2@gmail.com') {
                userData.rank = UserRank.ADMIN;
              }
              
              setUser(userData);
            } catch (e) {
              console.error('Failed to parse stored user');
            }
          }
          
          // Get leaderboard data
          refreshLeaderboard();
          
          // Add storage event listener to detect changes from other tabs/browsers
          const handleStorageChange = (event: StorageEvent) => {
            if (!event.key) return;
            
            // Important: Only handle storage events from OTHER tabs/windows
            // The storage event doesn't fire in the same tab that made the change
            // so we don't need to worry about that, but we need to prevent recursion
            
            // Adding a check to prevent too frequent updates
            const now = Date.now();
            if (lastStorageEvent && now - lastStorageEvent < 100) {
              console.log('Throttling storage event to prevent loops');
              return;  // Throttle events that happen too quickly
            }
            lastStorageEvent = now;
            
            // If user data changed in another tab
            if (event.key === USER_STORAGE_KEY && event.newValue) {
              try {
                const newUserData = JSON.parse(event.newValue);
                
                // Only update if the data is actually different
                // This prevents unnecessary re-renders
                if (JSON.stringify(user) !== JSON.stringify(newUserData)) {
                  console.log('User data updated from another tab/browser');
                  setUser(newUserData);
                }
              } catch (e) {
                console.error('Failed to parse user data from storage event', e);
              }
            }
            
            // If registered users data changed, refresh data but don't set state directly
            if (event.key === REGISTERED_USERS_KEY) {
              console.log('Registered users changed in another tab');
              // Don't call full syncUserData which sets state, just refresh leaderboard
              refreshLeaderboard();
            }
            
            // If leaderboard data changed in another tab
            if (event.key === LEADERBOARD_STORAGE_KEY && event.newValue) {
              try {
                const newLeaderboard = JSON.parse(event.newValue);
                
                // Only update if the data is actually different
                if (JSON.stringify(leaderboard) !== JSON.stringify(newLeaderboard)) {
                  console.log('Leaderboard updated from another tab/browser');
                  setLeaderboard(newLeaderboard);
                }
              } catch (e) {
                console.error('Failed to parse leaderboard data from storage event', e);
              }
            }
          };
          
          // Track last storage event to prevent too frequent updates
          let lastStorageEvent = 0;
          
          window.addEventListener('storage', handleStorageChange);
          return () => {
            window.removeEventListener('storage', handleStorageChange);
          };
          
        } catch (e) {
          console.error('Error accessing localStorage:', e);
        } finally {
          setLoading(false);
        }
      }
    }, 300); // Increased delay to ensure stable hydration
    
    return () => clearTimeout(timer);
  }, []);

  // Initialize livestream status from localStorage
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const storedLivestream = localStorage.getItem('slotjack_livestream');
      if (storedLivestream) {
        setLivestream(JSON.parse(storedLivestream));
      }
    } catch (err) {
      console.error('Error loading livestream status:', err);
    }
  }, []);

  // Refresh leaderboard data from localStorage
  const refreshLeaderboard = () => {
    if (!isClient) return;
    
    try {
      const storedLeaderboard = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (storedLeaderboard) {
        const parsedLeaderboard = JSON.parse(storedLeaderboard);
        
        // Ensure each user has a rank and isVerified property
        const updatedLeaderboard = parsedLeaderboard.map((user: any) => {
          // Check if this is a system account
          const systemEmails = ['admin@example.com', 'sezarpaypals2@gmail.com', 'vip@example.com', 'normal@example.com', 'user1@example.com', 'user2@example.com'];
          const isSystemAccount = systemEmails.includes(user.email?.toLowerCase());
          
          return {
            ...user,
            rank: user.rank || UserRank.NORMAL, // Set default rank if not present
            isVerified: user.isVerified !== undefined ? user.isVerified : !isSystemAccount // Mark system accounts as not verified
          };
        });
        
        setLeaderboard(updatedLeaderboard);
        localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updatedLeaderboard));
      } else {
        // If no leaderboard exists yet, create one from registered users
        const registeredUsers = getRegisteredUsers();
        
        // Convert to array and sort by points
        const userArray = Object.values(registeredUsers).map((userData, index) => {
          return {
            id: Math.random().toString(36).substring(2, 15),
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            jackPoints: Math.floor(Math.random() * 15000) + 1000, // Random points for initial demo
            transactions: [],
            lastUpdated: Date.now(),
            hasReceivedInitialBonus: userData.hasReceivedInitialBonus || false,
            rank: userData.rank || UserRank.NORMAL, // Set default rank
            isVerified: false, // Mark system accounts as not verified
            avatar: undefined,
            phoneNumber: undefined,
            phoneVerified: undefined
          };
        });
        
        // Sort by jackPoints descending
        userArray.sort((a, b) => b.jackPoints - a.jackPoints);
        
        // Save to localStorage
        localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(userArray));
        setLeaderboard(userArray);
      }
    } catch (e) {
      console.error('Failed to refresh leaderboard:', e);
    }
  };

  // Save registered users to local storage with improved cross-browser compatibility
  const saveRegisteredUsers = (users: Record<string, RegisteredUserData>) => {
    if (!isClient) return;
    
    try {
      console.log('Saving registered users to all storage locations...');
      
      // Stringify once to reuse
      const usersJSON = JSON.stringify(users);
      
      // 1. Save to localStorage
      localStorage.setItem(REGISTERED_USERS_KEY, usersJSON);
      
      // 2. Save to sessionStorage
      try {
        sessionStorage.setItem(REGISTERED_USERS_KEY, usersJSON);
      } catch (e) {
        console.error('Failed to save to sessionStorage:', e);
      }
      
      // 3. Save to global window object
      try {
        (window as any)['__slotjack_shared_data'] = (window as any)['__slotjack_shared_data'] || {};
        (window as any)['__slotjack_shared_data'][REGISTERED_USERS_KEY] = users;
      } catch (e) {
        console.error('Failed to save to global window object:', e);
      }
      
      // 4. Save to global localStorage (simulating backend)
      try {
        localStorage.setItem('slotjack_global_users', usersJSON);
      } catch (e) {
        console.error('Failed to save to global localStorage:', e);
      }
      
      // 5. Save each user to individual cookies for cross-browser access
      try {
        Object.entries(users).forEach(([email, userData]) => {
          // Create a summarized version for cookies to avoid size limits
          const cookieUserData = {
            email: userData.email.toLowerCase(),
            name: userData.name,
            id: userData.id,
            password: userData.password, // Ensure password is included
            rank: userData.rank,
            isVerified: userData.isVerified,
            jackPoints: userData.jackPoints,
            hasReceivedInitialBonus: userData.hasReceivedInitialBonus,
            lastLogin: userData.lastLogin || Date.now(),
            browserId: userData.browserId
          };
          
          const userCookieKey = `slotjack_registered_user_${email.toLowerCase()}`;
          document.cookie = `${userCookieKey}=${encodeURIComponent(JSON.stringify(cookieUserData))};path=/;max-age=2592000;SameSite=None;Secure`;
          
          // Also save to localStorage and sessionStorage directly
          try {
            localStorage.setItem(userCookieKey, encodeURIComponent(JSON.stringify(cookieUserData)));
            sessionStorage.setItem(userCookieKey, encodeURIComponent(JSON.stringify(cookieUserData)));
          } catch (e) {
            console.error(`Failed to save user ${email} to direct storage:`, e);
          }
        });
      } catch (e) {
        console.error('Failed to save users to cookies:', e);
      }
    } catch (e) {
      console.error('Error saving registered users:', e);
    }
  };

  // Enhanced function to check all storage locations for user data
  const getRegisteredUsers = (): Record<string, RegisteredUserData> => {
    if (!isClient) return {};
    
    console.log('Getting registered users from all storage locations...');
    const allUsers: Record<string, RegisteredUserData> = {};
    
    try {
      // 1. First try from localStorage (primary source)
      try {
        const stored = localStorage.getItem(REGISTERED_USERS_KEY);
        if (stored) {
          const parsedUsers = JSON.parse(stored);
          Object.entries(parsedUsers).forEach(([email, userData]) => {
            allUsers[email.toLowerCase()] = userData as RegisteredUserData;
          });
          console.log(`Found ${Object.keys(allUsers).length} users in localStorage`);
        }
      } catch (e) {
        console.error('Failed to parse registered users from localStorage:', e);
      }

      // 2. Check sessionStorage
      try {
        const sessionData = sessionStorage.getItem(REGISTERED_USERS_KEY);
        if (sessionData) {
          const sessionUsers = JSON.parse(sessionData);
          Object.entries(sessionUsers).forEach(([email, userData]) => {
            // Only add if not already present
            if (!allUsers[email.toLowerCase()]) {
              allUsers[email.toLowerCase()] = userData as RegisteredUserData;
            }
          });
          console.log(`Added ${Object.keys(sessionUsers).length} users from sessionStorage`);
        }
      } catch (e) {
        console.error('Failed to get users from sessionStorage:', e);
      }

      // 3. Check global window object
      try {
        if ((window as any)['__slotjack_shared_data'] && 
            (window as any)['__slotjack_shared_data'][REGISTERED_USERS_KEY]) {
          const globalUsers = (window as any)['__slotjack_shared_data'][REGISTERED_USERS_KEY];
          Object.entries(globalUsers).forEach(([email, userData]) => {
            // Only add if not already present
            if (!allUsers[email.toLowerCase()]) {
              allUsers[email.toLowerCase()] = userData as RegisteredUserData;
            }
          });
          console.log(`Added users from global window object`);
        }
      } catch (e) {
        console.error('Failed to get users from global window object:', e);
      }

      // 4. Check global localStorage (backend simulation)
      try {
        const backendSimulation = localStorage.getItem('slotjack_global_users');
        if (backendSimulation) {
          const backendUsers = JSON.parse(backendSimulation);
          Object.entries(backendUsers).forEach(([email, userData]) => {
            // Only add if not already present
            if (!allUsers[email.toLowerCase()]) {
              allUsers[email.toLowerCase()] = userData as RegisteredUserData;
            }
          });
          console.log(`Added users from simulated backend`);
        }
      } catch (e) {
        console.error('Failed to get users from simulated backend:', e);
      }

      // 5. Check cookies for any individual user data
      try {
        const cookies = document.cookie.split(';');
        const userCookies = cookies.filter(cookie => 
          cookie.trim().startsWith('slotjack_registered_user_')
        );
        
        for (const cookie of userCookies) {
          try {
            const parts = cookie.trim().split('=');
            if (parts.length !== 2) continue;
            
            const userEmail = parts[0].replace('slotjack_registered_user_', '').toLowerCase();
            const userDataStr = decodeURIComponent(parts[1]);
            const cookieUserData = JSON.parse(userDataStr);
            
            // Only add if not already present or if this is newer
            if (!allUsers[userEmail] || 
                (cookieUserData.lastLogin && 
                 (!allUsers[userEmail].lastLogin || 
                  cookieUserData.lastLogin > allUsers[userEmail].lastLogin))) {
              
              allUsers[userEmail] = cookieUserData as RegisteredUserData;
              console.log(`Added/updated user ${userEmail} from cookies`);
            }
          } catch (e) {
            console.error('Error parsing user cookie:', e);
          }
        }
      } catch (e) {
        console.error('Error checking for user cookies:', e);
      }

      // If we found any users, ensure they're saved to all locations
      if (Object.keys(allUsers).length > 0) {
        // Skip normal save to avoid recursion, but update localStorage directly
        try {
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(allUsers));
        } catch (e) {
          console.error('Failed to update localStorage with merged users:', e);
        }
      } else {
        console.log('No registered users found in any storage location');
      }

      return allUsers;
    } catch (e) {
      console.error('Error accessing user storage:', e);
      return {};
    }
  };

  // Update leaderboard when user points change
  const updateLeaderboard = (updatedUser: User) => {
    if (!isClient) return;
    
    try {
      // Create a new leaderboard array with updated user data
      const updatedLeaderboard = [...leaderboard];
      
      // Find if user exists in the leaderboard
      const existingUserIndex = updatedLeaderboard.findIndex(u => u.email === updatedUser.email);
      
      if (existingUserIndex !== -1) {
        // Update existing user
        updatedLeaderboard[existingUserIndex] = {
          ...updatedLeaderboard[existingUserIndex],
          jackPoints: updatedUser.jackPoints,
          lastUpdated: Date.now(),
          hasReceivedInitialBonus: updatedUser.hasReceivedInitialBonus,
          rank: updatedUser.rank,
          isVerified: updatedUser.isVerified,
          name: updatedUser.name,
          avatar: updatedUser.avatar,
          phoneNumber: updatedUser.phoneNumber,
          phoneVerified: updatedUser.phoneVerified,
          socialAccounts: updatedUser.socialAccounts
        };
      } else {
        // Add new user to leaderboard
        updatedLeaderboard.push({
          ...updatedUser,
          lastUpdated: Date.now()
        });
      }
      
      // Sort by jackPoints
      updatedLeaderboard.sort((a, b) => b.jackPoints - a.jackPoints);
      
      // Save to localStorage
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updatedLeaderboard));
      
      // Update state
      setLeaderboard(updatedLeaderboard);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user } = await authService.login(email, password);
      setUser(user);
      
      // Refresh leaderboard after login
      refreshLeaderboard();
      
      return;
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.toString());
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user } = await authService.register(email, password, name);
      setUser(user);
      
      // Refresh leaderboard after registration
      refreshLeaderboard();
      
      return;
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.toString());
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log out user
      authService.logout();
      
      // Clear user state
      setUser(null);
      
      // Redirect to home page
      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      setError('Çıkış sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const updateJackPoints = async (amount: number, description: string, type: Transaction['type']): Promise<Transaction | null> => {
    if (!user) return null;
    
    try {
      // Create transaction
      const newTransaction = createTransaction(amount, description, type);
      
      // Add to user's transactions and update points
      const updatedUser = {
        ...user,
        jackPoints: user.jackPoints + amount,
        transactions: [newTransaction, ...user.transactions],
        lastUpdated: Date.now()
      };
      
      // Save to localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      
      // Update the user state
      setUser(updatedUser);
      
      // Also update the leaderboard with the new points and transaction
      updateLeaderboard(updatedUser);
      
      // Save to Supabase database
      try {
        const supabaseClient = await createClient();
        
        // Update user profile with new jackPoints value
        const { error: updateError } = await supabaseClient
          .from(PROFILES_TABLE)
          .update({
            jackPoints: updatedUser.jackPoints,
            lastUpdated: updatedUser.lastUpdated
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Error updating jackPoints in Supabase:', updateError);
          // Continue execution - we'll still try to save the transaction
        } else {
          console.log('Successfully updated jackPoints in Supabase');
        }
        
        // Create the transaction with user data
        console.log('Saving transaction to database:', {
          id: newTransaction.id,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          amount,
          description,
          timestamp: newTransaction.timestamp,
          type
        });
        
        const savedTransaction = await addTransaction({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          amount,
          description,
          timestamp: newTransaction.timestamp,
          type,
          userPhone: user.phoneNumber,
          userSocialMedia: {
            // Add any social media accounts from the user object
            telegram: user.socialAccounts?.telegram,
            discord: user.socialAccounts?.discord,
            instagram: user.socialAccounts?.instagram,
            twitter: user.socialAccounts?.twitter,
            facebook: user.socialAccounts?.facebook,
          }
        });
        
        console.log('Transaction saved successfully:', savedTransaction);
      } catch (dbError) {
        console.error('Failed to save transaction to database:', dbError);
        // Make another attempt with simplified data
        try {
          await addTransaction({
            userId: user.id,
            userEmail: user.email,
            userName: user.name || '',
            amount,
            description,
            timestamp: newTransaction.timestamp,
            type
          });
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
        }
      }
      
      return newTransaction;
    } catch (error) {
      console.error('Error updating jackPoints:', error);
      return null;
    }
  };

  // Get recent transactions
  const getRecentTransactions = (limit: number = 10): Transaction[] => {
    if (!user || !user.transactions) return [];
    
    return [...user.transactions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  };

  // Update user profile
  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      const result = await authService.updateProfile(data);
      
      if (result.success) {
        setUser(result.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!isClient || !user) return false;
    
    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      // For now, we'll just return true
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update livestream status
  const updateLivestream = (data: { isLive: boolean; url: string }) => {
    setLivestream(data);
    
    if (isClient) {
      localStorage.setItem('slotjack_livestream', JSON.stringify(data));
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateJackPoints,
    getRecentTransactions,
    updateProfile,
    updatePassword,
    leaderboard,
    refreshLeaderboard,
    navigate,
    livestream,
    updateLivestream
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 