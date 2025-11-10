/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // server actions config goes here (object), not a boolean
      bodySizeLimit: '2mb',
      allowedOrigins: ['http://localhost:3000'],
      csrf: true, 
    },
  },
  images: {
    domains: ['www.datocms-assets.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
};

module.exports = nextConfig;