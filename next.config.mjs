/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

// Define default runtime caching
const runtimeCaching = [
  {
    urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-webfonts',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
      }
    }
  },
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'google-fonts-stylesheets',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
      }
    }
  },
  {
    urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-font-assets',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
      }
    }
  },
  {
    urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-image-assets',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }
    }
  },
  {
    urlPattern: /\/_next\/image\?url=.+$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'next-image',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }
    }
  },
  {
    urlPattern: /\.(?:mp3|wav|ogg)$/i,
    handler: 'CacheFirst',
    options: {
      rangeRequests: true,
      cacheName: 'static-audio-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }
    }
  },
  {
    urlPattern: /\.(?:js)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-js-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }
    }
  },
  {
    urlPattern: /\.(?:css|less)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-style-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }
    }
  },
  {
    urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'next-data',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }
    }
  },
  {
    urlPattern: /\/api\/.*$/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'apis',
      expiration: {
        maxEntries: 16,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      },
      networkTimeoutSeconds: 10 // fall back to cache if api does not response within 10 seconds
    }
  },
  {
    urlPattern: /.*/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'others',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      },
      networkTimeoutSeconds: 10
    }
  }
];

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/],
  publicExcludes: ['!icons/**/*'],
  // Custom handler for the service worker
  sw: 'sw.js',
  // Fallback pages
  fallbacks: {
    document: '/offline',
    image: '/icons/offline-image.png'
  }
})({
  // Additional Next.js configuration
  reactStrictMode: true,
  // Configure Turbopack (moved from experimental.turbo to root level as it's now stable)
  turbopack: {
    // Use same rules as webpack
    rules: {
      // Add any custom Turbopack-specific rules here if needed
    },
    // Resolve fallbacks to match webpack behavior
    resolveAlias: {
      // Add any aliases if needed
    }
  },
  // Optimize chunks
  webpack: (config, { isServer }) => {
    // Optimize chunk size
    config.optimization.chunkIds = 'deterministic';
    
    // Force chunks that might change frequently to be separate
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // vendor chunk
        vendor: {
          name: 'vendor',
          // sync + async chunks
          chunks: 'all',
          // import file path containing node_modules
          test: /node_modules/,
          priority: 20,
        },
        // common chunk
        common: {
          name: 'common',
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
        },
        // Use a more reliable chunk naming strategy for dynamically imported components
        components: {
          name: 'components',
          test: /[\\/]src[\\/]components[\\/]/,
          chunks: 'all',
          priority: 15,
          enforce: true,
          reuseExistingChunk: true
        }
      }
    };
    
    // Add this to fix dynamic imports
    config.output = {
      ...config.output,
      chunkLoadingGlobal: 'habitual_chunk_load' // Use a unique global variable name
    };
    
    return config;
  }
});

export default nextConfig;
