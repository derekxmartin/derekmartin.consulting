import type { MetadataRoute } from 'next';
import { origin, isPublicProduction } from '@/lib/metadata';
import { publishedCases } from '@/content/work';
import { site } from '@/content/site';
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicProduction) return [];
  return ['/', '/services', '/work', '/how-it-works', '/about', '/contact', ...(site.privacyContentApproved ? ['/privacy'] : []), ...publishedCases().map(c => `/work/${c.slug}`)].map(path => ({ url: new URL(path, origin()).href }));
}
