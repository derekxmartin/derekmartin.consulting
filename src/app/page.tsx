import Link from 'next/link';
import { Arrow } from '@/components/Arrow';
import { FlowDiagram } from '@/components/FlowDiagram';
import { Closing } from '@/components/Closing';
import { WorkCards } from '@/components/work/WorkCards';
import { home } from '@/content/site';
import { services } from '@/content/services';
import { pageMetadata } from '@/lib/metadata';
import styles from '@/components/pages.module.css';
export const metadata = pageMetadata('Home', home.introduction, '/');
const stages = [['Scope', 'Agree on the deliverables, dependencies and definition of done.'], ['Implement', 'Build the agreed tags, events and integrations.'], ['Verify', 'Test the behavior and document the evidence.'], ['Handoff', 'Give your team the configuration, results and next steps.']];
export default function Home() {
  return <div className="container">
    <section className={styles.hero}><div><h1><span>I’ll handle</span><span>the tracking.</span></h1><p className={styles.heroIntro}>{home.introduction}</p><div className={`actions ${styles.heroActions}`}><Link className="button" href="/contact">Request a project <Arrow /></Link><Link className="text-link" href="/work">View the work <Arrow /></Link></div></div><FlowDiagram showCaption={false} /></section>
    <section className={`section ${styles.serviceIndex}`} aria-labelledby="home-services"><div className={styles.sectionLead}><span className="eyebrow">Implementation services</span><h2 id="home-services">{home.servicesTitle}</h2><p>{home.servicesIntro}</p></div><div className={styles.serviceLinks}>{services.map(service => <Link href={`/services#${service.id}`} key={service.id} className={styles.serviceLink}><div><h3>{service.title}</h3><p>{service.summary}</p></div><Arrow /></Link>)}</div></section>
    <section className="section" aria-labelledby="home-work"><div className={styles.sectionHeading}><div><span className="eyebrow">The work</span><h2 id="home-work">See the implementation.</h2></div><Link className="text-link" href="/work">Explore the work <Arrow /></Link></div><WorkCards limit={3}/></section>
    <section className={`section ${styles.process}`} aria-labelledby="home-process"><div className={styles.sectionLead}><span className="eyebrow">How it works</span><h2 id="home-process">A clear scope.<br />A proper handoff.</h2><p>Each project has a defined beginning and end.</p><Link className="text-link" href="/how-it-works">The full process <Arrow /></Link></div><ol className={styles.processList}>{stages.map(([title, text], index) => <li key={title}><span className={styles.number} aria-hidden="true">0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
    <section className={`section ${styles.why}`}><h2>{home.whyTitle}</h2><div><p>{home.whyText}</p><Link className="text-link" href="/about">A little about me <Arrow /></Link></div></section>
    <Closing />
  </div>;
}
