import type { NextConfig } from "next";

// Backend API proxy — routes /api/v1/* to the backend server
const BACKEND_BASE =
  process.env.BACKEND_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const BACKEND_HOST = BACKEND_BASE.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.risetogetherbd.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
  },

  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_HOST}/api/v1/:path*`,
      },
    ]
  },
};

export default nextConfig;
