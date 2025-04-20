'use client';

import { useState, useEffect } from 'react';
import { Ticket, Calendar, Clock, CheckCircle, XCircle, Archive } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';

// Define user ticket interface
interface UserTicket {
  id: string;
  event: string;
  date: string;
  time: string;
  status: 'active' | 'used' | 'cancelled';
  seatNumber: string;
  purchaseDate: string;
  price: number;
  originalTicket?: any;
}

// Define admin ticket interface
interface AdminTicket {
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

// Default tickets data if nothing is in localStorage
const defaultTicketsData: UserTicket[] = [
  {
    id: '1001',
    event: 'Büyük Yaz Turnuvası',
    date: '15 Temmuz 2024',
    time: '19:00',
    status: 'active',
    seatNumber: 'VIP-101',
    purchaseDate: '5 Temmuz 2024',
    price: 50,
  },
  {
    id: '1002',
    event: 'Canlı Casino Turnuvası',
    date: '5 Ağustos 2024',
    time: '19:30',
    status: 'active',
    seatNumber: 'STD-205',
    purchaseDate: '10 Temmuz 2024',
    price: 30,
  },
  {
    id: '1003',
    event: 'Poker Turnuvası',
    date: '20 Haziran 2024',
    time: '20:00',
    status: 'used',
    seatNumber: 'VIP-054',
    purchaseDate: '1 Haziran 2024',
    price: 45,
  },
  {
    id: '1004',
    event: 'Slot Oyunları Festivali',
    date: '10 Haziran 2024',
    time: '18:00',
    status: 'cancelled',
    seatNumber: 'STD-128',
    purchaseDate: '15 Mayıs 2024',
    price: 25,
  },
  {
    id: '1005',
    event: 'Blackjack Şampiyonası',
    date: '12 Temmuz 2024',
    time: '21:00',
    status: 'used',
    seatNumber: 'VIP-076',
    purchaseDate: '25 Haziran 2024',
    price: 40,
  },
];

// Function to convert admin tickets to user tickets format
const convertAdminTicketsToUserFormat = (adminTickets: AdminTicket[]): UserTicket[] => {
  if (!adminTickets || !Array.isArray(adminTickets)) return defaultTicketsData;
  
  return adminTickets.map(ticket => {
    const date = new Date(ticket.saleEnds);
    
    return {
      id: ticket.id,
      event: ticket.event,
      date: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'active', // All available tickets are active for users
      seatNumber: `${ticket.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`,
      purchaseDate: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      price: ticket.price,
      // Original data for reference
      originalTicket: ticket
    };
  });
};

type TicketStatus = 'all' | 'active' | 'used' | 'cancelled';

export default function TicketsPage() {
  const [filter, setFilter] = useState<TicketStatus>('all');
  const [ticketsData, setTicketsData] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load tickets from localStorage on initial load
  useEffect(() => {
    const loadTickets = () => {
      if (typeof window !== 'undefined') {
        try {
          const storedTickets = localStorage.getItem('tickets');
          if (storedTickets) {
            const parsedTickets = JSON.parse(storedTickets) as AdminTicket[];
            const userFormattedTickets = convertAdminTicketsToUserFormat(parsedTickets);
            setTicketsData(userFormattedTickets);
          } else {
            setTicketsData(defaultTicketsData);
          }
        } catch (error) {
          console.error('Error loading tickets:', error);
          setTicketsData(defaultTicketsData);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadTickets();
    
    // Listen for storage events to update tickets in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tickets') {
        loadTickets();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Filter tickets based on status
  const filteredTickets = ticketsData.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });
  
  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          text: 'Aktif', 
          color: 'text-green-400',
          bgColor: 'bg-green-900/20 border-green-800/30',
          icon: <CheckCircle className="w-4 h-4 text-green-400 mr-1.5" />
        };
      case 'used':
        return { 
          text: 'Kullanıldı', 
          color: 'text-blue-400',
          bgColor: 'bg-blue-900/20 border-blue-800/30',
          icon: <Archive className="w-4 h-4 text-blue-400 mr-1.5" />
        };
      case 'cancelled':
        return { 
          text: 'İptal Edildi', 
          color: 'text-red-400',
          bgColor: 'bg-red-900/20 border-red-800/30',
          icon: <XCircle className="w-4 h-4 text-red-400 mr-1.5" />
        };
      default:
        return { 
          text: 'Bilinmiyor', 
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/20 border-gray-800/30',
          icon: <Clock className="w-4 h-4 text-gray-400 mr-1.5" />
        };
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Ticket className="w-8 h-8 text-[#FF6B00] mr-2" />
            Biletlerim
          </h1>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="bg-[#332200] border border-[#664400] rounded-lg p-6 text-center mb-6">
            <div className="flex items-center justify-center">
              <Ticket className="w-6 h-6 text-[#FF6B00] mr-2" />
              <h3 className="text-lg font-medium text-[#FF6B00]">Henüz Aktif Bir Bilet Etkinliği Bulunmuyor.</h3>
            </div>
            <p className="text-gray-400 mt-2">Çok yakında yeni bir bilet etkinliği başladığında sizleri bilgilendireceğiz!</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-[#FF6B00] text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'active'
                    ? 'bg-[#FF6B00] text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setFilter('used')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'used'
                    ? 'bg-[#FF6B00] text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Kullanıldı
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'cancelled'
                    ? 'bg-[#FF6B00] text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                İptal Edildi
              </button>
            </div>
            
            {/* Tickets list */}
            <div className="space-y-4">
              {filteredTickets.map(ticket => {
                const statusDisplay = getStatusDisplay(ticket.status);
                
                return (
                  <div 
                    key={ticket.id} 
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="p-6 relative">
                      {/* Ticket tear edge effect on the left */}
                      <div className="absolute top-0 bottom-0 left-0 w-4 flex flex-col justify-between">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className="h-2 w-2 rounded-full bg-gray-900"></div>
                        ))}
                      </div>
                      
                      <div className="pl-6">
                        {/* Status badge */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${statusDisplay.bgColor} ${statusDisplay.color} border mb-4`}>
                          {statusDisplay.icon}
                          {statusDisplay.text}
                        </div>
                        
                        <div className="flex flex-wrap md:flex-nowrap justify-between gap-6">
                          {/* Left side - Event details */}
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{ticket.event}</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-gray-300">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-[#FF6B00] mr-2" />
                                <span>{ticket.date}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 text-[#FF6B00] mr-2" />
                                <span>{ticket.time}</span>
                              </div>
                              <div className="col-span-2 mt-2">
                                <span className="text-gray-400">Satın Alma Tarihi:</span> {ticket.purchaseDate}
                              </div>
                            </div>
                          </div>
                          
                          {/* Right side - Ticket details */}
                          <div className="border-l border-gray-700 pl-6 flex flex-col items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl font-bold mb-1 font-mono">{ticket.seatNumber}</div>
                              <div className="text-sm text-gray-400">Koltuk Numarası</div>
                              <div className="text-[#FF6B00] font-semibold mt-2">{ticket.price} JackPoints</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="mt-6 flex justify-end space-x-3">
                          {ticket.status === 'active' && (
                            <>
                              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                                İptal Et
                              </button>
                              <button className="px-4 py-2 bg-[#FF6B00] hover:bg-[#FF8533] text-white rounded-lg transition-colors">
                                QR Kodu Göster
                              </button>
                            </>
                          )}
                          {ticket.status === 'used' && (
                            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                              Detayları Görüntüle
                            </button>
                          )}
                          {ticket.status === 'cancelled' && (
                            <button className="px-4 py-2 bg-[#FF6B00] hover:bg-[#FF8533] text-white rounded-lg transition-colors">
                              Yeniden Satın Al
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </ClientLayout>
  );
} 