import Link from 'next/link';
import Image from 'next/image';
import { publishedCases } from '@/content/work';
import { site } from '@/content/site';
import { Arrow } from '../Arrow';
import styles from '../pages.module.css';
export function WorkCards({ limit }: { limit?: number }) {
  const cases = publishedCases().slice(0, limit);
  if (!cases.length) return <div className={styles.emptyWork}><h3>Good implementation deserves a closer look.</h3><div><p>{site.portfolioEmptyText}</p><Link className="text-link" href="/contact">Discuss your implementation <Arrow /></Link></div></div>;
  return <div className={styles.workGrid}>{cases.map(c => <article className={styles.workCard} key={c.slug}>
    {c.hero && <Image src={c.hero.src} alt={c.hero.alt} width={c.hero.width} height={c.hero.height} sizes="(max-width: 767px) 100vw, 50vw" />}
    <span className={styles.evidenceLabel}>{c.evidenceType}</span><h2><Link href={`/work/${c.slug}`}>{c.title}</Link></h2><p>{c.summary}</p><p>{c.platforms.join(' · ')}</p>
    {c.demoUrl && <a className="text-link" href={c.demoUrl} target="_blank" rel="noopener noreferrer">Open live demo <Arrow /></a>}
  </article>)}</div>;
}
