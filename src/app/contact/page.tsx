import { InquiryForm } from '@/components/forms/InquiryForm';
import { site } from '@/content/site';
import { normalizeService } from '@/content/services';
import { isMockDelivery, formspreeId } from '@/lib/inquiries/config';
import { pageMetadata } from '@/lib/metadata';
import styles from '@/components/forms/form.module.css';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('Contact', 'Tell Derek Martin about your ad tags, Floodlight, analytics or tracking implementation project.', '/contact');
export default async function Contact({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const formId = formspreeId();
  const service = normalizeService((await searchParams).service);
  return <div className={`container ${styles.contact}`}><div className={styles.intro}><span className="eyebrow">Let’s scope it out</span><h1>What needs<br />implementing?</h1><p>Tell me what needs implementing, which platforms are involved and when you need it. I’ll review the scope and follow up.</p><p className={styles.aside}>A specific brief is welcome. So is “something’s not tracking correctly.” We can start by working out what’s needed.</p>{site.publicEmail && <p><a href={`mailto:${site.publicEmail}`}>{site.publicEmail}</a></p>}{site.responseWindowText && <p>{site.responseWindowText}</p>}{site.availabilityText && <p>{site.availabilityText}</p>}</div><InquiryForm key={service} service={service} mock={!formId && isMockDelivery()} publicEmail={site.publicEmail} formspreeId={formId} /></div>;
}
