'use client';

import { useState } from 'react';
import { Video, Filter, Calendar, Users, Clock, Play, Eye } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Image from 'next/image';

// Mock data for online events
const onlineEvents = [
  {
    id: 1,
    title: 'Canlı Poker Turnuvası',
    image: 'https://picsum.photos/id/1090/800/400',
    category: 'turnuva',
    date: '15 Nisan 2025',
    time: '20:00',
    duration: '3 saat',
    viewers: 1250,
    host: 'Ahmet Yılmaz',
    description: 'Canlı poker turnuvası ve profesyonel oyuncu analizi.',
    isLive: true,
  },
  {
    id: 2,
    title: 'Slot Oyunları Stratejileri',
    image: 'https://picsum.photos/id/1091/800/400',
    category: 'workshop',
    date: '12 Nisan 2025',
    time: '19:00',
    duration: '1 saat',
    viewers: 980,
    host: 'Mehmet Demir',
    description: 'Slot oyunları için profesyonel stratejiler ve ipuçları.',
    isLive: false,
  },
  {
    id: 3,
    title: 'Blackjack Ustalık Dersi',
    image: 'https://picsum.photos/id/1092/800/400',
    category: 'eğitim',
    date: '10 Nisan 2025',
    time: '18:00',
    duration: '2 saat',
    viewers: 2150,
    host: 'Ayşe Kaya',
    description: 'Blackjack oyununda ustalaşmak için temel teknikler.',
    isLive: false,
  },
  {
    id: 4,
    title: 'Roulette Şampiyonası',
    image: 'https://picsum.photos/id/1093/800/400',
    category: 'turnuva',
    date: '8 Nisan 2025',
    time: '21:00',
    duration: '4 saat',
    viewers: 1750,
    host: 'Fatma Şahin',
    description: 'Canlı roulette turnuvası ve ödül töreni.',
    isLive: true,
  },
  {
    id: 5,
    title: 'Yeni Oyun Tanıtımı',
    image: 'https://picsum.photos/id/1094/800/400',
    category: 'tanıtım',
    date: '5 Nisan 2025',
    time: '17:00',
    duration: '1 saat',
    viewers: 890,
    host: 'Ali Öztürk',
    description: 'Platforma eklenen yeni oyunların tanıtımı ve demo.',
    isLive: false,
  },
  {
    id: 6,
    title: 'Baccarat Turnuvası',
    image: 'https://picsum.photos/id/1095/800/400',
    category: 'turnuva',
    date: '3 Nisan 2025',
    time: '20:00',
    duration: '3 saat',
    viewers: 1450,
    host: 'Zeynep Çelik',
    description: 'Canlı baccarat turnuvası ve özel ödüller.',
    isLive: true,
  },
];

// Filter options
const filterOptions = [
  { id: 'all', name: 'Tümü' },
  { id: 'turnuva', name: 'Turnuvalar' },
  { id: 'workshop', name: 'Workshoplar' },
  { id: 'eğitim', name: 'Eğitimler' },
  { id: 'tanıtım', name: 'Tanıtımlar' },
];

export default function OnlineEventsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter events based on selected category
  const filteredEvents = onlineEvents.filter(
    (event) => selectedFilter === 'all' || event.category === selectedFilter
  );

  return (
    <div className="max-w-[1440px] mx-auto">
      <PageHeader 
        title="Çevrim Etkinlikleri" 
        description="Canlı yayınlar ve online etkinlikler" 
        icon={Video} 
      />

      {/* Filter options */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-gray-400" />
          <h2 className="text-lg font-semibold">Filtrele</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedFilter(option.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedFilter === option.id
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#2A2A2A]'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Online events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div 
            key={event.id} 
            className="bg-[#1E1E1E] rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF6B00] text-white">
                  {filterOptions.find(opt => opt.id === event.category)?.name}
                </span>
              </div>
              {event.isLive && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    Canlı
                  </span>
                </div>
              )}
              <button className="absolute bottom-4 right-4 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-opacity">
                <Play className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-gray-400 mb-4">{event.description}</p>
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-400">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{event.time} ({event.duration})</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{event.host}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Eye className="w-5 h-5 mr-2" />
                  <span>{event.viewers} izleyici</span>
                </div>
              </div>
              <button 
                className={`w-full py-2 rounded-lg transition-colors ${
                  event.isLive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-[#FF6B00] hover:bg-[#FF8533] text-white'
                }`}
              >
                {event.isLive ? 'Canlı İzle' : 'Kayıt Ol'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 