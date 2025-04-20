import React, { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GridCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  actionText?: string;
  actionLink?: string;
  actionOnClick?: () => void;
  icon?: ReactNode;
  primaryText?: string;
  secondaryText?: string;
  tags?: string[];
  backgroundColor?: string;
  borderColor?: string;
  extraContent?: ReactNode;
  className?: string;
}

export const GridCard: React.FC<GridCardProps> = ({
  title,
  subtitle,
  imageUrl,
  actionText,
  actionLink,
  actionOnClick,
  icon,
  primaryText,
  secondaryText,
  tags,
  backgroundColor = 'bg-gray-800',
  borderColor = 'border-gray-700',
  extraContent,
  className = '',
}) => {
  return (
    <div className={`${backgroundColor} border ${borderColor} rounded-lg overflow-hidden hover:border-[#FF6B00] transition-colors shadow-md ${className}`}>
      <div className="p-4 flex flex-col items-center justify-center h-full">
        {/* Card Icon or Image */}
        {imageUrl && (
          <div className="w-full h-24 relative mb-4 flex items-center justify-center">
            <Image 
              src={imageUrl} 
              alt={title} 
              width={150}
              height={80}
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}
        
        {icon && (
          <div className="mb-4 flex items-center justify-center">
            {icon}
          </div>
        )}
        
        {/* Title and Subtitle */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-gray-300">{subtitle}</p>}
        </div>
        
        {/* Primary and Secondary Text */}
        {(primaryText || secondaryText) && (
          <div className="text-center mb-4">
            {primaryText && <p className="text-[#FF6B00] font-bold text-xl">{primaryText}</p>}
            {secondaryText && <p className="text-gray-300 text-sm">{secondaryText}</p>}
          </div>
        )}
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {tags.map((tag, index) => (
              <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Extra Content */}
        {extraContent}
        
        {/* Action Button */}
        {(actionText && actionLink) ? (
          <Link
            href={actionLink}
            className="block w-full text-center bg-[#FF6B00] hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md transition-colors"
          >
            {actionText}
          </Link>
        ) : actionText && actionOnClick ? (
          <button
            onClick={actionOnClick}
            className="w-full bg-[#FF6B00] hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md transition-colors"
          >
            {actionText}
          </button>
        ) : null}
      </div>
    </div>
  );
};

// Grid Container Component
interface GridContainerProps {
  children: ReactNode;
  mobileColumns?: 1 | 2;
  tabletColumns?: 2 | 3;
  desktopColumns?: 3 | 4 | 5;
  gap?: string;
  className?: string;
}

export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  mobileColumns = 2,
  tabletColumns = 3,
  desktopColumns = 4,
  gap = 'gap-4',
  className,
}) => {
  // Define grid columns based on props
  const gridCols = {
    mobile: mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2',
    tablet: tabletColumns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3',
    desktop: {
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
      5: 'lg:grid-cols-5',
    }[desktopColumns],
  };

  return (
    <div className={cn('grid', gridCols.mobile, gridCols.tablet, gridCols.desktop, gap, className)}>
      {children}
    </div>
  );
};

export default GridCard; 