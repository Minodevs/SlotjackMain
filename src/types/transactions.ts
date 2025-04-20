/**
 * Transaction type definition
 */
export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  amount: number;
  description: string;
  timestamp: number;
  type: 'earn' | 'spend' | 'bonus' | 'event' | 'admin';
  userPhone?: string;
  userSocialMedia?: {
    telegram?: string;
    discord?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  // For migration purposes
  externalId?: string;
  // Additional metadata
  metadata?: {
    [key: string]: any;
  };
} 