// Market item interface
export interface MarketItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  points: number;  // Jackcoin price
  category: string;
  featured: boolean;
  virtual: boolean;  // Virtual items don't have physical stock
  stock?: number;    // Physical items have stock
  createdAt?: string;
  updatedAt?: string;
  price?: string | number;
  priceValue?: number;
}

// Market item categories
export const MARKET_CATEGORIES = {
  BETTING: 'betting',
} as const;

// Local storage keys
export const MARKET_ITEMS_STORAGE_KEY = 'market_items'; 