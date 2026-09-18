import Link from 'next/link';
import { navigation, site } from '@/content/site';
import styles from './layout.module.css';
export function Footer() {
  return <footer className={`container ${styles.footer}`}>
    <div><Link href="/" className={styles.footerName}>{site.displayName}</Link><p>{site.descriptor}</p><p className={styles.copyright}>© {new Date().getFullYear()} {site.displayName}</p></div>
    <div className={styles.footerRight}><nav aria-label="Footer navigation">{navigation.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href="/contact">Request a project</Link><Link href="/privacy">Privacy notice</Link></nav>
      {site.publicEmail && <a href={`mailto:${site.publicEmail}`}>{site.publicEmail}</a>}
      {site.socialLinks.map(link => <a key={link.url} href={link.url} rel="noopener noreferrer">{link.label}</a>)}
    </div>
  </footer>;
}
