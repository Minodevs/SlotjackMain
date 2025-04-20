import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GridCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GridCard({ children, className, onClick }: GridCardProps) {
  return (
    <div 
      className={cn(
        "w-[48%] flex flex-col bg-gray-800 border border-gray-700 rounded-lg overflow-hidden",
        "hover:border-[#FF6B00] transition-colors shadow-md",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function GridCardContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("p-3 flex flex-col items-center justify-center flex-grow", className)}>
      {children}
    </div>
  );
}

export function GridCardImage({ 
  src, 
  alt, 
  className 
}: { 
  src: string; 
  alt: string; 
  className?: string 
}) {
  return (
    <div className={cn("relative w-full h-24 flex items-center justify-center", className)}>
      <img 
        src={src} 
        alt={alt} 
        className="object-contain h-full max-w-full p-2" 
      />
    </div>
  );
}

export function GridCardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-sm font-medium text-white text-center line-clamp-2", className)}>
      {children}
    </h3>
  );
}

export function GridCardDescription({ 
  children, 
  className, 
  title 
}: { 
  children: ReactNode; 
  className?: string; 
  title?: string 
}) {
  return (
    <p className={cn("text-xs text-gray-300 text-center line-clamp-2 mt-1", className)} title={title}>
      {children}
    </p>
  );
}

export function GridCardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("p-2 border-t border-gray-700 w-full", className)}>
      {children}
    </div>
  );
}

export function GridCardContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", className)}>
      {children}
    </div>
  );
} 