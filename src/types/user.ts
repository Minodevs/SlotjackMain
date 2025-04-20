// User Rank enumeration 
export enum UserRank {
  ADMIN = 'admin',
  VIP = 'vip',
  NORMAL = 'normal'
}

// Social Media Accounts interface
export interface SocialMediaAccounts {
  telegram?: string;
  twitter?: string;
  instagram?: string;
  discord?: string;
  youtube?: string;
}

// User Award type definition
export type AwardType = 'achievement' | 'medal' | 'trophy';

// User Award interface
export interface UserAward {
  id: string;
  userId: string;
  type: AwardType;
  title: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
}

// User interface definition
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  jackPoints: number;
  rank: UserRank;
  transactions: Transaction[];
  favorites: string[];
  socialAccounts?: SocialMediaAccounts;
  phoneNumber?: string;
  notifications: Notification[];
  verified: boolean;
  createdAt: number;
  lastUpdated: number;
  lastDailyBonus?: number;
  avatar?: string;
}

// Define Transaction type
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  timestamp: number;
  type: string;
}

// Define Player interface
export interface Player {
  id: number;
  name: string;
  points: number;
  avatar: string;
}

// Define Tournament interface
export interface Tournament {
  id: number;
  name: string;
  date: string;
  prizePool: number;
  entryFee: number;
  participants: number;
  isVipOnly?: boolean;
}

// Social platform interface for rendering social media buttons
export interface SocialPlatform {
  id: number;
  name: string;
  icon: string;
  color: string;
  link: string;
}

// Define redemption code interface
export interface RedemptionCode {
  id: string;
  code: string;
  pointValue: number;
  isUsed: boolean;
  createdAt: number;
  usedAt?: number;
  usedBy?: string;
  description?: string;
}

// Type guard function to verify User type
export function isUser(obj: any): obj is User {
  return obj && typeof obj === 'object' 
    && 'id' in obj
    && 'email' in obj
    && 'jackPoints' in obj
    && 'transactions' in obj
    && 'lastUpdated' in obj
    && 'rank' in obj;
} 