import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    const preview = process.env.SITE_ENV !== 'production' || (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production');
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Frame-Options', value: 'DENY' },
      ...(preview ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
    ] }];
  },
};
export default nextConfig;
