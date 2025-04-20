import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import '../app/globals.css';

// Set a version number to force refresh when needed
const APP_VERSION = '1.0.1';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Check if this is a new version and force reload if needed
    const lastVersion = localStorage.getItem('app-version');
    if (lastVersion !== APP_VERSION) {
      localStorage.setItem('app-version', APP_VERSION);
      // Only force reload if it's not the first visit
      if (lastVersion) {
        window.location.reload();
      }
    }
    
    // Clear any potential service worker cache
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
    
    // Clear browser cache for this site
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        // This helps with cache busting
        localStorage.setItem('last-reload', Date.now().toString());
      });
    }
  }, []);
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <Component {...pageProps} />
    </>
  );
} 