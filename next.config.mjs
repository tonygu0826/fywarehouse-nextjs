const googleMapsDomains = 'https://maps.googleapis.com https://maps.gstatic.com';
const googleAnalyticsDomains = 'https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com';
const cloudflareInsightsDomains = 'https://static.cloudflareinsights.com';
const crispDomains = 'https://client.crisp.chat https://*.crisp.chat wss://client.relay.crisp.chat';
const imageDomains =
  "'self' data: blob: https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://user-assets.sxlcdn.com https://static-assets.sxlcdn.com https://unsplash.sxlcdn.com https://images.unsplash.com https://maps.googleapis.com https://maps.gstatic.com";

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${googleMapsDomains} ${googleAnalyticsDomains} ${cloudflareInsightsDomains} https://client.crisp.chat`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://client.crisp.chat",
      "font-src 'self' data: https://fonts.gstatic.com https://client.crisp.chat",
      `connect-src 'self' ${googleMapsDomains} ${googleAnalyticsDomains} ${cloudflareInsightsDomains} ${crispDomains}`,
      `img-src ${imageDomains} https://client.crisp.chat https://image.crisp.chat https://storage.crisp.chat`,
      "frame-src 'self' https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com https://game.crisp.chat",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  compress: true,
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: false,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
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
  async redirects() {
    return [
      {
        source: "/trackingTracking",
        destination: "/tracking",
        permanent: true,
      },
      {
        source: "/Home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/zh",
        destination: "/",
        permanent: true,
      },
      {
        source: "/zh/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
