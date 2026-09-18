import { WorkCards } from '@/components/work/WorkCards';
import { Closing } from '@/components/Closing';
import { pageMetadata } from '@/lib/metadata';
import Link from 'next/link';
export const metadata = pageMetadata('Work', 'Implementation work, technical walkthroughs and verification evidence from Derek Martin.', '/work');
export default function Work() {
  return <div className="container"><div className="page-intro"><span className="eyebrow">Work</span><h1>The work behind<br />the tracking.</h1><p>Implementation details, test scenarios and a clear account of what was delivered.</p></div><div className="page-body"><WorkCards />{process.env.NODE_ENV === 'development' && <div className="notice" style={{ marginTop: 32 }}>Development review only: <Link href="/work/layout-preview">view the case-study layout fixture</Link>. This example is unpublished and unavailable in production.</div>}</div><Closing /></div>;
}
