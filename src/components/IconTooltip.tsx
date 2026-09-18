'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import styles from './icon-tooltip.module.css';

export function IconTooltip({ label, children, mobileAlign = 'end' }: {
  label: string;
  children: ReactNode;
  mobileAlign?: 'start' | 'center' | 'end';
}) {
  const tooltipId = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const open = (hovered || focused) && !dismissed;

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDismissed(true);
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [open]);

  return <span className={styles.icon} data-open={open} data-mobile-align={mobileAlign}
    onPointerEnter={() => { setHovered(true); setDismissed(false); }}
    onPointerLeave={() => setHovered(false)}
    onFocus={() => { setFocused(true); setDismissed(false); }}
    onBlur={() => setFocused(false)}>
    <span className={styles.trigger} role="img" tabIndex={0} aria-labelledby={tooltipId}>{children}</span>
    <span id={tooltipId} className={styles.tooltip} role="tooltip">{label}</span>
  </span>;
}
