// Basic UserService implementation
// This service handles user-related operations

interface User {
  id: string;
  username: string;
  email: string;
  spinCount?: number;
  jackCoins?: number;
  inventory?: Array<{
    id: string;
    name: string;
    dateAdded: string;
    used: boolean;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// In-memory user store for demonstration
let users: User[] = [
  {
    id: 'user1',
    username: 'demo_user',
    email: 'demo@example.com',
    spinCount: 5,
    jackCoins: 100,
    inventory: []
  }
];

export const UserService = {
  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    return users;
  },

  /**
   * Get a user by ID
   */
  async getUserById(id: string): Promise<User | undefined> {
    return users.find(user => user.id === id);
  },

  /**
   * Create a new user
   */
  async createUser(user: User): Promise<User> {
    users.push(user);
    return user;
  },

  /**
   * Update an existing user
   */
  async updateUser(updatedUser: User): Promise<User | undefined> {
    const index = users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      return updatedUser;
    }
    return undefined;
  },

  /**
   * Delete a user by ID
   */
  async deleteUser(id: string): Promise<boolean> {
    const initialLength = users.length;
    users = users.filter(user => user.id !== id);
    return initialLength > users.length;
  },

  /**
   * Add spins to a user
   */
  async addSpins(userId: string, count: number): Promise<User | undefined> {
    const user = await this.getUserById(userId);
    if (user) {
      user.spinCount = (user.spinCount || 0) + count;
      return this.updateUser(user);
    }
    return undefined;
  },

  /**
   * Add JackCoins to a user
   */
  async addJackCoins(userId: string, amount: number): Promise<User | undefined> {
    const user = await this.getUserById(userId);
    if (user) {
      user.jackCoins = (user.jackCoins || 0) + amount;
      return this.updateUser(user);
    }
    return undefined;
  },

  /**
   * Add an item to a user's inventory
   */
  async addItemToInventory(userId: string, item: any): Promise<User | undefined> {
    const user = await this.getUserById(userId);
    if (user) {
      if (!user.inventory) {
        user.inventory = [];
      }
      user.inventory.push({
        ...item,
        dateAdded: new Date().toISOString(),
        used: false
      });
      return this.updateUser(user);
    }
    return undefined;
  }
}; 