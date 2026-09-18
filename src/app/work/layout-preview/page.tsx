import { notFound } from 'next/navigation';
import { CaseStudy } from '@/components/work/CaseStudy';
import { notFoundMetadata, pageMetadata } from '@/lib/metadata';
export function generateMetadata() {
  return process.env.NODE_ENV === 'development'
    ? pageMetadata('Case Layout Preview', 'Development-only layout fixture.', '/work/layout-preview', true)
    : notFoundMetadata;
}
export default async function LayoutPreview() {
  if (process.env.NODE_ENV !== 'development') notFound();
  const { workFixture } = await import('@/content/work-fixture');
  return <CaseStudy entry={workFixture} fixture />;
}
