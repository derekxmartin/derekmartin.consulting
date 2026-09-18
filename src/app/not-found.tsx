import Link from 'next/link';
import { Arrow } from '@/components/Arrow';
import { notFoundMetadata } from '@/lib/metadata';
export const metadata = notFoundMetadata;
export default function NotFound() {
  return <div className="container"><div className="compact-page"><span className="eyebrow">404 / Page not found</span><h1>A connection<br />that isn’t here.</h1><p>This page may have moved, or the work you’re looking for hasn’t been published.</p><div className="actions"><Link className="button" href="/">Back to home <Arrow /></Link><Link className="text-link" href="/services">Explore services <Arrow /></Link><Link href="/contact">Request a project</Link></div></div></div>;
}
