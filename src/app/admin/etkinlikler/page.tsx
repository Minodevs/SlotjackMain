'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import Image from 'next/image';
import { 
  ChevronLeft, Plus, Search, 
  Calendar, X, Edit, Trash2, Save, 
  MapPin, Clock, Users, Tag, AlertCircle,
  Upload, Image as ImageIcon, Link as LinkIcon,
  Album, CheckCircle, FileImage, Folder,
  RefreshCw, Camera, LayoutGrid, Globe, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ClientLayout from '../../../components/ClientLayout';
import toast from 'react-hot-toast';

// Event interface matching the user-facing page
interface Event {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  date: Date;
  endDate: Date;
  location: string;
  category: string;
  description: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string;
  backgroundGradient: string;
  featured: boolean;
  capacity: number;
  ticketsAvailable: boolean;
  stats: {
    available: number;
    participating: number;
    limit: number;
    prizePool: number;
  }
}

// Event category options
const eventCategories = [
  { value: 'nakit', label: 'Nakit Etkinlik' },
  { value: 'freespin', label: 'Freespin Etkinliği' },
  { value: 'bonus', label: 'Bonus Etkinliği' },
  { value: 'ozel', label: 'Özel Etkinlik' },
  { value: 'kayit', label: 'Kayıt Etkinliği' }
];

// Background gradient options
const gradientOptions = [
  { value: 'from-green-500 to-blue-500', label: 'Yeşil - Mavi' },
  { value: 'from-pink-500 to-purple-500', label: 'Pembe - Mor' },
  { value: 'from-green-400 to-teal-500', label: 'Yeşil - Turkuaz' },
  { value: 'from-blue-400 to-cyan-300', label: 'Mavi - Cam Göbeği' },
  { value: 'from-rose-400 to-red-500', label: 'Gül - Kırmızı' },
  { value: 'from-amber-500 to-orange-500', label: 'Amber - Turuncu' },
  { value: 'from-indigo-500 to-purple-500', label: 'İndigo - Mor' },
  { value: 'from-yellow-400 to-orange-500', label: 'Sarı - Turuncu' },
];

// Partner options
const partnerOptions = [
  { id: 'sportsbet', name: 'Sportsbet.io', logo: '/partner-logos/sportsbet.png' },
  { id: 'isisbet', name: 'IsIsBet', logo: '/partner-logos/isisbet.png' },
  { id: 'gambi', name: 'GAMBİ', logo: '/partner-logos/gambi.png' },
  { id: 'efesbet', name: 'Efesbet', logo: '/partner-logos/efesbet.png' },
  { id: 'zlot', name: 'Zlot', logo: '/partner-logos/zlot.png' },
  { id: 'betnano', name: 'Betnano', logo: '/partner-logos/betnano.png' },
];

// Local storage key for events
const EVENTS_STORAGE_KEY = 'slotjack_events';

// Sample events for demonstration
const demoEvents: Event[] = [
  { 
    id: '1', 
    title: 'SPORTSBET.IO X SLOTJACK ÖZEL NAKİT ETKİNLİĞİ', 
    subtitle: 'Özel Nakit Etkinliği',
    image: '/images/events/sportsbet-event.jpg',
    date: new Date('2023-08-15T14:00:00'),
    endDate: new Date('2023-08-15T20:00:00'),
    location: 'Online',
    description: 'Sportsbet.io ile ortak nakit etkinliğimize katılın ve büyük ödülleri kazanma şansı yakalayın.',
    category: 'nakit',
    backgroundGradient: 'from-green-500 to-blue-500',
    partnerId: 'sportsbet',
    partnerName: 'Sportsbet.io',
    partnerLogo: '/partner-logos/sportsbet.png',
    featured: true,
    capacity: 500,
    ticketsAvailable: true,
    stats: {
      available: 11,
      participating: 28,
      limit: 20,
      prizePool: 99999
    }
  },
  { 
    id: '2', 
    title: 'ISISBET X SLOTJACK ÖZEL NAKİT ETKİNLİĞİ', 
    subtitle: 'Özel Nakit Etkinliği',
    image: '/images/events/isisbet-event.jpg',
    date: new Date('2023-08-16T16:00:00'),
    endDate: new Date('2023-08-16T18:30:00'),
    location: 'Online',
    description: 'IsIsBet ile özel nakit etkinliği. Katılın ve büyük ödüller kazanma fırsatını kaçırmayın.',
    category: 'nakit',
    backgroundGradient: 'from-pink-500 to-purple-500',
    partnerId: 'isisbet',
    partnerName: 'IsIsBet',
    partnerLogo: '/partner-logos/isisbet.png',
    featured: true,
    capacity: 300,
    ticketsAvailable: false,
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 99999
    }
  },
  { 
    id: '3', 
    title: 'GAMBİ X SLOTJACK ÖZEL FS ETKİNLİĞİ', 
    subtitle: 'Özel Freespin Etkinliği',
    image: '/images/events/gambi-event.jpg',
    date: new Date('2023-08-17T11:00:00'),
    endDate: new Date('2023-08-17T12:30:00'),
    location: 'Online',
    description: 'GAMBİ ile freespin etkinliğimize katılın. İlk oynayanlar için özel bonuslar.',
    category: 'freespin',
    backgroundGradient: 'from-green-400 to-teal-500',
    partnerId: 'gambi',
    partnerName: 'GAMBİ',
    partnerLogo: '/partner-logos/gambi.png',
    featured: false,
    capacity: 150,
    ticketsAvailable: true,
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 99999
    }
  },
];

// Enhanced preloaded images list with additional system images
const preloadedImages = [
  { id: 'sportsbet', name: 'Sportsbet.io', src: '/etkinlikimg/sportsbet.png' },
  { id: 'isisbet', name: 'IsIsBet', src: '/etkinlikimg/isiabet.png' },
  { id: 'gambi', name: 'GAMBİ', src: '/etkinlikimg/gambi.png' },
  { id: 'efesbet', name: 'Efesbet', src: '/etkinlikimg/efesbet.png' },
  { id: 'zlot', name: 'Zlot', src: '/etkinlikimg/zlat.png' },
  { id: 'betnano', name: 'Betnano', src: '/etkinlikimg/betnano.png' },
  { id: 'rocket', name: 'Roket', src: '/rocket.png' },
  { id: 'fortune-wheel', name: 'Çark', src: '/fortune-wheel.png' },
  { id: 'gift-box', name: 'Hediye', src: '/gift-box.png' },
];

export default function AdminEventsPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state for adding/editing event
  const [eventFormData, setEventFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    endDate: '',
    location: '',
    description: '',
    category: '',
    backgroundGradient: '',
    partnerId: '',
    partnerName: '',
    partnerLogo: '',
    image: '',
    featured: false,
    capacity: 0,
    ticketsAvailable: false,
    availableStats: 0,
    participatingStats: 0,
    limitStats: 0,
    prizePoolStats: 0
  });
  
  const [imageUploadTab, setImageUploadTab] = useState<'url' | 'upload' | 'preloaded'>('preloaded');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageColumns, setImageColumns] = useState(2);
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || user.rank !== UserRank.ADMIN)) {
      router.push('/');
      return;
    }
    
    if (user) {
      setLoading(false);
    }
  }, [user, loading, router]);
  
  // Load events from localStorage
  useEffect(() => {
    const loadEvents = () => {
      if (typeof window !== 'undefined') {
        try {
          console.log("Loading events from localStorage...");
          const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
          if (storedEvents) {
            console.log("Found stored events:", storedEvents);
            // Need to convert date strings back to Date objects
            const parsedEvents = JSON.parse(storedEvents).map((event: any) => {
              try {
                return {
                  ...event,
                  date: new Date(event.date),
                  endDate: new Date(event.endDate)
                };
              } catch (error) {
                console.error('Error converting date for event:', event.id, error);
                // Provide default dates if conversion fails
                return {
                  ...event,
                  date: new Date(),
                  endDate: new Date()
                };
              }
            });
            setEvents(parsedEvents);
          } else {
            console.log("No stored events found, initializing with demo events");
            // Initialize localStorage with demo events
            localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(
              demoEvents.map(event => ({
                ...event,
                date: event.date.toISOString(),
                endDate: event.endDate.toISOString()
              }))
            ));
            setEvents(demoEvents);
          }
        } catch (error) {
          console.error('Error loading events from localStorage:', error);
          setEvents(demoEvents);
        }
      }
    };

    // Load events whenever loading state changes or component mounts
    if (!loading) {
      loadEvents();
    }

    // Add a storage event listener to refresh events when localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === EVENTS_STORAGE_KEY) {
        console.log("Storage event detected, reloading events");
        loadEvents();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loading]);

  // Function to refresh events data
  const refreshEvents = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
        if (storedEvents) {
          // Convert date strings back to Date objects
          const parsedEvents = JSON.parse(storedEvents).map((event: any) => {
            try {
              return {
                ...event,
                date: new Date(event.date),
                endDate: new Date(event.endDate)
              };
            } catch (error) {
              console.error('Error converting date for event:', event.id, error);
              return {
                ...event,
                date: new Date(),
                endDate: new Date()
              };
            }
          });
          setEvents(parsedEvents);
        }
      } catch (error) {
        console.error('Error refreshing events:', error);
        toast.error('Etkinlikler yüklenirken bir hata oluştu.');
      }
    }
  }, []);
  
  // Filter events based on search
  const filteredEvents = events.filter(event =>
    searchQuery === '' ||
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format date for display
  const formatEventDate = (date: Date) => {
    try {
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: tr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  // Format input field date
  const formatInputDate = (date: Date) => {
    try {
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
      console.error('Error formatting input date:', error);
      return '';
    }
  };
  
  // Format time for display
  const formatTimeOnly = (date: Date) => {
    try {
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:--';
    }
  };
  
  // Get category label from value
  const getCategoryLabel = (categoryValue: string) => {
    const category = eventCategories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };
  
  // Get partner info from id
  const getPartnerInfo = (partnerId: string) => {
    const partner = partnerOptions.find(p => p.id === partnerId);
    return partner || { id: partnerId, name: partnerId, logo: '' };
  };
  
  // Determine optimal number of columns for preloaded images based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setImageColumns(2);
      } else if (window.innerWidth < 1024) {
        setImageColumns(3);
      } else {
        setImageColumns(4);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced image handling functions
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setEventFormData(prev => ({ ...prev, image: url }));
    setUploadError(null);
    
    // Update preview if URL is not empty
    if (url) {
      setIsImageLoading(true);
      setImagePreview(url);
      setIsImageLoading(false);
    } else {
      setImagePreview(null);
      setIsImageLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Lütfen sadece görsel dosyası seçin.');
      toast.error('Geçersiz dosya türü! Lütfen görsel dosyası seçin.');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Dosya boyutu çok büyük. En fazla 5MB yükleyebilirsiniz.');
      toast.error('Dosya boyutu çok büyük! En fazla 5MB yükleyebilirsiniz.');
      return;
    }
    
    setUploadError(null);
    setIsImageLoading(true);
    
    // Read the file and convert to data URL for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      
      // In a real app, you would upload this file to a server and get back a URL
      // For this demo, we'll use the data URL as the image source
      setEventFormData(prev => ({ ...prev, image: result }));
      setIsImageLoading(false);
      toast.success('Görsel başarıyla yüklendi.');
    };
    reader.onerror = () => {
      setUploadError('Dosya okuma hatası. Lütfen tekrar deneyin.');
      setIsImageLoading(false);
      toast.error('Dosya okuma hatası oluştu.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Lütfen sadece görsel dosyası seçin.');
      toast.error('Geçersiz dosya türü! Lütfen görsel dosyası seçin.');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Dosya boyutu çok büyük. En fazla 5MB yükleyebilirsiniz.');
      toast.error('Dosya boyutu çok büyük! En fazla 5MB yükleyebilirsiniz.');
      return;
    }
    
    setUploadError(null);
    setIsImageLoading(true);
    
    // Same as handleImageUpload logic
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setEventFormData(prev => ({ ...prev, image: result }));
      setIsImageLoading(false);
      toast.success('Görsel başarıyla yüklendi.');
    };
    reader.onerror = () => {
      setUploadError('Dosya okuma hatası. Lütfen tekrar deneyin.');
      setIsImageLoading(false);
      toast.error('Dosya okuma hatası oluştu.');
    };
    reader.readAsDataURL(file);
  }, []);

  const handlePreloadedImageSelect = (imageSrc: string) => {
    setIsImageLoading(true);
    setImagePreview(imageSrc);
    setEventFormData(prev => ({ ...prev, image: imageSrc }));
    setUploadError(null);
    setIsImageLoading(false);
    toast.success('Görsel seçildi.');
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Open modal for adding new event
  const handleAddEvent = () => {
    setEditingEventId(null);
    setEventFormData({
      title: '',
      subtitle: '',
      date: '',
      endDate: '',
      location: '',
      description: '',
      category: '',
      backgroundGradient: 'from-blue-400 to-cyan-300',
      partnerId: '',
      partnerName: '',
      partnerLogo: '',
      image: '',
      featured: false,
      capacity: 100,
      ticketsAvailable: true,
      availableStats: 0,
      participatingStats: 0,
      limitStats: 0,
      prizePoolStats: 0
    });
    
    // Reset image preview
    setImagePreview(null);
    
    setIsModalOpen(true);
  };
  
  // Open modal for editing event
  const handleEditEvent = (event: Event) => {
    setEditingEventId(event.id);
    setEventFormData({
      title: event.title,
      subtitle: event.subtitle,
      date: formatInputDate(event.date),
      endDate: formatInputDate(event.endDate),
      location: event.location,
      description: event.description,
      category: event.category,
      backgroundGradient: event.backgroundGradient,
      partnerId: event.partnerId,
      partnerName: event.partnerName,
      partnerLogo: event.partnerLogo,
      image: event.image,
      featured: event.featured,
      capacity: event.capacity,
      ticketsAvailable: event.ticketsAvailable,
      availableStats: event.stats.available,
      participatingStats: event.stats.participating,
      limitStats: event.stats.limit,
      prizePoolStats: event.stats.prizePool
    });
    
    // Set image preview
    setImagePreview(event.image);
    
    setIsModalOpen(true);
  };
  
  // Handle delete event
  const handleDeleteEvent = (id: string) => {
    if (confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      try {
        // Get current events from localStorage
        const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
        if (storedEvents) {
          // Parse the stored events
          const parsedEvents = JSON.parse(storedEvents);
          
          // Filter out the event to delete
          const updatedEvents = parsedEvents.filter((event: any) => event.id !== id);
          
          // Save the updated events back to localStorage
          localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
          
          // Show success message
          toast.success('Etkinlik başarıyla silindi!');
          
          // Force a refresh to update the UI
          window.location.reload();
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Etkinlik silinirken bir hata oluştu.');
      }
    }
  };
  
  // Form submission for add/edit event
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (!eventFormData.title.trim()) {
        toast.error('Etkinlik adını girin.');
        return;
      }
      
      if (!eventFormData.date || !eventFormData.endDate) {
        toast.error('Başlangıç ve bitiş tarihlerini girin.');
        return;
      }
      
      // Parse dates
      const startDate = new Date(eventFormData.date);
      const endDate = new Date(eventFormData.endDate);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error('Geçersiz tarih formatı.');
        return;
      }
      
      if (endDate <= startDate) {
        toast.error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
        return;
      }
      
      // Create new event object
      const newEvent = {
        id: editingEventId || String(Date.now()), // Use existing ID or generate a new one
        title: eventFormData.title,
        subtitle: eventFormData.subtitle || '',
        image: eventFormData.image || '',
        date: startDate.toISOString(), // Convert to ISO string for storage
        endDate: endDate.toISOString(), // Convert to ISO string for storage
        location: eventFormData.location || 'Online',
        description: eventFormData.description || '',
        category: eventFormData.category || 'nakit',
        backgroundGradient: eventFormData.backgroundGradient || 'from-blue-400 to-cyan-300',
        partnerId: eventFormData.partnerId || '',
        partnerName: eventFormData.partnerName || '',
        partnerLogo: eventFormData.partnerLogo || '',
        featured: Boolean(eventFormData.featured),
        capacity: Number(eventFormData.capacity) || 100,
        ticketsAvailable: Boolean(eventFormData.ticketsAvailable),
        stats: {
          available: Number(eventFormData.availableStats) || 0,
          participating: Number(eventFormData.participatingStats) || 0,
          limit: Number(eventFormData.limitStats) || 0,
          prizePool: Number(eventFormData.prizePoolStats) || 0
        }
      };
      
      // Get existing events from localStorage
      const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY) || '[]';
      const parsedEvents = JSON.parse(storedEvents);
      
      // Update or add the event
      let updatedEvents;
      if (editingEventId) {
        // Update existing event
        updatedEvents = parsedEvents.map((event: any) => 
          event.id === editingEventId ? newEvent : event
        );
        toast.success('Etkinlik başarıyla güncellendi!');
      } else {
        // Add new event
        updatedEvents = [...parsedEvents, newEvent];
        toast.success('Yeni etkinlik başarıyla eklendi!');
      }
      
      // Save to localStorage
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
      
      // Close modal
      setIsModalOpen(false);
      
      // Force page refresh to show updated data
      window.location.reload();
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Bir hata oluştu. Lütfen formu kontrol edin ve tekrar deneyin.");
    }
  };
  
  // Handle input changes for the event form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEventFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'partnerId') {
      const partner = getPartnerInfo(value);
      setEventFormData(prev => ({ 
        ...prev, 
        [name]: value,
        partnerName: partner.name,
        partnerLogo: partner.logo
      }));
    } else {
      setEventFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };
  
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
            <h1 className="text-3xl font-bold text-white">Etkinlik Yönetimi</h1>
            <p className="text-gray-400">Etkinlikleri ekle, düzenle veya sil</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Etkinlik ara..."
                className="bg-gray-700 text-white px-4 py-2 pl-10 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={handleAddEvent}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" /> Yeni Etkinlik
            </button>
          </div>
        </div>
        
        {/* Events List */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors flex flex-col">
                <div className="p-4 bg-gray-750 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${
                      event.category === 'tournament' ? 'bg-red-400' :
                      event.category === 'panel' ? 'bg-blue-400' :
                      event.category === 'competition' ? 'bg-yellow-400' :
                      event.category === 'meetup' ? 'bg-green-400' :
                      event.category === 'concert' ? 'bg-purple-400' : 'bg-indigo-400'
                    }`}></span>
                    <span className="text-gray-300 text-sm font-medium">{getCategoryLabel(event.category)}</span>
                  </div>
                  
                  {event.featured && (
                    <span className="bg-blue-500 text-xs text-white px-2 py-0.5 rounded">Öne Çıkan</span>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row flex-grow">
                  {/* Event Image */}
                  <div className="w-full md:w-1/3 h-48 md:h-auto relative bg-gray-750">
                    {event.image ? (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Calendar className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Event Details */}
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                    
                    <div className="space-y-2 mb-4 text-sm flex-grow">
                      <div className="flex items-start">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{formatEventDate(event.date)}</span>
                      </div>
                      
                      <div className="flex items-start">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">
                          {formatTimeOnly(event.date)} - {formatTimeOnly(event.endDate)}
                        </span>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{event.location}</span>
                      </div>
                      
                      <div className="flex items-start">
                        <Users className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">Kapasite: {event.capacity} kişi</span>
                      </div>
                      
                      {!event.ticketsAvailable && (
                        <div className="flex items-start text-amber-400">
                          <AlertCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Bilet satışı kapalı</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="flex justify-end space-x-2 mt-auto">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-1.5 bg-blue-500 rounded hover:bg-blue-600 text-white flex items-center"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        <span>Düzenle</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1.5 bg-red-500 rounded hover:bg-red-600 text-white flex items-center"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        <span>Sil</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-white font-medium mb-1">Henüz etkinlik bulunmuyor</p>
            <p className="text-gray-400 text-sm mb-4">Yeni etkinlik ekleyerek başlayabilirsiniz.</p>
            <button
              onClick={handleAddEvent}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" /> Yeni Etkinlik Ekle
            </button>
          </div>
        )}
        
        {/* Add/Edit Event Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl my-8">
              <div className="p-4 bg-gray-700 flex justify-between items-center rounded-t-lg">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {editingEventId ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded hover:bg-gray-600"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-1">Etkinlik Adı</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.title}
                      onChange={handleInputChange}
                      name="title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Başlangıç Tarihi ve Saati</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.date}
                      onChange={handleInputChange}
                      name="date"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Bitiş Tarihi ve Saati</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.endDate}
                      onChange={handleInputChange}
                      name="endDate"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Konum</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.location}
                      onChange={handleInputChange}
                      name="location"
                      required
                      placeholder="Örn: Ana Sahne, Panel Salonu, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Kategori</label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.category}
                      onChange={handleInputChange}
                      name="category"
                      required
                    >
                      <option value="">Kategori Seçin</option>
                      {eventCategories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Partner</label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.partnerId}
                      onChange={handleInputChange}
                      name="partnerId"
                      required
                    >
                      <option value="">Partner Seçin</option>
                      {partnerOptions.map(partner => (
                        <option key={partner.id} value={partner.id}>{partner.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Kapasite</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.capacity}
                      onChange={handleNumberChange}
                      name="capacity"
                      required
                      min="1"
                    />
                  </div>
                  
                  <div className="md:col-span-2 mb-3">
                    <label className="block text-white mb-1 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Etkinlik Görseli
                    </label>
                    
                    {/* Enhanced Tab navigation */}
                    <div className="flex border-b border-gray-700 mb-4">
                      <button
                        type="button"
                        className={`py-2 px-4 mr-2 focus:outline-none ${
                          imageUploadTab === 'preloaded' 
                            ? 'text-blue-500 border-b-2 border-blue-500 font-medium' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                        onClick={() => setImageUploadTab('preloaded')}
                      >
                        <LayoutGrid className="w-4 h-4 inline-block mr-1" />
                        Hazır Görseller
                      </button>
                      <button
                        type="button"
                        className={`py-2 px-4 mr-2 focus:outline-none ${
                          imageUploadTab === 'upload' 
                            ? 'text-blue-500 border-b-2 border-blue-500 font-medium' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                        onClick={() => setImageUploadTab('upload')}
                      >
                        <Camera className="w-4 h-4 inline-block mr-1" />
                        Yükle
                      </button>
                      <button
                        type="button"
                        className={`py-2 px-4 focus:outline-none ${
                          imageUploadTab === 'url' 
                            ? 'text-blue-500 border-b-2 border-blue-500 font-medium' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                        onClick={() => setImageUploadTab('url')}
                      >
                        <Globe className="w-4 h-4 inline-block mr-1" />
                        URL
                      </button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image Preview - Always visible with improved UI */}
                      <div className="w-full md:w-1/2">
                        <div className="mb-2 text-gray-300 text-sm font-medium flex justify-between items-center">
                          <span>Önizleme</span>
                          {imagePreview && (
                            <button 
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setEventFormData(prev => ({ ...prev, image: '' }));
                              }}
                              className="text-gray-400 hover:text-red-400 text-xs flex items-center"
                            >
                              <X className="w-3 h-3 mr-1" /> Temizle
                            </button>
                          )}
                        </div>
                        <div 
                          className={`h-36 md:h-48 border-2 border-dashed ${
                            isDragging 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : imagePreview 
                                ? 'border-gray-500' 
                                : 'border-gray-600'
                          } rounded-lg flex flex-col items-center justify-center relative overflow-hidden ${imageUploadTab === 'upload' ? 'cursor-pointer' : ''} transition-all`}
                          onDragOver={imageUploadTab === 'upload' ? handleDragOver : undefined}
                          onDragLeave={imageUploadTab === 'upload' ? handleDragLeave : undefined}
                          onDrop={imageUploadTab === 'upload' ? handleDrop : undefined}
                          onClick={imageUploadTab === 'upload' ? triggerFileInput : undefined}
                        >
                          {isImageLoading ? (
                            <div className="flex flex-col items-center justify-center">
                              <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-2" />
                              <p className="text-gray-300 text-sm">Görsel yükleniyor...</p>
                            </div>
                          ) : imagePreview ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={imagePreview}
                                alt="Event image preview"
                                fill
                                style={{ objectFit: 'contain' }}
                                className="rounded-lg p-2"
                                onError={() => {
                                  setUploadError('Görsel yüklenemedi. URL geçersiz olabilir.');
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                {imageUploadTab === 'upload' && (
                                  <p className="text-white bg-gray-900 bg-opacity-75 px-2 py-1 rounded text-sm">
                                    Değiştirmek için tıklayın
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="w-10 h-10 text-gray-500 mb-2" />
                              <p className="text-gray-400 text-sm text-center">
                                {imageUploadTab === 'upload' 
                                  ? 'Görsel yüklemek için tıklayın veya dosyayı sürükleyin'
                                  : imageUploadTab === 'url'
                                    ? 'URL girin'
                                    : 'Hazır görsellerden seçin'
                                }
                              </p>
                            </>
                          )}
                          {imageUploadTab === 'upload' && (
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              onChange={handleImageUpload} 
                              accept="image/*" 
                              className="hidden"
                            />
                          )}
                        </div>
                        
                        {uploadError && (
                          <div className="mt-2 p-2 bg-red-900/40 border border-red-800 rounded-md">
                            <p className="text-red-300 text-xs flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                              {uploadError}
                            </p>
                          </div>
                        )}
                        
                        {imagePreview && imagePreview.startsWith('data:') && (
                          <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-800 rounded-md">
                            <p className="text-yellow-200 text-xs flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                              Bu dosya geçici olarak eklendi. Kalıcı bir çözüm için görselinizi sunucuya yükleyin.
                            </p>
                          </div>
                        )}
                        
                        {imagePreview && !imagePreview.startsWith('data:') && (
                          <div className="mt-2">
                            <p className="text-gray-400 text-xs truncate flex items-center">
                              <LinkIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                              {imagePreview}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Conditional right pane based on selected tab */}
                      <div className="w-full md:w-1/2">
                        {imageUploadTab === 'url' && (
                          <div>
                            <div className="mb-2">
                              <label className="block text-gray-300 text-sm font-medium mb-1">
                                <span className="flex items-center"><Globe className="w-4 h-4 mr-1" /> Görsel URL</span>
                              </label>
                              <input
                                type="text"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={eventFormData.image}
                                onChange={handleImageUrlChange}
                                placeholder="https://... veya /etkinlikimg/..."
                              />
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                              Görsel için bir URL girin. Tam veya göreceli URL kullanabilirsiniz.
                            </p>
                            <div className="mt-3 p-2 bg-gray-700 rounded-md">
                              <p className="text-sm text-gray-300 mb-1 font-medium flex items-center">
                                <LinkIcon className="w-4 h-4 mr-1" /> URL Örnekleri
                              </p>
                              <ul className="text-xs text-gray-400 space-y-1 list-disc pl-5">
                                <li>External: https://example.com/image.jpg</li>
                                <li>Internal: /etkinlikimg/sportsbet.png</li>
                                <li>Generic: /rocket.png</li>
                              </ul>
                            </div>
                          </div>
                        )}
                        
                        {imageUploadTab === 'upload' && (
                          <div>
                            <div className="mb-2">
                              <label className="block text-gray-300 text-sm font-medium mb-1">
                                <span className="flex items-center"><Camera className="w-4 h-4 mr-1" /> Dosyadan Yükle</span>
                              </label>
                              <div 
                                className="w-full h-20 bg-gray-700 border border-gray-600 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-650 transition-colors"
                                onClick={triggerFileInput}
                              >
                                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                <span className="text-sm text-gray-300">Dosya seçmek için tıklayın</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                              Desteklenen formatlar: JPG, PNG, GIF, WEBP. Maksimum 5MB.
                            </p>
                            <div className="mt-3 p-2 bg-gray-700 rounded-md">
                              <p className="text-sm text-gray-300 mb-1 font-medium flex items-center">
                                <Folder className="w-4 h-4 mr-1" /> Yükleme İpuçları
                              </p>
                              <ul className="text-xs text-gray-400 space-y-1 list-disc pl-5">
                                <li>En iyi görünüm için 16:9 en boy oranını kullanın</li>
                                <li>Banner görselleri için önerilen boyut: 1280×720px</li>
                                <li>Sol paneye dosya sürükleyip bırakabilirsiniz</li>
                                <li>Görsel yüklendikten sonra etkinlik kaydedildiğinde kalıcı olacaktır</li>
                              </ul>
                            </div>
                            <div className="flex justify-center mt-4">
                              <button 
                                type="button" 
                                onClick={triggerFileInput}
                                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md flex items-center"
                              >
                                <Upload className="w-4 h-4 mr-1.5" />
                                Bilgisayardan Seç
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {imageUploadTab === 'preloaded' && (
                          <div>
                            <div className="mb-2">
                              <label className="block text-gray-300 text-sm font-medium mb-1 flex justify-between items-center">
                                <span className="flex items-center">
                                  <LayoutGrid className="w-4 h-4 mr-1" /> Hazır Görsellerden Seçin
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setImageColumns(imageColumns === 4 ? 2 : imageColumns + 1)}
                                  className="p-1 text-xs text-gray-400 hover:text-gray-300 flex items-center"
                                  title="Görünümü değiştir"
                                >
                                  <LayoutGrid className="w-3 h-3 mr-1" />
                                  {imageColumns}x
                                </button>
                              </label>
                            </div>
                            
                            <div 
                              className={`grid grid-cols-${imageColumns} gap-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar`}
                              style={{ 
                                gridTemplateColumns: `repeat(${imageColumns}, minmax(0, 1fr))`,
                                scrollbarWidth: 'thin'
                              }}
                            >
                              {preloadedImages.map((img) => (
                                <div 
                                  key={img.id} 
                                  className={`relative rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                                    eventFormData.image === img.src 
                                      ? 'border-blue-500 shadow-md shadow-blue-500/20' 
                                      : 'border-gray-700 hover:border-gray-500'
                                  }`}
                                  onClick={() => handlePreloadedImageSelect(img.src)}
                                >
                                  <div className="relative h-18 w-full bg-black/20">
                                    <Image
                                      src={img.src}
                                      alt={img.name}
                                      fill
                                      style={{ 
                                        objectFit: 'contain',
                                        padding: '4px'
                                      }}
                                      onError={(e) => {
                                        // Apply a fallback image on error
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-icon.svg';
                                      }}
                                    />
                                  </div>
                                  <div className="p-1 text-center bg-gray-700 text-xs truncate flex justify-between items-center">
                                    <span className="truncate">{img.name}</span>
                                    {eventFormData.image === img.src && (
                                      <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <p className="text-sm text-gray-400 mt-3">
                              Yukarıdaki görsellerden birini seçin veya diğer sekmeleri kullanarak kendi görselinizi ekleyin.
                            </p>
                            
                            <div className="flex justify-between items-center mt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  // Implement a fetch to refresh available images
                                  toast.success('Görsel listesi yenilendi.');
                                }}
                                className="text-gray-400 hover:text-blue-400 text-xs flex items-center"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" /> Listeyi Yenile
                              </button>
                              <a 
                                href="/admin/upload"
                                className="text-gray-400 hover:text-green-400 text-xs flex items-center"
                                target="_blank"
                              >
                                <Upload className="w-3 h-3 mr-1" /> Yeni Görsel Yükle
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {/* Hidden input field to store the selected image path */}
                        <input 
                          type="hidden" 
                          name="image" 
                          value={eventFormData.image} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-1">Etkinlik Açıklaması</label>
                    <textarea
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      value={eventFormData.description}
                      onChange={handleInputChange}
                      name="description"
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="featured"
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                        checked={eventFormData.featured}
                        onChange={handleInputChange}
                        name="featured"
                      />
                      <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                        Ana sayfada öne çıkar
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="ticketsAvailable"
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                        checked={eventFormData.ticketsAvailable}
                        onChange={handleInputChange}
                        name="ticketsAvailable"
                      />
                      <label htmlFor="ticketsAvailable" className="ml-2 text-sm text-gray-300">
                        Bilet satışı açık
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-500"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 flex items-center"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    {editingEventId ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 