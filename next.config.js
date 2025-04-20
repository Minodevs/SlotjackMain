/** @type {import('next').NextConfig} */

const isProduction = process.env.NODE_ENV === 'production';
const isNetlify = process.env.NETLIFY === 'true';

// For Netlify, we'll use a server-based deployment rather than static export
console.log(`Building for: ${isProduction ? 'Production' : 'Development'} | Netlify: ${isNetlify}`);

const nextConfig = {
  // Remove static export output - this enables server-side rendering
  
  // Image configuration
  images: {
    domains: ['source.unsplash.com', 'picsum.photos'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  
  // Specify page extensions to exclude unwanted routes
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
  
  // Handle rewrites for backward compatibility
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/admin/users/:userId/:path*',
          destination: '/admin/users/:userId/:path*',
        },
      ],
    };
  },
  
  // Configure headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Experimental features configuration
  experimental: {
    // Empty for now - using defaults
  },
};

module.exports = nextConfig; 