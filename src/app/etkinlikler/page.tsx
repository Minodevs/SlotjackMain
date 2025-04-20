'use client';

import { useState, useEffect } from 'react';
import { Calendar, Tag, MapPin, Users, Clock, Bookmark, Trash2, Coins, X, Plus, Check } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import GridCard, { 
  GridCardContainer, 
  GridCardContent, 
  GridCardFooter, 
  GridCardImage, 
  GridCardTitle, 
  GridCardDescription 
} from '@/components/GridCard';
import { useRouter } from 'next/navigation';

// Floating Coin Animation Component
function FloatingCoin({ amount, isVisible, onAnimationEnd }: { amount: number; isVisible: boolean; onAnimationEnd: () => void }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (isVisible && isMounted) {
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationEnd, isMounted]);

  if (!isVisible || !isMounted) return null;

  return (
    <div className="fixed top-20 right-20 z-50 animate-float-up">
      <div className={`flex items-center font-bold text-xl ${amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
        <Coins className="w-8 h-8 mr-2" />
        <span>{amount > 0 ? '+' : ''}{amount}</span>
      </div>
    </div>
  );
}

// Function to format date for display
const formatEventDate = (dateString: string) => {
  return dateString;
};

// Define the Event interface
interface Event {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  date: string; 
  time: string;
  location: string;
  category: string;
  description: string;
  participants: number;
  maxParticipants: number;
  reward: number;
  backgroundGradient: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string;
  stats: {
    available: number;
    participating: number;
    limit: number;
    prizePool: number;
  };
  beginDate?: string;
  endDate?: string;
  minDeposit?: number;
  depositText?: string;
  hasEnded?: boolean;
}

// Local storage key for events data
const EVENTS_STORAGE_KEY = 'slotjack_events';
const JOINED_EVENTS_KEY = 'slotjack_joined_events';
const SAVED_EVENTS_KEY = 'slotjack_saved_events';

// Default events data if none are in localStorage
const defaultEventsData: Event[] = [
  {
    id: '1',
    title: 'SPORTSBET.IO X SLOTJACK ÖZEL NAKİT ETKİNLİĞİ',
    subtitle: 'Özel Nakit Etkinliği',
    image: '/images/events/sportsbet-event.jpg',
    date: '15 Temmuz 2024',
    time: '19:00',
    location: 'Online',
    category: 'Nakit Etkinlik',
    description: 'Sportsbet.io ile ortak nakit etkinliğimize katılın ve büyük ödülleri kazanma şansı yakalayın.',
    participants: 58,
    maxParticipants: 100,
    reward: 50,
    backgroundGradient: 'from-green-500 to-blue-500',
    partnerId: 'sportsbet',
    partnerName: 'Sportsbet.io',
    partnerLogo: '/etkinlikimg/sportsbet.png',
    stats: {
      available: 11,
      participating: 28,
      limit: 20,
      prizePool: 100000
    },
    beginDate: '2023-04-16',
    endDate: '2023-04-17',
    minDeposit: 1000,
    depositText: 'SPORTSBET\'TEN 20 KİŞİYE 100.000₺ NAKİT',
    hasEnded: true
  },
  {
    id: '2',
    title: 'ISISBET X SLOTJACK ÖZEL NAKİT ETKİNLİĞİ',
    subtitle: 'Özel Nakit Etkinliği',
    image: '/images/events/isisbet-event.jpg',
    date: '20 Temmuz 2024',
    time: '21:00',
    location: 'Online',
    category: 'Nakit Etkinlik',
    description: 'IsIsBet ile özel nakit etkinliği. Katılın ve büyük ödüller kazanma fırsatını kaçırmayın.',
    participants: 15,
    maxParticipants: 30,
    reward: 75,
    backgroundGradient: 'from-pink-500 to-purple-500',
    partnerId: 'isisbet',
    partnerName: 'IsIsBet',
    partnerLogo: '/etkinlikimg/isiabet.png',
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 50000
    },
    beginDate: '2023-05-01',
    endDate: '2023-05-15',
    minDeposit: 500,
    depositText: 'ISISBET\'TEN ÖZEL NAKİT ÖDÜLÜ',
    hasEnded: true
  },
  {
    id: '3',
    title: 'GAMBİ X SLOTJACK ÖZEL FS ETKİNLİĞİ',
    subtitle: 'Özel Freespin Etkinliği',
    image: '/images/events/gambi-event.jpg',
    date: '25 Temmuz 2024',
    time: '20:00',
    location: 'Online',
    category: 'Freespin',
    description: 'GAMBİ ile freespin etkinliğimize katılın. İlk oynayanlar için özel bonuslar.',
    participants: 120,
    maxParticipants: 250,
    reward: 100,
    backgroundGradient: 'from-green-400 to-teal-500',
    partnerId: 'gambi',
    partnerName: 'GAMBİ',
    partnerLogo: '/etkinlikimg/gambi.png',
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 75000
    },
    beginDate: '2023-06-01',
    endDate: '2023-06-30',
    minDeposit: 750,
    depositText: 'GAMBİ\'DEN FREESPIN ÖDÜLÜ',
    hasEnded: true
  },
  {
    id: '4',
    title: 'SLOTJACK X EFESBET ÖZEL NAKİT ETKİNLİĞİ',
    subtitle: 'Özel Nakit Etkinliği',
    image: '/images/events/efesbet-event.jpg',
    date: '30 Temmuz 2024',
    time: '18:00',
    location: 'Online',
    category: 'Nakit Etkinlik',
    description: 'Efesbet ile nakit etkinliğimize katılın ve bonuslar kazanın.',
    participants: 200,
    maxParticipants: 500,
    reward: 25,
    backgroundGradient: 'from-blue-400 to-cyan-300',
    partnerId: 'efesbet',
    partnerName: 'Efesbet',
    partnerLogo: '/etkinlikimg/efesbet.png',
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 25000
    },
    beginDate: '2023-07-01',
    endDate: '2023-07-15',
    minDeposit: 250,
    depositText: 'EFESBET\'TEN NAKİT ÖDÜLÜ',
    hasEnded: true
  },
  {
    id: '5',
    title: 'ZLOT X SLOTJACK KADINLAR GÜNÜ ÖZEL ETKİNLİĞİ',
    subtitle: 'Kadınlar Günü Özel Etkinliği',
    image: '/images/events/zlot-event.jpg',
    date: '5 Ağustos 2024',
    time: '19:30',
    location: 'Online',
    category: 'Özel Etkinlik',
    description: 'Kadınlar günü için özel etkinliğimize katılın.',
    participants: 45,
    maxParticipants: 80,
    reward: 60,
    backgroundGradient: 'from-rose-400 to-red-500',
    partnerId: 'zlot',
    partnerName: 'Zlot',
    partnerLogo: '/etkinlikimg/zlat.png',
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 40000
    },
    beginDate: '2023-08-01',
    endDate: '2023-08-15',
    minDeposit: 500,
    depositText: 'ZLOT\'TAN KADINLAR GÜNÜ ÖZEL ÖDÜLÜ',
    hasEnded: true
  },
  {
    id: '6',
    title: 'BETNANO X SLOTJACK ÖZEL KAYIT ETKİNLİĞİ',
    subtitle: 'Özel Kayıt Etkinliği',
    image: '/images/events/betnano-event.jpg',
    date: '10 Ağustos 2024',
    time: '17:00',
    location: 'Online',
    category: 'Kayıt Etkinlik',
    description: 'Betnano ile kayıt etkinliğimize katılın ve özel bonuslar kazanın.',
    participants: 75,
    maxParticipants: 150,
    reward: 30,
    backgroundGradient: 'from-amber-500 to-orange-500',
    partnerId: 'betnano',
    partnerName: 'Betnano',
    partnerLogo: '/etkinlikimg/betnano.png',
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 30000
    },
    beginDate: '2023-09-01',
    endDate: '2023-09-30',
    minDeposit: 300,
    depositText: 'BETNANO\'DAN KAYIT ÖDÜLÜ',
    hasEnded: true
  }
];

// Add a countdown timer component
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);
  
  if (isExpired) {
    return (
      <div className="w-full">
        <div className="bg-gray-900/70 text-white py-2 px-4 rounded-md text-center">
          Etkinlik tarihi sona erdi.
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      <div className="text-center">
        <div className="text-lg md:text-xl font-bold">{timeLeft.days}</div>
        <div className="text-xs text-gray-400">GÜN</div>
      </div>
      <div className="text-center">
        <div className="text-lg md:text-xl font-bold">{timeLeft.hours}</div>
        <div className="text-xs text-gray-400">SAAT</div>
      </div>
      <div className="text-center">
        <div className="text-lg md:text-xl font-bold">{timeLeft.minutes}</div>
        <div className="text-xs text-gray-400">DAKİKA</div>
      </div>
      <div className="text-center">
        <div className="text-lg md:text-xl font-bold">{timeLeft.seconds}</div>
        <div className="text-xs text-gray-400">SANİYE</div>
      </div>
    </div>
  );
}

// Define categories for filtering
const categories = [
  { id: '', name: 'Tümü' },
  { id: 'Nakit Etkinlik', name: 'Nakit Etkinlikler' },
  { id: 'Freespin', name: 'Freespin' },
  { id: 'Özel Etkinlik', name: 'Özel Etkinlikler' },
  { id: 'Kayıt Etkinlik', name: 'Kayıt Etkinlikleri' }
];

export default function EventsPage() {
  const router = useRouter();
  const { user, updateJackPoints } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joiningEvent, setJoiningEvent] = useState<{ id: string; title: string; reward: number } | null>(null);
  const [showCoinAnim, setShowCoinAnim] = useState(false);
  const [coinAmount, setCoinAmount] = useState(0);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Load events from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      if (typeof window !== 'undefined') {
        try {
          // Load events
          const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
          if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
          } else {
            // Initialize localStorage with default events
            localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(defaultEventsData));
            setEvents(defaultEventsData);
          }
          
          // Load saved events
          const savedEventsData = localStorage.getItem(SAVED_EVENTS_KEY);
          if (savedEventsData) {
            setSavedEvents(JSON.parse(savedEventsData));
          }
          
          // Load joined events
          const joinedEventsData = localStorage.getItem(JOINED_EVENTS_KEY);
          if (joinedEventsData) {
            setJoinedEvents(JSON.parse(joinedEventsData));
          }
        } catch (error) {
          console.error('Error loading data from localStorage:', error);
          setEvents(defaultEventsData);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    // Add storage event listener to sync changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === EVENTS_STORAGE_KEY) {
        loadData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Save to localStorage when changes occur
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(savedEvents));
    }
  }, [savedEvents, loading]);
  
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      localStorage.setItem(JOINED_EVENTS_KEY, JSON.stringify(joinedEvents));
    }
  }, [joinedEvents, loading]);
  
  // Toggle saved event
  const toggleSavedEvent = (eventId: string) => {
    if (savedEvents.includes(eventId)) {
      setSavedEvents(savedEvents.filter(id => id !== eventId));
    } else {
      setSavedEvents([...savedEvents, eventId]);
    }
  };
  
  // Function to trigger coin animation
  const showCoinAnimation = (amount: number) => {
    setShowCoinAnim(true);
    setCoinAmount(amount);
  };
  
  // Join event and get reward points
  const joinEvent = async (eventId: string, eventTitle: string, reward: number) => {
    if (!user) {
      alert('Etkinliğe katılmak için giriş yapmalısınız!');
      return;
    }
    
    // Check if already joined
    if (joinedEvents.includes(eventId)) {
      alert('Bu etkinliğe zaten katıldınız!');
      return;
    }

    // Find the event and show details modal first
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowEventDetails(true);
    }
  };

  // Proceed to join modal after viewing details
  const handleProceedToJoin = () => {
    setShowEventDetails(false);
    setShowJoinModal(true);
  };

  // Handle final event join after confirmation
  const handleJoinConfirm = async () => {
    if (!joiningEvent) return;
    
    // Call the existing joinEvent function
    joinEvent(joiningEvent.id, joiningEvent.title, joiningEvent.reward);
    
    // Close modal
    setShowJoinModal(false);
    setJoiningEvent(null);
  };
  
  if (loading) {
    return (
      <ClientLayout>
        <div className="w-full flex items-center justify-center min-h-[500px] bg-gray-900">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-base text-gray-300">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR');
  };
  
  // Handle clicking on an event card to show details
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };
  
  // Handler for the join event button
  const handleJoinEvent = (eventId: string, eventTitle: string, reward: number) => {
    // set joining event data for the confirmation modal
    setJoiningEvent({ id: eventId, title: eventTitle, reward });
    setShowJoinModal(true);
  };
  
  // Filter events based on selected category
  const filteredEvents = events.filter(event => 
    selectedCategory === '' || event.category === selectedCategory
  );
  
  return (
    <ClientLayout>
      <div className="bg-gray-900 min-h-screen pb-10">
        <div className="max-w-7xl mx-auto px-4 pt-8">
          {/* Events Grid - Desktop View */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={`desktop-${event.id}`} className="rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700 h-full flex flex-col">
                {/* Event Image */}
                <div className="relative w-full h-48">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Partner Logo Overlay */}
                  <div className="absolute top-4 left-4">
                    <img 
                      src={event.partnerLogo} 
                      alt={event.partnerName}
                      className="h-8 object-contain"
                    />
                  </div>
                  
                  {/* Event Type Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 text-center p-4 text-white font-bold text-xl bg-gradient-to-t from-black/70 to-transparent">
                    {event.subtitle}
                  </div>
                </div>
                
                {/* Event Content */}
                <div className="p-4 flex-grow">
                  <h3 className="text-white text-lg font-bold leading-tight mb-6">
                    {event.title}
                  </h3>
                  
                  {/* Event Timer */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center">
                      <div className="bg-gray-700 rounded-md p-2 text-xl text-white font-bold">0</div>
                      <div className="mt-1 text-xs text-gray-400">GÜN</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-gray-700 rounded-md p-2 text-xl text-white font-bold">0</div>
                      <div className="mt-1 text-xs text-gray-400">SAAT</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-gray-700 rounded-md p-2 text-xl text-white font-bold">0</div>
                      <div className="mt-1 text-xs text-gray-400">DAKİKA</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-gray-700 rounded-md p-2 text-xl text-white font-bold">0</div>
                      <div className="mt-1 text-xs text-gray-400">SANİYE</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-700 rounded p-2 text-center">
                      <div className="text-yellow-500 font-bold text-base">Toplam Ödül</div>
                      <div className="text-white font-bold">{event.stats.prizePool.toLocaleString()} ₺</div>
                    </div>
                    <div className="bg-gray-700 rounded p-2 text-center">
                      <div className="text-yellow-500 font-bold text-base">Maks Katılım</div>
                      <div className="text-white font-bold">{event.stats.limit}</div>
                    </div>
                  </div>
                </div>
                
                {/* Event Footer */}
                <div className="p-4 bg-gray-800">
                  <div className="rounded-lg border border-gray-600 p-3 text-center">
                    <span className="text-gray-300">Etkinlik tarihi sona erdi.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Events Grid - Mobile View */}
          <div className="flex flex-col md:hidden space-y-5">
            {filteredEvents.map((event) => (
              <div key={`mobile-${event.id}`} className="rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700 flex flex-col">
                {/* Event Banner Image - Larger for mobile */}
                <div className="relative w-full" style={{ backgroundColor: '#192350' }}>
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full object-cover py-3"
                    style={{ maxHeight: '180px' }}
                  />
                  
                  {/* Partner Logo Overlay */}
                  <div className="absolute top-4 left-4">
                    <img 
                      src={event.partnerLogo} 
                      alt={event.partnerName}
                      className="h-8 object-contain"
                    />
                  </div>
                  
                  {/* Event Type Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 text-center p-4 text-white font-bold text-xl bg-gradient-to-t from-black/70 to-transparent">
                    {event.subtitle}
                  </div>
                </div>
                
                {/* Event Content */}
                <div className="p-5">
                  <h3 className="text-white text-xl font-bold mb-3">
                    {event.title}
                  </h3>
                  
                  {/* Event Timer */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center">
                      <div className="bg-gray-700 rounded-md p-2 text-lg text-white font-bold">0</div>
                      <div className="mt-1 text-xs text-gray-400">GÜN</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-gray-700 rounded-md p-2 text-lg text-white font-bold">0</div>
                      <div className="mt-1 text-xs text-gray-400">SAAT</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-gray-700 rounded-md p-2 text-lg text-white font-bold">0</div>
                      <div className="mt-1 text-xs text-gray-400">DAKİKA</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-gray-700 rounded-md p-2 text-lg text-white font-bold">0</div>
                      <div className="mt-1 text-xs text-gray-400">SANİYE</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="bg-gray-700/70 py-2 px-4 rounded-full">
                      <div className="text-yellow-500 font-bold text-sm">Toplam: {event.stats.prizePool.toLocaleString()} ₺</div>
                    </div>
                    
                    <div className="bg-gray-700/70 py-2 px-4 rounded-full">
                      <div className="text-yellow-500 font-bold text-sm">Limit: {event.stats.limit}</div>
                    </div>
                  </div>
                  
                  {/* Event Status */}
                  <div className="mt-4 rounded-full bg-gray-700/50 border border-gray-600 p-3 text-center">
                    <span className="text-gray-300">Etkinlik tarihi sona erdi.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No events message */}
          {filteredEvents.length === 0 && !loading && (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">Henüz etkinlik bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
} 