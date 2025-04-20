import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Loading fallback - simple centered spinner
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg">Yükleniyor...</p>
    </div>
  </div>
);

// Dynamically import ClientLayout with SSR disabled
const ClientLayoutComponent = dynamic(
  () => import('./ClientLayout'),
  { 
    ssr: false,
    loading: LoadingFallback 
  }
);

// Props type
interface ClientLayoutWrapperProps {
  children: ReactNode;
  showLivestream?: boolean;
}

/**
 * Server-compatible wrapper around the client-side ClientLayout
 * This prevents "useContext is null" errors during static export
 */
export default function ClientLayoutWrapper({ children, showLivestream = true }: ClientLayoutWrapperProps) {
  return (
    <ClientLayoutComponent showLivestream={showLivestream}>
      {children}
    </ClientLayoutComponent>
  );
} 