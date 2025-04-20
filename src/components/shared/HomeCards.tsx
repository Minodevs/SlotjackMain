import React from 'react';
import Link from 'next/link';
import { Clock, User, Gift, Video, Trophy, Calendar, ShoppingBag } from 'lucide-react';
import { GridCard, GridContainer } from './GridCard';

interface HomeCardsProps {
  onCodeClick?: () => void;
}

const HomeCards: React.FC<HomeCardsProps> = ({ onCodeClick }) => {
  return (
    <div className="py-4">
      <GridContainer mobileColumns={2} tabletColumns={3} desktopColumns={4} gap="gap-4">
        {/* Sponsors Card */}
        <GridCard
          title="Sponsorlar"
          subtitle="Sponsorluk fırsatlarını keşfedin"
          icon={<Gift className="w-12 h-12 text-[#FF6B00]" />}
          actionText="Sponsorları Gör"
          actionLink="/sponsorlar"
        />

        {/* Events Card */}
        <GridCard
          title="Etkinlikler"
          subtitle="Katılabileceğiniz etkinlikleri keşfedin"
          icon={<Calendar className="w-12 h-12 text-[#FF6B00]" />}
          actionText="Etkinlikleri Gör"
          actionLink="/etkinlikler"
        />

        {/* Market Card */}
        <GridCard
          title="Market"
          subtitle="Puanlarınızı harcayın"
          icon={<ShoppingBag className="w-12 h-12 text-[#FF6B00]" />}
          actionText="Markete Git"
          actionLink="/market"
        />

        {/* Live Stream Card */}
        <GridCard
          title="Canlı Yayın"
          subtitle="En güncel yayınları izleyin"
          icon={<Video className="w-12 h-12 text-[#FF6B00]" />}
          actionText="Yayına Git"
          actionLink="/canli-yayin"
        />

        {/* Spin Wheel Card */}
        <GridCard
          title="Çark Çevir"
          subtitle="Şansını dene, puanları kazan"
          icon={
            <div className="relative w-12 h-12 rounded-full border-4 border-[#FF6B00] border-t-transparent animate-spin-slow">
              <div className="absolute inset-0 flex items-center justify-center text-[#FF6B00] font-bold">
                ?
              </div>
            </div>
          }
          actionText="Çarkı Çevir"
          actionLink="/cark-cevir"
        />

        {/* Leaderboard Card */}
        <GridCard
          title="Liderlik Tablosu"
          subtitle="En iyi oyuncuları görün"
          icon={<Trophy className="w-12 h-12 text-[#FF6B00]" />}
          actionText="Tabloyu Gör"
          actionLink="/liderlik-tablosu"
        />

        {/* Daily Bonus Card */}
        <GridCard
          title="Günlük Bonus"
          subtitle="Her gün giriş yap bonus kazan"
          icon={<Clock className="w-12 h-12 text-[#FF6B00]" />}
          actionText="Bonus Al"
          actionOnClick={() => {
            // This would be handled by the parent component
            alert('Daily bonus claimed');
          }}
        />

        {/* Redeem Code Card */}
        <GridCard
          title="Kod Kullan"
          subtitle="Promosyon kodlarını kullan"
          icon={<Gift className="w-12 h-12 text-[#FF6B00]" />}
          actionText="Kod Gir"
          actionOnClick={onCodeClick}
        />
      </GridContainer>
    </div>
  );
};

export default HomeCards; 