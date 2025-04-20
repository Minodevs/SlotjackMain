/**
 * URL utility functions for safely constructing and handling URLs
 */

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  // Use environment variable if available (set in .env files and Netlify)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Last resort fallback (should not happen in production)
  return 'https://livesitemiz.netlify.app';
}

/**
 * Safely construct an absolute URL from a path
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Create a URL object safely
 */
export function createUrl(path: string): URL {
  try {
    // If it's already a valid URL, use it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return new URL(path);
    }
    
    // Otherwise construct a proper URL with base
    return new URL(getAbsoluteUrl(path));
  } catch (error) {
    console.error('Error creating URL:', error);
    // Fallback to a safe default URL
    return new URL(getBaseUrl());
  }
} 