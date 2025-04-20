'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, Plus, Search, 
  TicketX, X, Edit, Trash2, Save, Tag, Ticket, LinkIcon, Calendar
} from 'lucide-react';
import ClientLayout from '../../../components/ClientLayout';
import { UserRank } from '@/contexts/AuthContext';

// Event interface for loading events data
interface Event {
  id: string;
  title: string;
  subtitle?: string;
  date: string | Date;
  ticketsAvailable: boolean;
}

// Define the Ticket interface
interface TicketType {
  id: string;
  name: string;
  price: number;
  event: string;
  eventId: string;
  description: string;
  available: number;
  sold: number;
  maxPerPerson: number;
  saleEnds: number;
}

// Utility function to format date for input fields
const formatDateForInput = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};

// Sample tickets for demonstration
const demoTickets = [
  { 
    id: '1', 
    name: 'Standart Bilet', 
    price: 149.99,
    event: 'Fortnite Turnuvası',
    eventId: '1',
    description: 'Standart giriş bileti. Temel turnuva katılımı içerir.',
    available: 200,
    sold: 45,
    maxPerPerson: 2,
    saleEnds: Date.now() + 86400000 * 4, // 4 days in the future
  },
  { 
    id: '2', 
    name: 'VIP Bilet', 
    price: 299.99,
    event: 'Fortnite Turnuvası',
    eventId: '1',
    description: 'VIP giriş bileti. Özel oturma, içecek ve yiyecek dahil.',
    available: 50,
    sold: 15,
    maxPerPerson: 1,
    saleEnds: Date.now() + 86400000 * 4, // 4 days in the future
  },
  { 
    id: '3', 
    name: 'Standart Bilet', 
    price: 89.99,
    event: 'CS2 Workshop',
    eventId: '2',
    description: 'Workshop katılım bileti.',
    available: 100,
    sold: 78,
    maxPerPerson: 1,
    saleEnds: Date.now() + 86400000 * 9, // 9 days in the future
  },
];

export default function AdminTicketsPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketType[]>(demoTickets);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [authCheckCompleted, setAuthCheckCompleted] = useState(false);
  
  // Helper for reliable navigation
  const navigateWithFallback = (path: string) => {
    try {
      // Try router first
      router.push(path);
      
      // Set fallback direct navigation in case router silently fails
      const fallbackTimer = setTimeout(() => {
        console.log("Router fallback: Using direct navigation");
        window.location.href = path;
      }, 1000);
      
      // This setTimeout will be cleared on component unmount
      return () => clearTimeout(fallbackTimer);
    } catch (err) {
      console.error("Router error, using direct navigation:", err);
      window.location.href = path;
    }
  };
  
  // Form state for adding/editing ticket
  const [ticketFormData, setTicketFormData] = useState({
    name: '',
    price: '',
    event: '',
    eventId: '',
    description: '',
    available: '',
    maxPerPerson: '',
    saleEnds: ''
  });
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Load tickets from localStorage on component mount
  useEffect(() => {
    // Skip auth check if already done
    if (authCheckCompleted) return;
    
    // Don't check immediately on first render to allow auth context to initialize
    const timer = setTimeout(() => {
      console.log("Current user:", user);
      console.log("User rank:", user?.rank);
      
      // Try to get user from AuthContext first
      let isAuthenticated = false;
      let isAdmin = false;
      
      if (user) {
        isAuthenticated = true;
        const userRank = user.rank?.toString() || '';
        isAdmin = userRank === UserRank.ADMIN || userRank.toLowerCase() === 'admin';
      } 
      // If not available in AuthContext, check localStorage as fallback
      else if (typeof window !== 'undefined') {
        try {
          const localUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (localUser?.id) {
            isAuthenticated = true;
            const localUserRank = localUser.rank?.toString() || '';
            isAdmin = localUserRank === UserRank.ADMIN || 
                     localUserRank === 'admin' || 
                     localUserRank === 'ADMIN';
          }
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }
      
      // Redirect if not authenticated or not admin
      if (!isAuthenticated) {
        console.log("No user found, redirecting to homepage");
        navigateWithFallback('/');
        return;
      }
      
      if (!isAdmin) {
        console.log("User is not an admin, redirecting to homepage");
        navigateWithFallback('/');
        return;
      }

      setAuthCheckCompleted(true);
      
      // Load tickets from localStorage or use demo tickets if none exist
      if (typeof window !== 'undefined') {
        const storedTickets = localStorage.getItem('tickets');
        if (storedTickets) {
          try {
            setTickets(JSON.parse(storedTickets));
          } catch (e) {
            console.error("Error parsing tickets from localStorage:", e);
            // Use demo tickets as fallback
            localStorage.setItem('tickets', JSON.stringify(demoTickets));
          }
        } else {
          // Initialize localStorage with demo tickets
          localStorage.setItem('tickets', JSON.stringify(demoTickets));
        }
        
        setLoading(false);
      }
    }, 500); // Short delay to let auth context initialize fully
    
    return () => clearTimeout(timer);
  }, [user, router, authCheckCompleted]);

  // Load events from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      try {
        const storedEvents = localStorage.getItem('slotjack_events');
        if (storedEvents) {
          const parsedEvents = JSON.parse(storedEvents).map((event: any) => ({
            ...event,
            // Ensure dates are properly converted to Date objects if needed
            date: new Date(event.date),
            endDate: event.endDate ? new Date(event.endDate) : undefined
          }));
          setEvents(parsedEvents);
        }
      } catch (error) {
        console.error('Error loading events from localStorage:', error);
      }
    }
  }, [loading]);

  // Save tickets to localStorage whenever they change
  useEffect(() => {
    // This is now handled directly in the handlers,
    // but we'll keep this as a backup in case tickets change in other ways
    if (!loading && typeof window !== 'undefined') {
      localStorage.setItem('tickets', JSON.stringify(tickets));
    }
  }, [tickets, loading]);
  
  // Listen for changes to events in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'slotjack_events' && e.newValue) {
        try {
          const parsedEvents = JSON.parse(e.newValue).map((event: any) => ({
            ...event,
            date: new Date(event.date),
            endDate: event.endDate ? new Date(event.endDate) : undefined
          }));
          setEvents(parsedEvents);
        } catch (error) {
          console.error('Error parsing updated events from storage event:', error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);
  
  // Filter tickets based on search
  const filteredTickets = tickets.filter(ticket =>
    searchQuery === '' ||
    ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.price.toString().includes(searchQuery.toLowerCase())
  );
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Open modal for adding new ticket
  const handleAddTicket = () => {
    setEditingTicketId(null);
    
    // Set default end date to 7 days from now
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 7);
    defaultEndDate.setHours(23, 59, 0, 0); // End of day
    
    setTicketFormData({
      name: '',
      price: '',
      event: '',
      eventId: '',
      description: '',
      available: '100',
      maxPerPerson: '1',
      saleEnds: formatDateForInput(defaultEndDate.getTime())
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing ticket
  const handleEditTicket = (ticket: typeof tickets[0]) => {
    setEditingTicketId(ticket.id);
    setTicketFormData({
      name: ticket.name,
      price: ticket.price.toString(),
      event: ticket.event,
      eventId: ticket.eventId,
      description: ticket.description,
      available: ticket.available.toString(),
      maxPerPerson: ticket.maxPerPerson.toString(),
      saleEnds: formatDateForInput(ticket.saleEnds)
    });
    setIsModalOpen(true);
  };
  
  // Handle delete ticket
  const handleDeleteTicket = (id: string) => {
    if (confirm('Bu bileti silmek istediğinizden emin misiniz?')) {
      const updatedTickets = tickets.filter(ticket => ticket.id !== id);
      setTickets(updatedTickets);
      
      // Save to localStorage and dispatch a storage event to notify other tabs/components
      if (typeof window !== 'undefined') {
        localStorage.setItem('tickets', JSON.stringify(updatedTickets));
        
        // Manually trigger a storage event for the current tab
        // (storage events normally only fire in other tabs)
        try {
          const event = new StorageEvent('storage', {
            key: 'tickets',
            newValue: JSON.stringify(updatedTickets),
            oldValue: JSON.stringify(tickets),
            storageArea: localStorage
          });
          window.dispatchEvent(event);
          console.log('Storage event dispatched for ticket deletion');
        } catch (error) {
          // Fallback for browsers that don't support StorageEvent constructor
          // Force a state refresh in one second
          setTimeout(() => {
            // Small state update to force re-render
            setLoading(l => !l);
            setTimeout(() => setLoading(l => !l), 10);
          }, 100);
        }
      }
    }
  };
  
  // Function to verify event exists and is valid
  const verifyEventExists = (eventId: string): boolean => {
    // Check if the event exists in our loaded events
    const eventExists = events.some(event => event.id === eventId);
    
    // If no events are loaded yet, allow the demo event IDs as a fallback
    if (events.length === 0 && ['1', '2', '3'].includes(eventId)) {
      return true;
    }
    
    return eventExists;
  };

  // Handle form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify the event exists before creating the ticket
    if (!verifyEventExists(ticketFormData.eventId)) {
      alert('Lütfen geçerli bir etkinlik seçin.');
      return;
    }
    
    // Check if the selected event has ticket sales enabled
    const selectedEvent = getEventById(ticketFormData.eventId);
    if (selectedEvent && !selectedEvent.ticketsAvailable) {
      if (!confirm('Bu etkinlik için bilet satışı kapalı. Yine de bilet eklemek istiyor musunuz?')) {
        return;
      }
    }
    
    const ticketData = {
      id: editingTicketId || Date.now().toString(),
      name: ticketFormData.name,
      price: parseFloat(ticketFormData.price),
      event: ticketFormData.event,
      eventId: ticketFormData.eventId,
      description: ticketFormData.description,
      available: parseInt(ticketFormData.available),
      sold: editingTicketId ? 
        tickets.find(t => t.id === editingTicketId)?.sold || 0 : 0,
      maxPerPerson: parseInt(ticketFormData.maxPerPerson),
      saleEnds: new Date(ticketFormData.saleEnds).getTime()
    };
    
    let updatedTickets: typeof tickets = [];
    
    if (editingTicketId) {
      // Update existing ticket
      updatedTickets = tickets.map(ticket => 
        ticket.id === editingTicketId ? ticketData : ticket
      );
    } else {
      // Add new ticket
      updatedTickets = [...tickets, ticketData];
    }
    
    // Update state
    setTickets(updatedTickets);
    
    // Save to localStorage and dispatch a storage event to notify other tabs/components
    if (typeof window !== 'undefined') {
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
      
      // Manually trigger a storage event for the current tab
      try {
        const event = new StorageEvent('storage', {
          key: 'tickets',
          newValue: JSON.stringify(updatedTickets),
          oldValue: JSON.stringify(tickets),
          storageArea: localStorage
        });
        window.dispatchEvent(event);
        console.log('Storage event dispatched for ticket update');
      } catch (error) {
        // Fallback for browsers that don't support StorageEvent constructor
        setTimeout(() => {
          // Small state update to force re-render
          setLoading(l => !l);
          setTimeout(() => setLoading(l => !l), 10);
        }, 100);
      }
    }
    
    setIsModalOpen(false);
  };
  
  // Get a formatted event display name (with date if available)
  const getEventDisplayName = (event: Event) => {
    if (typeof event.title !== 'string') return 'Etkinlik';
    
    let displayName = event.title;
    
    // If there's a date, add it to the display name
    if (event.date) {
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
      });
      displayName = `${displayName} (${formattedDate})`;
    }
    
    return displayName;
  };
  
  // Find event details by ID (returns undefined if not found)
  const getEventById = (eventId: string): Event | undefined => {
    return events.find(event => event.id === eventId);
  };

  // Format event date in a readable format
  const formatEventDate = (event?: Event) => {
    if (!event || !event.date) return 'N/A';
    
    const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
    return eventDate.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if an event allows ticket sales
  const isEventTicketable = (eventId: string): boolean => {
    const event = getEventById(eventId);
    return event ? !!event.ticketsAvailable : false;
  };

  // Trigger a re-fetch of events when needed
  const refreshEvents = () => {
    if (typeof window !== 'undefined') {
      try {
        const storedEvents = localStorage.getItem('slotjack_events');
        if (storedEvents) {
          const parsedEvents = JSON.parse(storedEvents).map((event: any) => ({
            ...event,
            date: new Date(event.date),
            endDate: event.endDate ? new Date(event.endDate) : undefined
          }));
          setEvents(parsedEvents);
        }
      } catch (error) {
        console.error('Error loading events during refresh:', error);
      }
    }
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
            <h1 className="text-3xl font-bold text-white">Bilet Yönetimi</h1>
            <p className="text-gray-400">Biletleri ekle, düzenle veya sil</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Bilet ara..."
                className="bg-gray-700 text-white px-4 py-2 pl-10 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={handleAddTicket}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" /> Yeni Bilet
            </button>
            <button
              onClick={refreshEvents}
              className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-md"
              title="Etkinlik listesini yenile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Tickets Table */}
        {filteredTickets.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Bilet</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Etkinlik</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-medium">Fiyat</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-medium">Stok</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-medium">Satış Sonu</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-750">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">{ticket.name}</div>
                          <div className="text-sm text-gray-400 line-clamp-1">{ticket.description}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <LinkIcon className="w-4 h-4 mr-1.5 text-blue-400" />
                          <Link href={`/admin/etkinlikler`} className="text-blue-400 hover:text-blue-300">
                            {ticket.event}
                          </Link>
                          {!isEventTicketable(ticket.eventId) && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-800 text-amber-200 rounded">
                              Satış Kapalı
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Etkinlik Tarihi: {formatEventDate(getEventById(ticket.eventId))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-white font-medium">
                          {ticket.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="text-white">
                            {ticket.available - ticket.sold} / {ticket.available}
                          </div>
                          <div className="w-24 h-2 bg-gray-700 rounded-full mt-1">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${((ticket.available - ticket.sold) / ticket.available) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-gray-300">
                          {formatDate(ticket.saleEnds)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={ticket.eventId ? `/admin/etkinlikler` : '#'}
                            className={`p-1.5 rounded text-white ${ticket.eventId ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-700 cursor-not-allowed'}`}
                            title={ticket.eventId ? "Etkinliği Görüntüle" : "Etkinlik bulunamadı"}
                            onClick={(e) => !ticket.eventId && e.preventDefault()}
                          >
                            <Calendar className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleEditTicket(ticket)}
                            className="p-1.5 bg-blue-500 rounded hover:bg-blue-600 text-white"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-1.5 bg-red-500 rounded hover:bg-red-600 text-white"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <TicketX className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-white font-medium mb-1">Henüz bilet bulunmuyor</p>
            <p className="text-gray-400 text-sm mb-4">Yeni bilet ekleyerek başlayabilirsiniz.</p>
            <button
              onClick={handleAddTicket}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" /> Yeni Bilet Ekle
            </button>
          </div>
        )}
        
        {/* Add/Edit Ticket Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl">
              <div className="p-4 bg-gray-700 flex justify-between items-center rounded-t-lg">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Ticket className="w-5 h-5 mr-2" />
                  {editingTicketId ? 'Bileti Düzenle' : 'Yeni Bilet Ekle'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded hover:bg-gray-600"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Bilet Adı</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={ticketFormData.name}
                      onChange={(e) => setTicketFormData({ ...ticketFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Fiyat (TL)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={ticketFormData.price}
                      onChange={(e) => setTicketFormData({ ...ticketFormData, price: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Etkinlik</label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={ticketFormData.eventId}
                      onChange={(e) => {
                        const selectedEventId = e.target.value;
                        // Find the selected event's title
                        const selectedEvent = events.find(event => event.id === selectedEventId);
                        const eventTitle = selectedEvent ? 
                          (typeof selectedEvent.title === 'string' ? selectedEvent.title : 'Etkinlik') : 
                          (selectedEventId === '1' ? 'Fortnite Turnuvası' : 
                          selectedEventId === '2' ? 'CS2 Workshop' : 
                          selectedEventId === '3' ? 'Battle Royale Şampiyonası' : '');
                        
                        setTicketFormData({ 
                          ...ticketFormData, 
                          eventId: selectedEventId,
                          event: eventTitle
                        });
                        
                        // Show warning if event doesn't allow ticket sales
                        if (selectedEvent && !selectedEvent.ticketsAvailable) {
                          setTimeout(() => {
                            alert('Uyarı: Seçtiğiniz etkinlik için bilet satışı kapalı. Etkinlik ayarlarından bilet satışını açabilirsiniz.');
                          }, 100);
                        }
                      }}
                      required
                    >
                      <option value="">Etkinlik Seçin</option>
                      {events.map(event => (
                        <option 
                          key={event.id} 
                          value={event.id}
                          className={!event.ticketsAvailable ? 'text-gray-500' : ''}
                        >
                          {getEventDisplayName(event)}
                          {!event.ticketsAvailable ? ' (Satış Kapalı)' : ''}
                        </option>
                      ))}
                      {/* Fallback options if no events are loaded */}
                      {events.length === 0 && (
                        <>
                          <option value="1">Fortnite Turnuvası</option>
                          <option value="2">CS2 Workshop</option>
                          <option value="3">Battle Royale Şampiyonası</option>
                        </>
                      )}
                    </select>
                    {ticketFormData.eventId && !isEventTicketable(ticketFormData.eventId) && (
                      <p className="text-amber-400 text-xs mt-1">
                        Bu etkinlik için bilet satışı kapalı. Etkinlik ayarlarından açabilirsiniz.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Stok Adedi</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={ticketFormData.available}
                      onChange={(e) => setTicketFormData({ ...ticketFormData, available: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Kişi Başı Max. Bilet</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={ticketFormData.maxPerPerson}
                      onChange={(e) => setTicketFormData({ ...ticketFormData, maxPerPerson: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Satış Sonu Tarihi</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={ticketFormData.saleEnds}
                      onChange={(e) => setTicketFormData({ ...ticketFormData, saleEnds: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-1">Açıklama</label>
                    <textarea
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      value={ticketFormData.description}
                      onChange={(e) => setTicketFormData({ ...ticketFormData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {editingTicketId ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Emergency Direct Navigation Links */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-sm text-gray-500 mb-2">Direkt Erişim Linkleri (Gezinme problemi yaşarsanız):</p>
          <div className="flex gap-4">
            <a href="/" className="text-sm text-gray-400 hover:text-blue-400">Ana Sayfa</a>
            <a href="/admin" className="text-sm text-gray-400 hover:text-blue-400">Admin Paneli</a>
            <a href="/admin/biletler" className="text-sm text-gray-400 hover:text-blue-400">Bilet Yönetimi</a>
            <a href="/admin/etkinlikler" className="text-sm text-gray-400 hover:text-blue-400">Etkinlik Yönetimi</a>
            <a href="/admin/users" className="text-sm text-gray-400 hover:text-blue-400">Kullanıcı Yönetimi</a>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 