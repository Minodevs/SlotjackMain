/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const isNetlify = process.env.NETLIFY === 'true';
const shouldExport = process.env.NEXT_EXPORT === 'true';

console.log(`Building for: ${isProd ? 'Production' : 'Development'} | Netlify: ${isNetlify} | Export: ${shouldExport}`);

const nextConfig = {
  output: isNetlify ? 'export' : (isProd ? 'standalone' : undefined),
  distDir: isNetlify ? 'out' : '.next',
  reactStrictMode: true,
  swcMinify: true, // Use SWC minification for better performance
  
  // Force fully static exports for Netlify
  trailingSlash: true, // Add trailing slashes for better compatibility with Netlify
  
  // Prevent partial static generation - force all or nothing
  staticPageGenerationTimeout: 180, // 3 minutes timeout for static generation
  
  images: {
    domains: ['localhost', 'dulcet-tanuki-9e2ad9.netlify.app', 'livesitemiz.netlify.app'],
    // For Netlify with export output, we need unoptimized images
    unoptimized: isNetlify || !isProd,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Explicitly specify page extensions to exclude unwanted routes
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
  
  // Disable the X-Powered-By header
  poweredByHeader: false,
  
  // Enable compression for better performance
  compress: true,
  
  // Set security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Only enable these optimizations in production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        realContentHash: true, // Add content hash based on file contents
        flagIncludedChunks: true,
      };
      
      // Force all pages to be included in the build
      if (isServer) {
        console.log('Configuring server-side build to include all pages');
        config.optimization.splitChunks = {
          cacheGroups: {
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
          },
        };
      }
    }
    
    // Log the compile progress to debug build process
    if (process.env.DEBUG_BUILD === 'true') {
      const { ProgressPlugin } = require('webpack');
      config.plugins.push(
        new ProgressPlugin({
          handler(percentage, message) {
            console.log(`${(percentage * 100).toFixed(2)}% ${message}`);
          },
        })
      );
    }
    
    return config;
  },
  
  experimental: {
    // Enable features to improve build process
    optimizeCss: false, // Disable CSS optimization to avoid critters dependency issues
    optimizePackageImports: isProd ? ['lucide-react', 'date-fns', 'framer-motion'] : [],
    turbotrace: isProd ? {
      logLevel: 'error',
    } : undefined,
  },
};

module.exports = nextConfig; 