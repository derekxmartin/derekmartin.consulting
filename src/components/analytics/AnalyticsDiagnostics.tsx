'use client';

import { useEffect, useState } from 'react';
import { analytics } from '@/lib/analytics/config';
import styles from './diagnostics.module.css';

function readDiagnostics() {
  let savedConsent = 'unavailable';
  try {
    const value = localStorage.getItem(analytics.consentKey);
    savedConsent = value === 'accepted' || value === 'declined' ? value : 'unset';
  } catch { /* Report storage restrictions without changing consent. */ }
  const google = window as unknown as { google_tag_manager?: Record<string, unknown> };
  const events = (window.dataLayer || []).filter((entry): entry is { event: string } =>
    typeof entry === 'object' && entry !== null && 'event' in entry && typeof entry.event === 'string');
  const resources = performance.getEntriesByType('resource').map(entry => new URL(entry.name, location.origin));
  return {
    diagnosticVersion: 1,
    savedConsent,
    analyticsDisabled: window[`ga-disable-${analytics.measurementId}`] ?? 'not initialized',
    gtmScriptPresent: Boolean(document.getElementById('dm-gtm')),
    gtmExecuted: Boolean(google.google_tag_manager?.[analytics.containerId]),
    googleTagScriptPresent: Array.from(document.scripts).some(script => {
      if (!script.src) return false;
      const url = new URL(script.src);
      return url.hostname === 'www.googletagmanager.com' && url.pathname === '/gtag/js';
    }),
    formStartQueued: events.filter(entry => entry.event === 'form_start').length,
    formErrorQueued: events.filter(entry => entry.event === 'form_error').length,
    leadQueued: events.filter(entry => entry.event === 'generate_lead').length,
    formSuccessVisible: Boolean(document.querySelector('[data-inquiry-status="success"]')),
    collectionResourcesObserved: resources.filter(url =>
      (url.hostname === 'google-analytics.com' || url.hostname.endsWith('.google-analytics.com')) && url.pathname.endsWith('/collect')).length,
  };
}

// Mounted only by the explicit diagnostic URL. Never reads form values, cookie
// contents, client IDs or request payloads, and never sends diagnostic data.
export function AnalyticsDiagnostics() {
  const [report, setReport] = useState<ReturnType<typeof readDiagnostics> | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  useEffect(() => {
    const timer = window.setInterval(() => setReport(readDiagnostics()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(readDiagnostics(), null, 2));
      setCopyStatus('Copied. Paste the report into our chat.');
    } catch { setCopyStatus('Copy is unavailable. You can select the report text below.'); }
  }
  return <details open className={styles.panel}>
    <summary>Tracking diagnostics</summary>
    <div className={styles.body}>
      <p>For this page only. Collapse this panel while using the form.</p>
      <pre aria-label="Tracking diagnostic report">{report ? JSON.stringify(report, null, 2) : 'Reading tracking status…'}</pre>
      <p>Queued events and observed requests do not prove receipt by GA4. No form contents are included.</p>
      <button type="button" onClick={copy}>Copy diagnostic report</button>
      <p role="status">{copyStatus}</p>
    </div>
  </details>;
}
