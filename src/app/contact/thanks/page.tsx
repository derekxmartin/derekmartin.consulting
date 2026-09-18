import Link from 'next/link';
import { cookies } from 'next/headers';
import { receiptCookie, verifyReceipt } from '@/lib/inquiries/receipt';
import { pageMetadata } from '@/lib/metadata';
import { Arrow } from '@/components/Arrow';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('Inquiry Confirmation', 'Project request confirmation.', '/contact/thanks', true);
export default async function Thanks() {
  const receipt = verifyReceipt((await cookies()).get(receiptCookie)?.value);
  return <div className="container"><div className="compact-page"><span className="eyebrow">{receipt?.mock ? 'Local test confirmation' : 'Project request'}</span><h1>{receipt ? receipt.mock ? 'Test request received.' : 'Thanks for the details.' : 'Let’s start with your project.'}</h1><p>{receipt ? receipt.mock ? 'The local test completed successfully. No email was sent. In live mode, an accepted request starts a scoping conversation.' : 'Your project request has been accepted for delivery. I’ll review the details and follow up about the scope and next steps.' : 'There’s no confirmed request to display. Head to the project form to tell me what needs implementing.'}</p>{receipt && <p className="muted">Request reference: <code>{receipt.reference}</code></p>}<div className="actions">{receipt ? <><Link className="button" href="/how-it-works">What happens next <Arrow /></Link><Link className="text-link" href="/work">View the work <Arrow /></Link></> : <Link className="button" href="/contact">Request a project <Arrow /></Link>}</div></div></div>;
}
