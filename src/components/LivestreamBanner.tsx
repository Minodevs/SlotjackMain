'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Pause, Youtube } from 'lucide-react';

interface LivestreamBannerProps {
  className?: string;
}

export default function LivestreamBanner({ className = '' }: LivestreamBannerProps) {
  const { livestream } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  if (!livestream.isLive || !livestream.url) {
    return null;
  }
  
  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const videoId = getYouTubeId(livestream.url);
  const youtubeUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : livestream.url;
  
  return (
    <Link 
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-black bg-opacity-75 border border-red-800 hover:bg-red-900/30 transition-colors ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container mx-auto px-2 md:px-4 py-2">
        <div className="flex items-center justify-center">
          <div className="flex items-center text-red-500">
            <Youtube className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            <Pause className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="font-medium text-sm md:text-base">Canlı Yayın</span>
            {(isHovered || isMobile) && 
              <span className="ml-1 md:ml-2 text-xs md:text-sm text-gray-300">
                {isMobile ? "Tıkla" : "İzlemek için tıklayın"}
              </span>
            }
          </div>
        </div>
      </div>
    </Link>
  );
} 