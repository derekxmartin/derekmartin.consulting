'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { navigation, site } from '@/content/site';
import { Arrow } from '../Arrow';
import styles from './layout.module.css';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); menuRef.current?.focus(); }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  return <header className={styles.header}>
    <div className={`container ${styles.headerInner}`}>
      <Link className={styles.identity} href="/" aria-label={`${site.displayName}, home`} onClick={() => setOpen(false)}>
        <picture>
          <source media="(prefers-reduced-motion: reduce)" srcSet="/brand/derek-martin-c-static.svg" />
          <Image className={styles.headerLogo} src="/brand/derek-martin-c-animated.svg" alt="" width={218} height={56} loading="eager" unoptimized />
        </picture>
      </Link>
      <button ref={menuRef} className={styles.menuButton} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>Menu <span className={styles.menuIcon} aria-hidden="true" /></button>
      <nav id="primary-navigation" aria-label="Main navigation" className={`${styles.nav} ${open ? styles.open : ''}`}>
        {navigation.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={pathname === item.href || pathname.startsWith(item.href + '/') ? 'page' : undefined}>{item.label}</Link>)}
        <Link href="/contact" className={`button ${styles.headerCta}`} onClick={() => setOpen(false)} aria-current={pathname === '/contact' ? 'page' : undefined}>Request a project <Arrow /></Link>
      </nav>
    </div>
  </header>;
}
