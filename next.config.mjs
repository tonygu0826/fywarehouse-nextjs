/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'user-assets.sxlcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'static-assets.sxlcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.sxlcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
