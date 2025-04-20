// Define the WinSubmission interface
export interface WinSubmission {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  gameName: string;
  bet: number;
  winAmount: number;
  sponsor: string;
  sponsorLogo?: string;
  date: string;
  link?: string;
  imageUrl?: string;
  timestamp: number; // Used for sorting and tracking
}

// Key for both localStorage backup and database reference
export const SUBMISSIONS_STORAGE_KEY = 'slotjack_win_submissions';

// Initialize IndexedDB
let db: IDBDatabase | null = null;

const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      // Server-side rendering case
      resolve();
      return;
    }

    if (db) {
      resolve();
      return;
    }

    const request = indexedDB.open('SlotjackDB', 1);

    request.onerror = (event) => {
      console.error('Database error:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      console.log('Database initialized successfully');
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains('winSubmissions')) {
        const store = database.createObjectStore('winSubmissions', { keyPath: 'id' });
        // Create indexes for faster queries
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Utility function to ensure database is initialized
const ensureDbInitialized = async (): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
};

// Get all submissions
export const getSubmissions = async (): Promise<WinSubmission[]> => {
  try {
    await ensureDbInitialized();
    
    // Try to get from database first
    if (db) {
      return new Promise((resolve, reject) => {
        const transaction = db!.transaction(['winSubmissions'], 'readonly');
        const store = transaction.objectStore('winSubmissions');
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev'); // Sort by newest first
        
        const submissions: WinSubmission[] = [];
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            // Ensure imageUrl is preserved
            const submission = cursor.value;
            if (submission.imageUrl && typeof submission.imageUrl === 'string') {
              // Make sure the imageUrl is still accessible
              submission.imageUrl = submission.imageUrl.trim();
            }
            submissions.push(submission);
            cursor.continue();
          } else {
            resolve(submissions);
          }
        };
        
        request.onerror = (event) => {
          console.error('Error fetching submissions:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    }
    
    // Fallback to localStorage if database isn't available
    return await getSubmissionsFromLocalStorage();
  } catch (error) {
    console.error('Error in getSubmissions:', error);
    // Fallback to localStorage
    return await getSubmissionsFromLocalStorage();
  }
};

// Add a new submission
export const addSubmission = async (submission: Omit<WinSubmission, 'id' | 'timestamp'>): Promise<WinSubmission> => {
  try {
    await ensureDbInitialized();
    
    const newSubmission: WinSubmission = {
      ...submission,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    
    // Save to database
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db!.transaction(['winSubmissions'], 'readwrite');
        const store = transaction.objectStore('winSubmissions');
        const request = store.add(newSubmission);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error('Error adding submission:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    }
    
    // Backup to localStorage
    await backupToLocalStorage(newSubmission);
    
    // Dispatch event for real-time updates across tabs
    window.dispatchEvent(new CustomEvent('submission-updated'));
    
    return newSubmission;
  } catch (error) {
    console.error('Error in addSubmission:', error);
    // In case of error, still try to save to localStorage
    const newSubmission: WinSubmission = {
      ...submission,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    await backupToLocalStorage(newSubmission);
    return newSubmission;
  }
};

// Update an existing submission
export const updateSubmission = async (submission: WinSubmission): Promise<WinSubmission> => {
  try {
    await ensureDbInitialized();
    
    const updatedSubmission: WinSubmission = {
      ...submission,
      timestamp: Date.now(),
    };
    
    // Update in database
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db!.transaction(['winSubmissions'], 'readwrite');
        const store = transaction.objectStore('winSubmissions');
        const request = store.put(updatedSubmission);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error('Error updating submission:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    }
    
    // Update in localStorage
    await updateLocalStorage(updatedSubmission);
    
    // Dispatch event for real-time updates across tabs
    window.dispatchEvent(new CustomEvent('submission-updated'));
    
    return updatedSubmission;
  } catch (error) {
    console.error('Error in updateSubmission:', error);
    // In case of error, still try to update localStorage
    await updateLocalStorage(submission);
    return submission;
  }
};

// Delete a submission
export const deleteSubmission = async (id: string): Promise<void> => {
  try {
    await ensureDbInitialized();
    
    // Delete from database
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db!.transaction(['winSubmissions'], 'readwrite');
        const store = transaction.objectStore('winSubmissions');
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error('Error deleting submission:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    }
    
    // Delete from localStorage
    await deleteFromLocalStorage(id);
    
    // Dispatch event for real-time updates across tabs
    window.dispatchEvent(new CustomEvent('submission-updated'));
  } catch (error) {
    console.error('Error in deleteSubmission:', error);
    // In case of error, still try to delete from localStorage
    await deleteFromLocalStorage(id);
  }
};

// Get submissions by user ID
export const getSubmissionsByUserId = async (userId: string): Promise<WinSubmission[]> => {
  try {
    await ensureDbInitialized();
    
    if (db) {
      return new Promise((resolve, reject) => {
        const transaction = db!.transaction(['winSubmissions'], 'readonly');
        const store = transaction.objectStore('winSubmissions');
        const index = store.index('userId');
        const request = index.getAll(userId);
        
        request.onsuccess = (event) => {
          const submissions = (event.target as IDBRequest).result as WinSubmission[];
          // Sort by newest first
          submissions.sort((a, b) => b.timestamp - a.timestamp);
          resolve(submissions);
        };
        
        request.onerror = (event) => {
          console.error('Error fetching user submissions:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    }
    
    // Fallback to localStorage
    const submissions = await getSubmissionsFromLocalStorage();
    return submissions.filter(submission => submission.userId === userId);
  } catch (error) {
    console.error('Error in getSubmissionsByUserId:', error);
    // Fallback to localStorage
    const submissions = await getSubmissionsFromLocalStorage();
    return submissions.filter(submission => submission.userId === userId);
  }
};

// Get a single submission by ID
export const getSubmissionById = async (id: string): Promise<WinSubmission | null> => {
  try {
    await ensureDbInitialized();
    
    if (db) {
      return new Promise((resolve, reject) => {
        const transaction = db!.transaction(['winSubmissions'], 'readonly');
        const store = transaction.objectStore('winSubmissions');
        const request = store.get(id);
        
        request.onsuccess = (event) => {
          const submission = (event.target as IDBRequest).result as WinSubmission | undefined;
          resolve(submission || null);
        };
        
        request.onerror = (event) => {
          console.error('Error fetching submission by ID:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    }
    
    // Fallback to localStorage
    const submissions = await getSubmissionsFromLocalStorage();
    return submissions.find(submission => submission.id === id) || null;
  } catch (error) {
    console.error('Error in getSubmissionById:', error);
    // Fallback to localStorage
    const submissions = await getSubmissionsFromLocalStorage();
    return submissions.find(submission => submission.id === id) || null;
  }
};

// Private helper functions for localStorage operations
const getSubmissionsFromLocalStorage = async (): Promise<WinSubmission[]> => {
  try {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!stored) return [];
    
    const submissions = JSON.parse(stored) as WinSubmission[];
    
    // Ensure timestamps exist for all submissions and imageUrl is preserved
    submissions.forEach(sub => {
      if (!sub.timestamp) {
        sub.timestamp = new Date(sub.date).getTime() || Date.now();
      }
      // Make sure imageUrl is still accessible if it exists
      if (sub.imageUrl && typeof sub.imageUrl === 'string') {
        sub.imageUrl = sub.imageUrl.trim();
      }
    });
    
    // Sort by newest first
    return submissions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const saveSubmissionsToLocalStorage = async (submissions: WinSubmission[]): Promise<void> => {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const backupToLocalStorage = async (newSubmission: WinSubmission): Promise<void> => {
  try {
    const submissions = await getSubmissionsFromLocalStorage();
    saveSubmissionsToLocalStorage([newSubmission, ...submissions]);
  } catch (error) {
    console.error('Error backing up to localStorage:', error);
  }
};

const updateLocalStorage = async (updatedSubmission: WinSubmission): Promise<void> => {
  try {
    const submissions = await getSubmissionsFromLocalStorage();
    const updatedSubmissions = submissions.map(submission => 
      submission.id === updatedSubmission.id ? updatedSubmission : submission
    );
    await saveSubmissionsToLocalStorage(updatedSubmissions);
  } catch (error) {
    console.error('Error updating localStorage:', error);
  }
};

const deleteFromLocalStorage = async (id: string): Promise<void> => {
  try {
    const submissions = await getSubmissionsFromLocalStorage();
    const filteredSubmissions = submissions.filter(submission => submission.id !== id);
    await saveSubmissionsToLocalStorage(filteredSubmissions);
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
  }
};

// Initialize database when module is loaded
if (typeof window !== 'undefined') {
  initDatabase().catch(console.error);
}

// Function to sync database with localStorage (useful for migration)
export const syncLocalStorageWithDatabase = async (): Promise<void> => {
  try {
    const localSubmissions = await getSubmissionsFromLocalStorage();
    
    if (localSubmissions.length === 0) return;
    
    await ensureDbInitialized();
    
    if (!db) return;
    
    const transaction = db.transaction(['winSubmissions'], 'readwrite');
    const store = transaction.objectStore('winSubmissions');
    
    for (const submission of localSubmissions) {
      store.put(submission);
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('Synced localStorage with database successfully');
        resolve();
      };
      
      transaction.onerror = (event) => {
        console.error('Error syncing with database:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error in syncLocalStorageWithDatabase:', error);
  }
}; 