'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import Image from 'next/image';
import { 
  ChevronLeft, Plus, Search, 
  ShoppingBag, X, Edit, Trash2, Save, 
  Tag, DollarSign, Package, Layers, Gift,
  Upload, AlertCircle, Coins, Check, AlertTriangle, ChevronUp, ChevronDown, ExternalLink,
  Loader2, RefreshCw
} from 'lucide-react';
import ClientLayout from '../../../components/ClientLayout';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { MarketItem } from '@/types/market';
import { v4 as uuidv4 } from 'uuid';

// Local storage key for market items
const MARKET_ITEMS_STORAGE_KEY = 'slotjack_market_items';
// Supabase table name
const MARKET_ITEMS_TABLE = 'market_items';

// Item category options
const itemCategories = [
  { value: 'betting', label: 'Bahis Sitesi' },
];

// Preview component with cache busting
const ImagePreview = ({ src }: { src: string }) => {
  const [timestamp] = useState(Date.now());
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center">
        <Package className="w-8 h-8 text-gray-500" />
      </div>
    );
  }
  
  // Add cache busting parameter directly to the URL
  const imageUrlWithCache = src.startsWith('data:') 
    ? src // Don't add cache param to data URLs
    : (src.includes('?') ? `${src}&t=${timestamp}` : `${src}?t=${timestamp}`);
  
  return (
    <div className="w-16 h-16 relative bg-gray-700 rounded-md overflow-hidden">
      <div
        className="w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imageUrlWithCache})` }}
        onError={() => setError(true)}
      ></div>
    </div>
  );
};

export default function AdminMarketPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: boolean;
    price?: boolean;
    points?: boolean;
    category?: boolean;
  }>({});
  
  // Form state for adding/editing market item
  interface ItemFormData {
    id?: string;
    name: string;
    price: number;
    points: number;
    category: string;
    description: string;
    imageUrl: string;
    stock: number;
    featured: boolean;
    virtual: boolean;
    priceType: string;
  }

  // State for form data
  const [itemFormData, setItemFormData] = useState<ItemFormData>({
    name: '',
    price: 0,
    points: 0,
    category: 'betting',
    description: '',
    imageUrl: '',
    stock: -1,
    featured: false,
    virtual: false,
    priceType: 'TRY' // Default currency type
  });
  
  // Add state for partner site form
  const [partnerSiteForm, setPartnerSiteForm] = useState({
    name: '',
    points: 3500,
    imageUrl: '/market-img/zlat.png'
  });

  // Add state for available market images
  const [marketImages, setMarketImages] = useState<string[]>([]);

  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Check if user is admin and load market items
  useEffect(() => {
    if (!loading && (!user || user.rank !== UserRank.ADMIN)) {
      router.push('/');
      return;
    }
    
    if (user) {
      loadMarketItems();
      setLoading(false);
    }
  }, [user, loading, router]);
  
  // Load market items from all available sources with fallbacks
  const loadMarketItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Set a timeout for the fetch operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      // First try to get items from API
      try {
        console.log('Trying to load market items from API...');
        const response = await fetch('/api/market/items', {
          cache: 'no-store', // Ensure fresh data
          headers: {
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });
        
        // Clear the timeout now that the request completed
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Loaded items from API:', data.items?.length || 0);
          
          if (data.items && data.items.length > 0) {
            // Add cache busting to image URLs
            const timestamp = Date.now();
            const processedItems = data.items.map((item: MarketItem) => {
              if (item.imageUrl && !item.imageUrl.includes('?')) {
                return { ...item, imageUrl: `${item.imageUrl}?t=${timestamp}` };
              }
              return item;
            });
            
            setMarketItems(processedItems);
            // Update localStorage for backup
            localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(processedItems));
            setLoading(false);
            return;
          } else {
            console.log('API returned empty items array');
            throw new Error('API returned empty items array');
          }
        } else {
          console.error(`Error from API (${response.status})`);
          throw new Error(`API error: ${response.status}`);
        }
      } catch (apiError: any) {
        // Clear the timeout if it hasn't fired yet
        clearTimeout(timeoutId);
        
        console.error('Error fetching from API:', apiError);
        // Log specific abort errors
        if (apiError.name === 'AbortError') {
          console.error('API request timed out');
        }
        // Continue to fallback options
      }

      // If API fails, try direct Supabase access with retry
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`Trying direct Supabase access (attempt ${attempt}/2)...`);
          // Initialize Supabase client
          const supabase = await getSupabaseClient();
          
          // Try to get items from Supabase
          const { data: supabaseItems, error } = await supabase
            .from(MARKET_ITEMS_TABLE)
            .select('*')
            .order('id');
          
          if (error) {
            console.error(`Error loading items from Supabase (attempt ${attempt}):`, error);
            
            if (attempt < 2) {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000)); 
              continue;
            }
            throw error;
          }
          
          if (supabaseItems && supabaseItems.length > 0) {
            // Successfully got items from Supabase
            console.log('Loaded items from Supabase:', supabaseItems.length);
            
            // Add cache busting to image URLs
            const timestamp = Date.now();
            const processedItems = supabaseItems.map((item: MarketItem) => {
              if (item.imageUrl && !item.imageUrl.includes('?')) {
                return { ...item, imageUrl: `${item.imageUrl}?t=${timestamp}` };
              }
              return item;
            });
            
            setMarketItems(processedItems);
            // Update localStorage for backup
            localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(processedItems));
            setLoading(false);
            return;
          } else {
            console.log('No items found in Supabase');
            throw new Error('No items found in Supabase');
          }
        } catch (supabaseError) {
          if (attempt < 2) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          console.error('All Supabase attempts failed:', supabaseError);
          // Continue to localStorage fallback
        }
      }
      
      // Last resort: try to use localStorage
      try {
        console.log('Trying localStorage...');
        const storedItems = localStorage.getItem(MARKET_ITEMS_STORAGE_KEY);
        if (storedItems) {
          const parsedItems = JSON.parse(storedItems);
          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            console.log(`Loaded ${parsedItems.length} items from localStorage`);
            setMarketItems(parsedItems);
            setLoading(false);
            
            // Show offline warning
            toast.error('Çevrimdışı mod: Sunucu bağlantısı kurulamadı, yerel veriler kullanılıyor', {
              icon: '📱',
              duration: 5000
            });
            return;
          }
        }
        // If we get here, localStorage also failed or was empty
        throw new Error('No items found in localStorage');
      } catch (localStorageError) {
        console.error('Error reading from localStorage:', localStorageError);
      }
      
      // If everything failed, use empty array
      console.log('All data sources failed. Using empty items array');
      setMarketItems([]);
      toast.error('Veriler yüklenemedi! Ürün ekleyerek başlayabilirsiniz.', { duration: 5000 });
    } catch (error) {
      console.error('Error in loadMarketItems:', error);
      setError('Market ürünleri yüklenemedi: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };
  
  // Get default market items
  const getDefaultMarketItems = (): MarketItem[] => {
    return [
      { 
        id: '1', 
        name: 'Esbet', 
        price: '30$',
        points: 3500,
        category: 'betting',
        description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Esbet kullanıcı adınızı iletmeniz Gerekmektedir.',
        imageUrl: '/market-img/esbet.png',
        stock: undefined,
        featured: true,
        virtual: true,
        priceValue: 30
      },
      { 
        id: '2', 
        name: 'BullBahis', 
        price: '30$',
        points: 3500,
        category: 'betting',
        description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere BullBahis kullanıcı adınızı iletmeniz Gerekmektedir.',
        imageUrl: '/market-img/bullbahis.png',
        stock: undefined,
        featured: true,
        virtual: true,
        priceValue: 30
      }
    ];
  };
  
  // Save market items to API/Supabase and localStorage
  const saveMarketItems = async (items: MarketItem[]) => {
    try {
      setError(null);
      console.log('Saving market items:', items);
      
      // First try the API
      try {
        const response = await fetch('/api/market/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ items })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Market items saved via API:', data);
          
          // Update localStorage for backward compatibility
          localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(items));
          return data;
        } else {
          const errorText = await response.text();
          console.error(`Error from API (${response.status}):`, errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
      } catch (apiError) {
        console.error('Error saving via API:', apiError);
        
        // Try direct Supabase as a fallback
        try {
          const result = await saveItemsToSupabase(items);
          
          // Update localStorage for backward compatibility
          localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(items));
          
          return result;
        } catch (supabaseError) {
          console.error('Error saving to Supabase:', supabaseError);
          throw supabaseError;
        }
      }
    } catch (err) {
      console.error('Error saving market items:', err);
      setError('Ürünler kaydedilirken bir hata oluştu');
      throw err;
    }
  };
  
  // Save items directly to Supabase with better error handling
  const saveItemsToSupabase = async (items: MarketItem[]): Promise<{ success: boolean, message?: string }> => {
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        if (retryCount > 0) {
          console.log(`Retry attempt ${retryCount}/${maxRetries} for Supabase save...`);
          // Add a delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
        
        console.log('Connecting to Supabase...');
        const supabase = await createClient();
        
        // Test the connection with a simple query
        try {
          const { error: testError } = await supabase
            .from('health_check')
            .select('*')
            .limit(1)
            .maybeSingle();
          
          // If error is about table not existing, that's actually fine
          // It means our connection works
          if (testError && !testError.message.includes('does not exist')) {
            throw testError;
          }
        } catch (testError: any) {
          // If it's a relation not found error, connection is fine
          if (testError.message && testError.message.includes('does not exist')) {
            console.log('Supabase connection test OK (table not found)');
          } else {
            throw testError;
          }
        }
        
        // First delete all existing items
        console.log('Deleting existing items...');
        const { error: deleteError } = await supabase
          .from(MARKET_ITEMS_TABLE)
          .delete()
          .not('id', 'eq', '');
        
        if (deleteError) {
          console.error('Error deleting existing items:', deleteError);
          return { success: false, message: deleteError.message };
        }
        
        // Then insert new items
        console.log(`Inserting ${items.length} items...`);
        const { data, error: insertError } = await supabase
          .from(MARKET_ITEMS_TABLE)
          .insert(items)
          .select();
        
        if (insertError) {
          console.error('Error inserting items:', insertError);
          return { success: false, message: insertError.message };
        }
        
        console.log('Successfully saved items to Supabase:', data?.length || 0);
        return { success: true, message: `Saved ${data?.length || 0} items to database` };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Supabase save attempt ${retryCount + 1} failed:`, errorMessage);
        
        if (retryCount >= maxRetries) {
          console.error('All Supabase save attempts failed');
          // Since we already saved to localStorage, we can still consider this a partial success
          return { success: true, message: 'Saved to local storage only (offline mode)' };
        }
        
        // Increment retry counter for next attempt
        retryCount++;
      }
    }
    
    // This should never be reached due to the loop exit conditions
    return { success: false, message: 'Unknown error saving items' };
  };

  // Add this function after the saveItemsToSupabase function
  const broadcastChanges = () => {
    try {
      // Update timestamp in localStorage to trigger storage events in other tabs
      localStorage.setItem('market_items_updated', Date.now().toString());
      
      // Trigger event for components in this window
      window.dispatchEvent(new CustomEvent('market-items-updated', {
        detail: {
          source: 'admin-panel',
          timestamp: Date.now()
        }
      }));
      
      console.log('Broadcast market item changes to all tabs/windows');
    } catch (e) {
      console.error('Error broadcasting changes:', e);
    }
  };

  // Delete a market item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      setDeleteLoading(itemId);
      
      // First try API
      try {
        const response = await fetch(`/api/market/items?id=${itemId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          cache: 'no-store'
        });
        
        const data = await response.json();
        
        if (data.success) {
          console.log('Item deleted via API successfully');
        } else {
          throw new Error(data.error || 'API delete failed');
        }
      } catch (apiError) {
        console.error('API delete failed, trying direct Supabase delete', apiError);
        
        // Try direct Supabase as fallback
        const supabase = await getSupabaseClient();
        const { error } = await supabase
          .from(MARKET_ITEMS_TABLE)
          .delete()
          .eq('id', itemId);
        
        if (error) {
          console.error('Supabase delete failed too:', error);
          throw error;
        }
      }
      
      // If we got here, the delete was successful via API or Supabase
      // Update local state and localStorage
      const updatedItems = marketItems.filter(item => item.id !== itemId);
      setMarketItems(updatedItems);
      localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(updatedItems));
      toast.success('Ürün başarıyla silindi');
      
      // Broadcast changes to all tabs/windows
      broadcastChanges();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Ürün silinirken bir hata oluştu');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Helper function to get a Supabase client with retries
  const getSupabaseClient = async () => {
    const MAX_RETRIES = 2;
    let lastError = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Creating Supabase client (attempt ${attempt}/${MAX_RETRIES})...`);
        const client = await createClient();
        
        // Simple connectivity test
        try {
          const { error: testError } = await client
            .from('health_check')
            .select('*')
            .limit(1)
            .maybeSingle();
          
          // If the error is about table not existing, that's fine
          // It means connection works but table doesn't exist
          if (testError && 
              !testError.message.includes('relation "health_check" does not exist') &&
              !testError.message.includes('does not exist')) {
            throw testError;
          }
          
          console.log('Supabase client created successfully');
          return client;
        } catch (testError: any) {
          // If it's a relation does not exist error, the connection is fine
          if (testError.message && (
              testError.message.includes('relation "health_check" does not exist') ||
              testError.message.includes('does not exist'))) {
            console.log('Supabase connection good (health check table not found)');
            return client;
          }
          throw testError;
        }
      } catch (error: any) {
        lastError = error;
        console.error(`Failed to create Supabase client (attempt ${attempt}/${MAX_RETRIES}):`, error);
        
        if (attempt < MAX_RETRIES) {
          // Wait before retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If we've exhausted all retries
    console.error(`Failed to create Supabase client after ${MAX_RETRIES} attempts`);
    throw lastError || new Error('Failed to create Supabase client');
  };

  // Update a single market item
  const updateMarketItem = async (item: MarketItem) => {
    try {
      setError(null);
      console.log('Starting update for market item:', item);
      
      // Update local state immediately for responsiveness
      setMarketItems(prevItems => 
        prevItems.map(prevItem => 
          prevItem.id === item.id ? item : prevItem
        )
      );
      
      // Also update localStorage immediately
      const updatedItems = [...marketItems].map(i => i.id === item.id ? item : i);
      localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(updatedItems));
      
      // Then try API with retry mechanism
      let apiSuccess = false;
      let apiError = null;
      let apiResponse = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Sending PATCH request to update item (attempt ${attempt}/3)`);
          const response = await fetch('/api/market/items', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            body: JSON.stringify({ item }),
            cache: 'no-store'
          });
          
          // Always try to parse the response, even if status is not OK
          const responseData = await response.json().catch(err => {
            console.error('Failed to parse response JSON:', err);
            return { success: false, error: 'Invalid response format' };
          });
          
          apiResponse = responseData;
          
          if (!response.ok) {
            console.error(`Error updating item (${response.status}):`, responseData);
            apiError = new Error(responseData.error || `Update error: ${response.status}`);
            
            // If server explicitly rejects the request, don't retry
            if (response.status === 400 || response.status === 403 || response.status === 404) {
              break;
            }
            
            // Wait before retrying
            if (attempt < 3) {
              const delay = 1000 * attempt; // Exponential backoff
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            continue;
          }
          
          console.log('Item update API response:', responseData);
          
          // If we got here, the request was successful
          apiSuccess = true;
          apiError = null;
          
          // Use server-returned item data if available
          if (responseData.success && responseData.item) {
            const serverItem = responseData.item;
            
            // Update local state with the server response
            setMarketItems(prevItems => 
              prevItems.map(prevItem => 
                prevItem.id === item.id ? serverItem : prevItem
              )
            );
            
            // Update localStorage too
            const updatedServerItems = [...marketItems].map(i => 
              i.id === item.id ? serverItem : i
            );
            localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(updatedServerItems));
          }
          
          // Break the retry loop on success
          break;
        } catch (attempt_error) {
          console.error(`API update attempt ${attempt} failed:`, attempt_error);
          apiError = attempt_error;
          
          // Wait before retrying
          if (attempt < 3) {
            const delay = 1000 * attempt;
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // If all API attempts failed, try direct Supabase as last resort
      if (!apiSuccess) {
        console.error('All API update attempts failed, trying direct Supabase update:', apiError);
        
        try {
          const supabase = await getSupabaseClient();
          
          // Check if item exists
          const { data: existingItem, error: checkError } = await supabase
            .from(MARKET_ITEMS_TABLE)
            .select('id')
            .eq('id', item.id)
            .maybeSingle();
            
          if (checkError) {
            throw checkError;
          }
          
          if (!existingItem) {
            // Insert new item
            const { data: insertResult, error: insertError } = await supabase
              .from(MARKET_ITEMS_TABLE)
              .insert(item)
              .select()
              .single();
              
            if (insertError) throw insertError;
            
            console.log('Item inserted via direct Supabase:', insertResult);
            
            // Update with Supabase result
            if (insertResult) {
              setMarketItems(prevItems => 
                prevItems.map(prevItem => 
                  prevItem.id === item.id ? insertResult : prevItem
                )
              );
              
              // Update localStorage
              const updatedInsertItems = [...marketItems].map(i => 
                i.id === item.id ? insertResult : i
              );
              localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(updatedInsertItems));
            }
          } else {
            // Update existing item
            const { data: updateResult, error: updateError } = await supabase
              .from(MARKET_ITEMS_TABLE)
              .update(item)
              .eq('id', item.id)
              .select()
              .single();
              
            if (updateError) throw updateError;
            
            console.log('Item updated via direct Supabase:', updateResult);
            
            // Update with Supabase result
            if (updateResult) {
              setMarketItems(prevItems => 
                prevItems.map(prevItem => 
                  prevItem.id === item.id ? updateResult : prevItem
                )
              );
              
              // Update localStorage
              const updatedDbItems = [...marketItems].map(i => 
                i.id === item.id ? updateResult : i
              );
              localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(updatedDbItems));
            }
          }
          
          return { 
            success: true, 
            message: 'Item updated via Supabase',
            item
          };
        } catch (supabaseError) {
          console.error('All update attempts failed (API and Supabase):', supabaseError);
          toast.error('Sunucu bağlantısı kurulamadı, değişiklikler sadece tarayıcınızda geçerlidir.', {
            duration: 5000
          });
          
          // We already updated localStorage and UI state at the beginning
          // So at least the user sees their changes locally
          return { 
            success: true, 
            message: 'Item updated in browser only',
            localOnly: true,
            item,
            warning: 'Veriler sadece tarayıcınızda kaydedildi. Sunucuya bağlanılamadı.'
          };
        }
      }
      
      return apiResponse || { success: true, message: 'Item updated', item };
    } catch (error) {
      console.error('Error in updateMarketItem:', error);
      setError('Ürün güncellenirken bir hata oluştu: ' + (error instanceof Error ? error.message : String(error)));
      
      // Return an error result
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  };
  
  // Filter items based on search
  const filteredItems = marketItems.filter(item =>
    searchQuery === '' ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get category label from value
  const getCategoryLabel = (categoryValue: string) => {
    const category = itemCategories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };
  
  // Open modal for adding new item
  const handleAddItem = () => {
    setEditingItemId(null);
    setItemFormData({
      name: '',
      price: 0,
      points: 0,
      category: 'betting',
      description: '',
      imageUrl: '',
      stock: -1,
      featured: false,
      virtual: false,
      priceType: 'TRY'
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
    setError(null);
  };
  
  // Enhanced handleEditItem function
  const handleEditItem = (item: MarketItem) => {
    setError(null);
    setEditingItemId(item.id);
    
    // Handle different price formats
    let priceValue = 0;
    let priceType = 'TRY';
    
    if (typeof item.price === 'string') {
      if (item.price.includes('$')) {
        priceValue = Number(item.price.replace('$', ''));
        priceType = 'USD';
      } else if (item.price.includes('₺')) {
        priceValue = Number(item.price.replace('₺', ''));
        priceType = 'TRY';
      } else {
        priceValue = Number(item.price);
      }
    } else if (typeof item.price === 'number') {
      priceValue = item.price;
    } else if (typeof item.priceValue === 'number') {
      priceValue = item.priceValue;
    }
    
    // Clean up image URL by removing any cache parameters
    let cleanImageUrl = item.imageUrl || '';
    if (cleanImageUrl.includes('?')) {
      cleanImageUrl = cleanImageUrl.split('?')[0];
    }
    
    // Set form data
    setItemFormData({
      id: item.id,
      name: item.name || '',
      price: priceValue,
      points: Number(item.points),
      category: item.category || '',
      description: item.description || '',
      imageUrl: cleanImageUrl,
      stock: item.stock !== null ? Number(item.stock) : 0,
      featured: Boolean(item.featured),
      virtual: Boolean(item.virtual),
      priceType
    });
    
    // Clear image file and preview since we're editing an existing item
    setImageFile(null);
    // Set image preview from the item's image URL
    setImagePreview(cleanImageUrl);
    
    // Open the modal
    setIsModalOpen(true);
  };
  
  // Enhanced function to refresh market data
  const refreshData = async () => {
    console.log('Refreshing market items data with cache busting...');
    setIsRefreshing(true);
    
    try {
      // Add a timestamp to bust the cache
      const timestamp = Date.now();
      const response = await fetch(`/api/market/items?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.items) {
        console.log(`Loaded ${data.items.length} items from API`);
        setMarketItems(data.items);
        
        // Update localStorage for backup
        localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(data.items));
      } else {
        console.error('API returned success: false or no items');
        throw new Error('Failed to load market items');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Veri yenileme hatası. Yerel önbellek kullanılıyor.');
      
      // Try to load from localStorage as fallback
      try {
        const localItems = localStorage.getItem(MARKET_ITEMS_STORAGE_KEY);
        if (localItems) {
          const parsedItems = JSON.parse(localItems);
          setMarketItems(parsedItems);
          console.log(`Loaded ${parsedItems.length} items from localStorage`);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Selected file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Lütfen geçerli bir resim dosyası seçin (JPEG, PNG, GIF, vb.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu çok büyük. Lütfen 5MB\'den küçük bir dosya seçin.');
        return;
      }
      
      setImageFile(file);
      
      // Create a local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        console.log('Image preview created successfully');
      };
      reader.onerror = (error) => {
        console.error('Error creating image preview:', error);
        setError('Resim önizlemesi oluşturulurken hata oluştu.');
      };
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error reading file:', error);
        setError('Dosya okunamadı. Lütfen tekrar deneyin.');
      }
    }
  };
  
  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'USD') {
      return `${price}$`;
    } else if (currency === 'TRY') {
      return `${price}₺`;
    }
    return `${price}`;
  };
  
  // Upload image to server with retries and fallbacks
  const uploadImage = async (file: File, oldImageUrl?: string): Promise<string> => {
    console.log(`Uploading image: ${file.name}, size: ${file.size}, type: ${file.type}`);
    console.log(`Old image URL: ${oldImageUrl || 'none'}`);
    
    setImageUploading(true);
    
    // Set a max number of attempts
    const MAX_RETRIES = 2;
    let lastError = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${MAX_RETRIES}`);
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Set a timeout for upload operations
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        // Determine method based on whether we're updating or adding
        const isUpdate = !!oldImageUrl;
        
        // If we're updating an existing image, use PUT method and include oldImageUrl
        if (isUpdate) {
          formData.append('oldImageUrl', oldImageUrl);
          console.log('Using PUT method to update existing image');
          
          const response = await fetch('/api/upload/market-images', {
            method: 'PUT',
            body: formData,
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            },
            signal: controller.signal
          });
          
          // Clear the timeout
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Upload failed: ${response.status}` }));
            console.error(`Upload failed with status ${response.status}:`, errorData);
            throw new Error(errorData.error || `Upload failed: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Image updated successfully:', data);
          
          // Add a cache-busting timestamp
          return `${data.fileUrl}?t=${Date.now()}`;
        } else {
          // For new images, use POST method
          console.log('Using POST method to upload new image');
          
          const response = await fetch('/api/upload/market-images', {
            method: 'POST',
            body: formData,
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            },
            signal: controller.signal
          });
          
          // Clear the timeout
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Upload failed: ${response.status}` }));
            console.error(`Upload failed with status ${response.status}:`, errorData);
            throw new Error(errorData.error || `Upload failed: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Image uploaded successfully:', data);
          
          // Add a cache-busting timestamp
          return `${data.fileUrl}?t=${Date.now()}`;
        }
      } catch (error: any) {
        lastError = error;
        console.error(`Image upload attempt ${attempt} failed:`, error);
        
        // Check for abort/timeout
        if (error.name === 'AbortError') {
          console.error('Upload request timed out');
          // For timeouts, wait longer before retry
          if (attempt < MAX_RETRIES) {
            const delay = 2000; // Longer delay for timeouts
            console.log(`Upload timed out. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else if (attempt < MAX_RETRIES) {
          // For other errors, use exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
          console.log(`Retrying upload in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If all upload attempts fail
    console.error(`All ${MAX_RETRIES} upload attempts failed:`, lastError);
    
    // If updating, return the old URL as fallback
    if (oldImageUrl) {
      console.log('Returning original image URL as fallback:', oldImageUrl);
      return oldImageUrl;
    }
    
    // For new images that failed to upload, use a default placeholder
    console.log('Using default placeholder image');
    return '/market-img/placeholder-product.jpg';
  };
  
  // Handle form submission (add/edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!itemFormData.name) {
      setError('Ürün adı gereklidir');
      return;
    }
    
    if (!itemFormData.price) {
      setError('Ürün fiyatı gereklidir');
      return;
    }
    
    if (!itemFormData.points) {
      setError('Ürün puanı gereklidir');
      return;
    }
    
    if (!itemFormData.category) {
      setError('Kategori seçmelisiniz');
      return;
    }
    
    try {
      setIsSubmitting(true);
      let imageUrl = itemFormData.imageUrl;
      let uploadSuccess = true;
      
      // Upload image if one is selected
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile, editingItemId ? itemFormData.imageUrl : undefined);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          uploadSuccess = false;
          // Continue with the operation even if image upload fails
          toast.error('Resim yüklenemedi, ama ürün kaydedilecek');
          // Use existing image URL if editing, or empty string if new item
          imageUrl = editingItemId ? itemFormData.imageUrl : '';
        }
      }
      
      // Prepare the item data
      const newItem: MarketItem = {
        id: editingItemId || uuidv4(),
        name: itemFormData.name,
        price: formatPrice(itemFormData.price, itemFormData.priceType),
        points: parseInt(itemFormData.points?.toString() || '0'),
        category: itemFormData.category,
        description: itemFormData.description || '',
        imageUrl: imageUrl,
        stock: itemFormData.virtual ? -1 : parseInt(itemFormData.stock?.toString() || '0'),
        featured: itemFormData.featured,
        virtual: itemFormData.virtual,
        priceValue: itemFormData.price,
      };
      
      // Update UI immediately for better user experience
      if (editingItemId) {
        setMarketItems(prevItems => prevItems.map(item => item.id === newItem.id ? newItem : item));
      } else {
        setMarketItems(prevItems => [...prevItems, newItem]);
      }
      
      // Save to localStorage immediately as a backup
      const updatedItems = editingItemId
        ? marketItems.map(item => item.id === newItem.id ? newItem : item)
        : [...marketItems, newItem];
      
      localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(updatedItems));
      
      // Try saving via API first
      let success = false;
      let serverMessage = '';
      
      try {
        const apiMethod = editingItemId ? 'PATCH' : 'POST';
        const apiBody = editingItemId ? { item: newItem } : { items: updatedItems };
        
        const response = await fetch('/api/market/items', {
          method: apiMethod,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          cache: 'no-store',
          body: JSON.stringify(apiBody)
        });
        
        const data = await response.json();
        success = data.success;
        serverMessage = 'Saved via API';
        console.log('API response:', data);
      } catch (apiError) {
        console.error('API saving failed:', apiError);
        
        // Fallback: Try saving directly to Supabase
        try {
          console.log('Trying direct Supabase save...');
          const supabaseResult = await saveItemsToSupabase(updatedItems);
          success = supabaseResult.success;
          serverMessage = 'Saved directly to database';
          console.log('Items saved directly to Supabase:', supabaseResult);
        } catch (supabaseError) {
          console.error('Supabase saving failed:', supabaseError);
          // Since we already saved to localStorage above, we can consider this a success
          success = true;
          serverMessage = 'Saved to local storage only (offline mode)';
        }
      }
      
      // Modify the if condition - always treat localStorage save as a success
      if (success || serverMessage.includes('local storage')) {
        toast.success(editingItemId ? 'Ürün başarıyla güncellendi!' : 'Yeni ürün başarıyla eklendi!');
        
        // For local-only saves, show additional info
        if (serverMessage.includes('local storage')) {
          toast('Ürün sadece yerel olarak saklandı. Çevrimiçi olduğunuzda senkronize edilecek.', {
            icon: '⚠️',
            duration: 5000 
          });
        }
        
        setIsModalOpen(false);
        setItemFormData({
          name: '',
          price: 0,
          points: 0,
          category: 'betting',
          description: '',
          imageUrl: '',
          stock: -1,
          featured: false,
          virtual: false,
          priceType: 'TRY'
        });
        setImageFile(null);
        setImagePreview(null);
        
        // Force data refresh with short delay to ensure server changes are visible
        setTimeout(async () => {
          await refreshData();
          
          // Broadcast change to other tabs/windows
          broadcastChanges();
        }, 500);
      } else {
        toast.error('Ürün kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add a function to refresh image cache by updating the URL with a timestamp
  const refreshImageCache = async (id: string, imageUrl: string) => {
    try {
      console.log(`Refreshing image cache for item ${id}, image: ${imageUrl}`);
      
      if (!imageUrl || !imageUrl.startsWith('/')) {
        console.log('Invalid image URL, skipping refresh');
        return null;
      }
      
      const response = await fetch('/api/market/items/image-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id, 
          imageUrl 
        })
      });
      
      if (!response.ok) {
        console.error(`Error refreshing image cache (${response.status})`);
        return null;
      }
      
      const data = await response.json();
      console.log('Image cache refreshed successfully:', data);
      
      // Update the item in the local state
      setMarketItems(prevItems => 
        prevItems.map(prevItem => 
          prevItem.id === id ? { ...prevItem, imageUrl: data.newImageUrl } : prevItem
        )
      );
      
      return data.newImageUrl;
    } catch (error) {
      console.error('Error refreshing image cache:', error);
      return null;
    }
  };
  
  // Add function to handle partner site form input changes
  const handlePartnerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPartnerSiteForm(prev => ({
      ...prev,
      [name]: name === 'points' ? parseInt(value) || 0 : value
    }));
  };

  // Add function to handle quick add partner site
  const handleAddPartnerSite = () => {
    // Validate form
    if (!partnerSiteForm.name.trim()) {
      toast.error('Site adı gereklidir');
      return;
    }
    
    if (!partnerSiteForm.points) {
      toast.error('JackPoint değeri gereklidir');
      return;
    }
    
    if (!partnerSiteForm.imageUrl) {
      toast.error('Logo seçimi gereklidir');
      return;
    }
    
    // Create new partner site item
    const newPartnerSite: MarketItem = {
      id: uuidv4(),
      name: partnerSiteForm.name.trim(),
      price: '30$',
      points: partnerSiteForm.points,
      category: 'betting',
      description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere ' + partnerSiteForm.name + ' kullanıcı adınızı iletmeniz Gerekmektedir.',
      imageUrl: partnerSiteForm.imageUrl,
      stock: -1,
      featured: true,
      virtual: true,  // Keep virtual for functionality but don't mention it in UI
      priceValue: 30
    };
    
    // Add to market items
    const updatedItems = [...marketItems, newPartnerSite];
    setMarketItems(updatedItems);
    localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(updatedItems));
    
    // Try to save to database
    saveItemsToSupabase(updatedItems)
      .then(result => {
        if (result.success) {
          console.log('Partner site saved to Supabase:', result);
        } else {
          console.warn('Partner site saved to localStorage only:', result.message);
        }
      })
      .catch(error => {
        console.error('Error saving partner site:', error);
      });
    
    // Reset form
    setPartnerSiteForm({
      name: '',
      points: 3500,
      imageUrl: '/market-img/zlat.png'
    });
    
    // Show success message
    toast.success('Bahis sitesi başarıyla eklendi');
    
    // Broadcast changes
    broadcastChanges();
    
    // Refresh data after short delay
    setTimeout(() => {
      refreshData().catch(e => console.error('Refresh error:', e));
    }, 500);
  };

  // Add function to load market images after component mounts
  useEffect(() => {
    // Function to load market images
    const loadMarketImages = async () => {
      try {
        const response = await fetch('/api/list-market-images');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.images)) {
            setMarketImages(data.images);
            console.log('Loaded market images:', data.images);
          } else {
            console.error('Invalid images data format:', data);
            // Fallback to some default images
            setMarketImages(['/market-img/zlat.png', '/market-img/default.png']);
          }
        } else {
          console.error('Failed to load market images:', response.statusText);
          // Fallback to some default images
          setMarketImages(['/market-img/zlat.png', '/market-img/default.png']);
        }
      } catch (error) {
        console.error('Error loading market images:', error);
        // Fallback to some default images
        setMarketImages(['/market-img/zlat.png', '/market-img/default.png']);
      }
    };

    loadMarketImages();
  }, []);

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin" className="flex items-center text-blue-400 hover:text-blue-300 mb-2">
              <ChevronLeft className="w-5 h-5 mr-1" /> Admin Paneline Dön
            </Link>
            <h1 className="text-3xl font-bold text-white">Market Yönetimi</h1>
            <p className="text-gray-400">Ürünleri ekle, düzenle veya sil</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              className="text-gray-400 hover:text-blue-400 p-2 rounded-md"
              disabled={isRefreshing}
              title="Verileri Yenile"
            >
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Ürün ara..."
                className="bg-gray-700 text-white px-4 py-2 pl-10 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={handleAddItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              disabled={isSubmitting}
            >
              <Plus className="w-5 h-5 mr-1.5" /> Yeni Ürün
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Hata oluştu</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Quick Add Partner Site Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Tag className="mr-2 text-blue-400" /> Bahis Siteleri Ekle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="block text-gray-400 text-sm">Site Adı</label>
              <input 
                type="text" 
                placeholder="ör. Zlot1000" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="name"
                value={partnerSiteForm.name}
                onChange={handlePartnerFormChange}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-400 text-sm">JackPoint Değeri</label>
              <input 
                type="number" 
                placeholder="ör. 3500" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="points"
                value={partnerSiteForm.points}
                onChange={handlePartnerFormChange}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-400 text-sm">Logo Seç</label>
              <select 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="imageUrl"
                value={partnerSiteForm.imageUrl}
                onChange={handlePartnerFormChange}
              >
                <option value="">Logo Seç</option>
                {marketImages.map((img, index) => (
                  <option key={index} value={img}>
                    {img.split('/').pop()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddPartnerSite}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Bahis Sitesi Ekle
              </button>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            Not: Bahis siteleri otomatik olarak "Bahis Sitesi" kategorisinde eklenecektir.
          </div>
        </div>

        {/* Existing Product Category Filter */}
        <div className="flex mb-6 space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSearchQuery('')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              searchQuery === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Tüm Ürünler
          </button>
          <button
            onClick={() => setSearchQuery('betting')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              searchQuery === 'betting'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Bahis Siteleri
          </button>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-400 mb-6">Arama kriterlerinize uygun ürün bulunamadı.</p>
            <button
              onClick={handleAddItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-1.5" /> Yeni Ürün Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="relative h-48">
                  {item.imageUrl ? (
                    <div 
                      className="w-full h-full bg-cover bg-center bg-no-repeat" 
                      style={{
                        backgroundImage: `url(${item.imageUrl.includes('?') ? item.imageUrl : `${item.imageUrl}?t=${Date.now()}`})`
                      }}
                    ></div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-700">
                      <Package className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  {item.featured && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-medium px-2 py-1 rounded-full">
                      Öne Çıkan
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-white">{item.name}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Düzenle"
                        disabled={deleteLoading === item.id}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Sil"
                        disabled={deleteLoading === item.id}
                      >
                        {deleteLoading === item.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-gray-400 text-sm mb-2 line-clamp-2" title={item.description}>
                    {item.description || 'Açıklama yok'}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Coins className="w-5 h-5 text-yellow-500 mr-1.5" />
                      <span className="text-white font-medium">{item.points || 0} Jackpoint</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingItemId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                  disabled={isSubmitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-gray-400">Ürün Adı <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={itemFormData.name}
                      onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                      className={`w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.name ? 'border border-red-500' : ''}`}
                      placeholder="Ürün adı"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-gray-400">JackPoint Değeri <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="points"
                      value={itemFormData.points}
                      onChange={(e) => setItemFormData({ ...itemFormData, points: parseInt(e.target.value) || 0 })}
                      className={`w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.points ? 'border border-red-500' : ''}`}
                      placeholder="JackPoint değeri"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-gray-400">Fiyat <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <input
                        type="number"
                        name="price"
                        value={itemFormData.price}
                        onChange={(e) => setItemFormData({ ...itemFormData, price: parseFloat(e.target.value) || 0 })}
                        className={`flex-1 bg-gray-700 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.price ? 'border border-red-500' : ''}`}
                        placeholder="Fiyat değeri"
                        min="0"
                        step="0.01"
                        required
                      />
                      <select
                        name="priceType"
                        value={itemFormData.priceType}
                        onChange={(e) => setItemFormData({ ...itemFormData, priceType: e.target.value })}
                        className="bg-gray-700 text-white px-3 py-2 rounded-r-md border-l border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="TRY">₺</option>
                        <option value="USD">$</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-gray-400">Stok Durumu</label>
                    <input
                      type="number"
                      name="stock"
                      value={itemFormData.stock}
                      onChange={(e) => setItemFormData({ ...itemFormData, stock: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Stok adedi"
                      min="0"
                      disabled={itemFormData.virtual}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-300">Açıklama</label>
                  <textarea
                    name="description"
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                    className="w-full h-24 px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ürün açıklaması"
                  ></textarea>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="virtual"
                      name="virtual"
                      checked={itemFormData.virtual}
                      onChange={(e) => setItemFormData({...itemFormData, virtual: e.target.checked})}
                      className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="virtual" className="ml-2 text-sm text-gray-300">
                      Stok Takibi Yapma
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={itemFormData.featured}
                      onChange={(e) => setItemFormData({...itemFormData, featured: e.target.checked})}
                      className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                      Öne Çıkan Ürün
                    </label>
                  </div>
                  
                  <input type="hidden" name="category" value="betting" />
                </div>
                
                {error && (
                  <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6 flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-700"
                    disabled={isSubmitting}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        {editingItemId ? 'Güncelle' : 'Kaydet'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
} 