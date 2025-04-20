'use client';

import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export default function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="w-8 h-8 text-[#FF6B00]" />}
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      {description && <p className="text-gray-400">{description}</p>}
    </div>
  );
} 