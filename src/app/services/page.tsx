import Link from 'next/link';
import { services, faqs } from '@/content/services';
import { pageMetadata } from '@/lib/metadata';
import { Arrow } from '@/components/Arrow';
import { Closing } from '@/components/Closing';
import styles from '@/components/pages.module.css';
export const metadata = pageMetadata('Services', 'Ad tags and pixels, Floodlight, GA4 and GTM, server-side conversions, and tracking audits. Defined implementation projects with verification and handoff.', '/services');
export default function Services() {
  return <div className="container"><div className={styles.servicesIntro}><div><span className="eyebrow">Services</span><h1>From specification<br />to implementation.</h1><p>Bring the technical request. We’ll agree on the scope, put the tracking in place, and verify it before handoff.</p></div><ul className={styles.jumpList}>{services.map(s => <li key={s.id}><a href={`#${s.id}`}>{s.title}<Arrow direction="down" /></a></li>)}</ul></div>
    {services.map((service, index) => <section className={styles.serviceDetail} id={service.id} key={service.id}><div className={styles.serviceTitle}><span className="eyebrow">0{index + 1}</span><h2>{service.title}</h2></div><div className={styles.serviceBody}><p>{service.scope}</p><div className={styles.serviceColumns}><div><h3>Typical requests</h3><ul>{service.examples.map(text => <li key={text}>{text}</li>)}</ul></div><div><h3>What you receive</h3><ul>{service.deliverables.map(text => <li key={text}>{text}</li>)}</ul></div></div>
      {service.subsection && <div className={styles.subsection}><h3>{service.subsection.title}</h3><p>{service.subsection.text}</p></div>}
      {service.platformExamples.some(p => p.confirmed) && <p className={styles.serviceNote}>Platforms: {service.platformExamples.filter(p => p.confirmed).map(p => p.name).join(', ')}</p>}
      <div className={styles.scopeStrip}><strong>To scope the work</strong>{service.inputs}</div>{service.note && <p className={styles.serviceNote}>{service.note}</p>}<Link className="text-link" href={`/contact?service=${service.id}`}>Discuss this implementation <Arrow /></Link>
    </div></section>)}
    <section className={`section ${styles.why}`}><h2>The details are part of the scope.</h2><div><p>Consent configuration follows your approved requirements, with tag behavior tested accordingly. Verification integrations and any necessary API or script work are agreed within the relevant implementation.</p><p className="muted">Projects cover technical implementation and handoff. Media buying, campaign optimization, daily ad operations and open-ended support are outside the standard offer.</p></div></section>
    <section className={`section ${styles.faqs}`}><h2>A few practical questions.</h2><div>{faqs.map(([question, answer]) => <div className={styles.faqItem} key={question}><h3>{question}</h3><p>{answer}</p></div>)}</div></section><Closing /></div>;
}
