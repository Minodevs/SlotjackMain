/** @type {import('next').NextConfig} */

const isProduction = process.env.NODE_ENV === 'production';
const isNetlify = process.env.NETLIFY === 'true';
const isStaticExport = isNetlify || process.env.NEXT_EXPORT === 'true';

console.log(`Building for: ${isProduction ? 'Production' : 'Development'} | Netlify: ${isNetlify} | Export: ${isStaticExport}`);

const nextConfig = {
  // Set the output based on environment
  output: isStaticExport ? 'export' : undefined,
  
  // Disable automatic static optimization for better control
  trailingSlash: isStaticExport,
  
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
    // For static export, unoptimized is required
    unoptimized: isStaticExport,
  },
  
  // Specify page extensions to exclude unwanted routes
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
  
  // For static export, add custom rewrite handling in redirects rules
  async rewrites() {
    // Skip if static export (will be handled by netlify.toml and _redirects)
    if (isStaticExport) return [];
    
    return {
      beforeFiles: [
        {
          source: '/admin/users/[id]/:path*',
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
  
  // For static export, simplify webpack config
  webpack: (config, { isServer }) => {
    // For static export, exclude all server-only modules
    if (isStaticExport) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
      };
    }
    
    return config;
  },
  
  // Disable experimental features that might cause issues
  experimental: {
    // appDir is now the default in Next.js 14
    serverActions: !isStaticExport,
  },
};

module.exports = nextConfig; 