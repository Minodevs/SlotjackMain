import { Transaction } from '@/types/transactions';

// Local storage key for caching
const TRANSACTIONS_CACHE_KEY = 'slotjack_transactions_cache';

/**
 * Get all transactions from storage
 */
export const getAllTransactions = async (): Promise<Transaction[]> => {
  console.log('TransactionsService.getAllTransactions called');
  
  try {
    // Try to get transactions from the API first (server-side handling)
    try {
      console.log('Attempting to fetch transactions from API...');
      const response = await fetch('/api/transactions');
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Successfully fetched ${data.transactions?.length || 0} transactions from API`);
        return data.transactions as Transaction[];
      }
    } catch (apiError) {
      console.error('Error fetching transactions from API:', apiError);
    }
    
    // Fall back to local storage
    return getCachedTransactions();
  } catch (error) {
    console.error('Error in getAllTransactions:', error);
    return [];
  }
};

/**
 * Get transactions for a specific user
 */
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    // Try API first
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.transactions as Transaction[];
      }
    } catch (apiError) {
      console.error('Error fetching user transactions from API:', apiError);
    }
    
    // Fall back to local storage and filter by user ID
    const allTransactions = getCachedTransactions();
    return allTransactions.filter(tx => tx.userId === userId);
  } catch (error) {
    console.error('Error in getUserTransactions:', error);
    return [];
  }
};

/**
 * Add a new transaction
 */
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  console.log('TransactionsService.addTransaction called with:', transaction);
  
  try {
    // Try API first
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Transaction saved via API:', data);
        return data as Transaction;
      }
    } catch (apiError) {
      console.error('Error adding transaction via API:', apiError);
    }
    
    // Create a fallback transaction with local ID
    const fallbackTransaction: Transaction = {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ...transaction
    };
    
    // Store locally
    updateLocalCache(fallbackTransaction);
    
    return fallbackTransaction;
  } catch (error) {
    console.error('Error in addTransaction:', error);
    
    // Create a fallback transaction with local ID
    const fallbackTransaction: Transaction = {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ...transaction
    };
    
    return fallbackTransaction;
  }
};

/**
 * Get cached transactions
 */
const getCachedTransactions = (): Transaction[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cachedData = localStorage.getItem(TRANSACTIONS_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }
  } catch (error) {
    console.error('Error retrieving cached transactions:', error);
  }
  return [];
};

/**
 * Update local cache
 */
const updateLocalCache = (transaction: Transaction): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const transactions = getCachedTransactions();
      const existingIndex = transactions.findIndex(t => t.id === transaction.id);
      
      if (existingIndex >= 0) {
        transactions[existingIndex] = transaction;
      } else {
        transactions.push(transaction);
      }
      
      localStorage.setItem(TRANSACTIONS_CACHE_KEY, JSON.stringify(transactions));
    }
  } catch (error) {
    console.error('Error updating transaction cache:', error);
  }
};

/**
 * Update a transaction 
 */
export const updateTransaction = async (transaction: Transaction): Promise<Transaction> => {
  try {
    // Try to update via API first
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data as Transaction;
      }
    } catch (apiError) {
      console.error('Error updating transaction via API:', apiError);
    }
    
    // Fall back to just updating the local cache
    updateLocalCache(transaction);
    return transaction;
  } catch (error) {
    console.error('Error in updateTransaction:', error);
    return transaction;
  }
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (transactionId: string): Promise<void> => {
  try {
    // Try API first
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from local cache
        removeFromLocalCache(transactionId);
        return;
      }
    } catch (apiError) {
      console.error('Error deleting transaction via API:', apiError);
    }
    
    // Just remove from local cache if API fails
    removeFromLocalCache(transactionId);
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
  }
};

/**
 * Add multiple transactions at once (batch insert)
 */
export const addBulkTransactions = async (transactions: Omit<Transaction, 'id'>[]): Promise<Transaction[]> => {
  try {
    // Try to add via API first
    try {
      const response = await fetch('/api/transactions/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactions })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update local cache with all new transactions
        if (data.transactions) {
          data.transactions.forEach((transaction: Transaction) => updateLocalCache(transaction));
        }
        
        return data.transactions as Transaction[];
      }
    } catch (apiError) {
      console.error('Error adding bulk transactions via API:', apiError);
    }
    
    // Create local fallback transactions
    const localTransactions: Transaction[] = transactions.map(tx => ({
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ...tx
    }));
    
    // Update local cache
    localTransactions.forEach(transaction => updateLocalCache(transaction));
    
    return localTransactions;
  } catch (error) {
    console.error('Error in addBulkTransactions:', error);
    return [];
  }
};

/**
 * Remove a transaction from local cache
 */
const removeFromLocalCache = (transactionId: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cachedData = getCachedTransactions();
      const updatedData = cachedData.filter(t => t.id !== transactionId);
      localStorage.setItem(TRANSACTIONS_CACHE_KEY, JSON.stringify(updatedData));
    }
  } catch (error) {
    console.error('Error removing transaction from local cache:', error);
  }
};

/**
 * Sync local storage transactions with database
 * This is useful for initial migration of data
 */
export const syncLocalTransactionsWithSupabase = async (localTransactions: Transaction[]): Promise<{success: number, error: number, total: number}> => {
  console.log(`Starting migration of ${localTransactions.length} transactions...`);
  
  try {
    // Initialize counters
    let successCount = 0;
    let errorCount = 0;
    
    // Try to send to API in batches
    const batchSize = 50;
    
    for (let i = 0; i < localTransactions.length; i += batchSize) {
      const batch = localTransactions.slice(i, i + batchSize);
      const batchEnd = Math.min(i + batchSize, localTransactions.length);
      
      console.log(`Processing batch ${i+1}-${batchEnd} of ${localTransactions.length}`);
      
      try {
        // Try using the API route
        const response = await fetch('/api/transactions/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ transactions: batch })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`Successfully migrated batch via API: ${result.count} transactions`);
          successCount += result.count;
        } else {
          console.warn('API route failed for batch');
          errorCount += batch.length;
        }
      } catch (batchError) {
        console.error(`Failed to process batch ${i}-${batchEnd}:`, batchError);
        errorCount += batch.length;
      }
      
      // Wait a bit to not overload the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Migration completed. Success: ${successCount}, Errors: ${errorCount}, Total: ${localTransactions.length}`);
    
    return {
      success: successCount,
      error: errorCount,
      total: localTransactions.length
    };
  } catch (error) {
    console.error('Fatal error during migration:', error);
    return {
      success: 0,
      error: localTransactions.length,
      total: localTransactions.length
    };
  }
}; 