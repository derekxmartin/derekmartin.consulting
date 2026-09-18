import type { Metadata } from 'next';
import { site } from '@/content/site';
export const isPublicProduction = process.env.SITE_ENV === 'production' && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production');
export function origin() { return process.env.SITE_URL || site.canonicalOrigin; }
export const titleBrand = `${site.displayName}, Ad Ops & Tracking`;
export function pageTitle(name: string) { return `${name} | ${titleBrand}`; }
export const notFoundMetadata: Metadata = {
  title: { absolute: pageTitle('Page Not Found') },
  robots: { index: false, follow: false },
};
export function pageMetadata(title: string, description: string, path: string, noindex = false): Metadata {
  const fullTitle = pageTitle(title);
  return { title: { absolute: fullTitle }, description, alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, siteName: site.displayName, type: 'website' },
    robots: { index: isPublicProduction && !noindex, follow: isPublicProduction && !noindex },
  };
}
