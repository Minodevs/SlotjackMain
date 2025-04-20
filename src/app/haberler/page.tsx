'use client';

import { useState } from 'react';
import { Newspaper, Filter, Calendar, User, Eye } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Image from 'next/image';

// Mock data for news articles
const newsArticles = [
  {
    id: 1,
    title: 'SLOTJACK Yeni Sezon Turnuvaları Başlıyor',
    image: 'https://picsum.photos/id/1060/800/400',
    category: 'turnuva',
    date: '15 Nisan 2025',
    author: 'Ahmet Yılmaz',
    views: 1250,
    summary: 'Yeni sezon turnuvalarımız başlıyor! Büyük ödüller ve heyecan dolu anlar sizleri bekliyor.',
  },
  {
    id: 2,
    title: 'SLOTJACK Premium Üyelik Avantajları',
    image: 'https://picsum.photos/id/1061/800/400',
    category: 'duyuru',
    date: '12 Nisan 2025',
    author: 'Mehmet Demir',
    views: 980,
    summary: 'Premium üyelik avantajlarını keşfedin. Özel turnuvalar, bonuslar ve daha fazlası!',
  },
  {
    id: 3,
    title: 'En İyi Slot Oyunları Stratejileri',
    image: 'https://picsum.photos/id/1062/800/400',
    category: 'rehber',
    date: '10 Nisan 2025',
    author: 'Ayşe Kaya',
    views: 2150,
    summary: 'Profesyonel oyunculardan öğrenilen en iyi slot oyunları stratejileri ve ipuçları.',
  },
  {
    id: 4,
    title: 'SLOTJACK Yaz Festivali Detayları',
    image: 'https://picsum.photos/id/1063/800/400',
    category: 'etkinlik',
    date: '8 Nisan 2025',
    author: 'Fatma Şahin',
    views: 1750,
    summary: 'Bu yaz düzenlenecek SLOTJACK Festivali\'nin tüm detayları ve katılım bilgileri.',
  },
  {
    id: 5,
    title: 'Yeni Oyunlar Platformumuza Eklendi',
    image: 'https://picsum.photos/id/1064/800/400',
    category: 'duyuru',
    date: '5 Nisan 2025',
    author: 'Ali Öztürk',
    views: 890,
    summary: 'Platformumuza eklenen yeni oyunlar ve özellikler hakkında bilgi alın.',
  },
  {
    id: 6,
    title: 'Poker Turnuvası Kazananları',
    image: 'https://picsum.photos/id/1065/800/400',
    category: 'turnuva',
    date: '3 Nisan 2025',
    author: 'Zeynep Çelik',
    views: 1450,
    summary: 'Son poker turnuvamızın kazananları ve ödül töreni detayları.',
  },
];

// Filter options
const filterOptions = [
  { id: 'all', name: 'Tümü' },
  { id: 'turnuva', name: 'Turnuvalar' },
  { id: 'duyuru', name: 'Duyurular' },
  { id: 'rehber', name: 'Rehberler' },
  { id: 'etkinlik', name: 'Etkinlikler' },
];

export default function NewsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter articles based on selected category
  const filteredArticles = newsArticles.filter(
    (article) => selectedFilter === 'all' || article.category === selectedFilter
  );

  return (
    <div className="max-w-[1440px] mx-auto">
      <PageHeader 
        title="Haberler" 
        description="SLOTJACK'ten en son haberler ve güncellemeler" 
        icon={Newspaper} 
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

      {/* News articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((article) => (
          <div 
            key={article.id} 
            className="bg-[#1E1E1E] rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF6B00] text-white">
                  {filterOptions.find(opt => opt.id === article.category)?.name}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{article.title}</h3>
              <p className="text-gray-400 mb-4">{article.summary}</p>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{article.views} görüntülenme</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 