'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="container"><div className="compact-page"><h1>Something didn’t load.</h1><p>Please try again. If the problem continues, you can return home and start from there.</p><div className="actions"><button className="button" onClick={reset}>Try again</button><Link href="/">Back to home</Link></div></div></div>;
}
