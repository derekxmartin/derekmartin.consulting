import Link from 'next/link';
import { Arrow } from './Arrow';
import { home } from '@/content/site';
import styles from './pages.module.css';
export function Closing() {
  return <section className={styles.closing}><h2>{home.closing}</h2><Link className="button" href="/contact">Request a project <Arrow /></Link></section>;
}
