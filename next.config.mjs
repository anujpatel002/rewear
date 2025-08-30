/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // Reduce bundle size
  swcMinify: true,
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Compress responses
  compress: true,
};

export default nextConfig;
