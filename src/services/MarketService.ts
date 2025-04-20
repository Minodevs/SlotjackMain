// Basic MarketService implementation 
// This service handles operations related to marketplace items

interface MarketItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  isVirtual?: boolean;
  category?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

// In-memory store for demonstration
let marketItems: MarketItem[] = [
  {
    id: 'item1',
    name: 'Premium Spins Package',
    description: '10 premium wheel spins',
    price: 5.99,
    isVirtual: true,
    category: 'spins'
  },
  {
    id: 'item2',
    name: 'JackCoins Bundle',
    description: '1000 JackCoins',
    price: 9.99,
    isVirtual: true,
    category: 'jackcoins'
  }
];

export const MarketService = {
  /**
   * Get all available market items
   */
  async getItems(): Promise<MarketItem[]> {
    return marketItems;
  },

  /**
   * Get a market item by ID
   */
  async getItemById(id: string): Promise<MarketItem | undefined> {
    return marketItems.find(item => item.id === id);
  },

  /**
   * Add a new market item
   */
  async addItem(item: MarketItem): Promise<MarketItem> {
    marketItems.push(item);
    return item;
  },

  /**
   * Update an existing market item
   */
  async updateItem(updatedItem: MarketItem): Promise<MarketItem | undefined> {
    const index = marketItems.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      marketItems[index] = updatedItem;
      return updatedItem;
    }
    return undefined;
  },

  /**
   * Delete a market item by ID
   */
  async deleteItem(id: string): Promise<boolean> {
    const initialLength = marketItems.length;
    marketItems = marketItems.filter(item => item.id !== id);
    return initialLength > marketItems.length;
  }
}; 