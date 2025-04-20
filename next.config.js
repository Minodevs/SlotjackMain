/** @type {import('next').NextConfig} */

const isProduction = process.env.NODE_ENV === 'production';
const isNetlify = process.env.NETLIFY === 'true';
const isStaticExport = isNetlify || process.env.NEXT_EXPORT === 'true';
const { apiExcludes } = require('./excludes');

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
  
  // Completely exclude API routes for static export
  webpack: (config, { dev, isServer }) => {
    // For static export, exclude all server-only modules and API routes
    if (isStaticExport) {
      // Add fallbacks for Node.js modules
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
      
      // Skip compiling API routes completely
      if (isServer) {
        console.log('⚠️ Excluding API routes from static export build');
        
        const originalEntry = config.entry;
        config.entry = async () => {
          const entries = await originalEntry();
          
          // Filter out API route entries
          Object.keys(entries).forEach((key) => {
            if (apiExcludes.some(pattern => {
              // Convert glob pattern to regex
              const regexPattern = pattern
                .replace(/\*\*/g, '.*')
                .replace(/\*/g, '[^/]*');
              const regex = new RegExp(regexPattern);
              return regex.test(key);
            })) {
              console.log(`🚫 Excluding API route: ${key}`);
              delete entries[key];
            }
          });
          
          return entries;
        };
      }
    }
    
    return config;
  },
  
  // Exclude API directories from the build
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
  
  // Disable experimental features that might cause issues
  experimental: {
    // appDir is now the default in Next.js 14
    serverActions: !isStaticExport,
  },
};

module.exports = nextConfig; 