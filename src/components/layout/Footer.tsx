import Link from 'next/link';
import { navigation, site } from '@/content/site';
import styles from './layout.module.css';
import { AnalyticsPreferencesLink } from '@/components/analytics/Analytics';
export function Footer({ analyticsEnabled = false }: { analyticsEnabled?: boolean }) {
  return <footer className={`container ${styles.footer}`}>
    <div className={styles.footerMain}>
      <div className={styles.footerBrand}><Link href="/" className={styles.footerName}>{site.displayName}</Link><p>{site.descriptor}</p></div>
      <nav aria-label="Footer navigation">
        <h2 className={styles.footerHeading}>Explore</h2>
        <div className={styles.footerNav}>{navigation.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href="/contact">Request a project</Link></div>
      </nav>
      <div className={styles.footerContact}>
        <h2 className={styles.footerHeading}>Get in touch</h2>
        <address>
          {site.publicEmail && <a href={`mailto:${site.publicEmail}`}>{site.publicEmail}</a>}
          <a href={site.phoneHref}>{site.publicPhone}</a>
        </address>
        <div className={styles.footerSocial}>
          {site.socialLinks.map(link => <a key={link.url} href={link.url} aria-label={`${site.displayName} on ${link.label}`} title={link.label} className={styles.socialLink}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.53v16.94C2 21.32 2.69 22 3.55 22h16.9c.86 0 1.55-.68 1.55-1.53V3.53C22 2.68 21.31 2 20.45 2ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.52 2.79-1.52 2.98 0 3.53 1.96 3.53 4.51v5.26h.05Z"/></svg>
          </a>)}
        </div>
      </div>
    </div>
    <div className={styles.footerBottom}><p>© {new Date().getFullYear()} {site.displayName}</p><div className={styles.footerPolicies}>{analyticsEnabled && <AnalyticsPreferencesLink />}<Link href="/privacy">Privacy notice</Link></div></div>
  </footer>;
}
