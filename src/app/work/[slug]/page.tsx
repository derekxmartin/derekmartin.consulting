import { notFound } from 'next/navigation';
import { getCase, publishedCases } from '@/content/work';
import { CaseStudy } from '@/components/work/CaseStudy';
import { notFoundMetadata, pageMetadata } from '@/lib/metadata';
export const dynamicParams = false;
export async function generateStaticParams() { return publishedCases().map(c => ({ slug: c.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const entry = getCase((await params).slug);
  return entry ? pageMetadata(entry.title, entry.summary, `/work/${entry.slug}`) : notFoundMetadata;
}
export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = getCase((await params).slug);
  if (!entry) notFound();
  return <CaseStudy entry={entry} />;
}
