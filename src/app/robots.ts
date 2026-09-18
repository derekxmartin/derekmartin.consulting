import type { MetadataRoute } from 'next';
import { isPublicProduction, origin } from '@/lib/metadata';
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', ...(isPublicProduction ? { allow: '/', disallow: ['/contact/thanks', '/getting-started', '/work/layout-preview', '/api/'] } : { disallow: '/' }) }, ...(isPublicProduction ? { sitemap: new URL('/sitemap.xml', origin()).href } : {}) };
}
