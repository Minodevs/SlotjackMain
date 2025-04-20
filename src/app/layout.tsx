import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteSettingsProvider } from '@/components/SiteSettingsProvider';
import { Toaster } from 'react-hot-toast';
import '../services/SponsorsService';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SLOTJACK - Gaming Destination',
  description: 'SLOTJACK - Your Ultimate Gaming Destination',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SiteSettingsProvider>
            {children}
            <Toaster position="bottom-right" />
          </SiteSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
