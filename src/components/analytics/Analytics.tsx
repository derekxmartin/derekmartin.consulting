'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { analytics } from '@/lib/analytics/config';
import { configureAnalytics, track } from '@/lib/analytics/events';
import styles from './analytics.module.css';

type Choice = 'accepted' | 'declined' | 'unset' | 'loading';
declare global {
  interface Window { dataLayer?: unknown[]; [key: `ga-disable-${string}`]: boolean | undefined; }
}
const changeEvent = 'dm:analytics-choice';
const settingsEvent = 'dm:analytics-settings';
let memoryChoice: Choice = 'unset';
let initialized = false;

function readChoice(): Choice {
  try {
    const value = localStorage.getItem(analytics.consentKey);
    return value === 'accepted' || value === 'declined' ? value : memoryChoice;
  } catch { return memoryChoice; }
}
function subscribe(notify: () => void) {
  window.addEventListener('storage', notify);
  window.addEventListener(changeEvent, notify);
  return () => { window.removeEventListener('storage', notify); window.removeEventListener(changeEvent, notify); };
}
const serverChoice = (): Choice => 'loading';

// Google's command queue expects an Arguments object.
function googleCommand(..._args: unknown[]) {
  void _args;
  const w = window;
  // eslint-disable-next-line prefer-rest-params
  (w.dataLayer ||= []).push(arguments);
}
function clearAnalyticsCookies() {
  const domains = ['', location.hostname, `.${location.hostname}`];
  for (const name of document.cookie.split(';').map(cookie => cookie.split('=')[0].trim())) {
    if (name !== '_ga' && !name.startsWith('_ga_')) continue;
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`;
  }
}
function applyChoice(choice: Choice) {
  const w = window;
  const accepted = choice === 'accepted';
  w[`ga-disable-${analytics.measurementId}`] = !accepted;
  configureAnalytics(accepted ? (event, parameters) => {
    // Clear optional keys so GTM cannot reuse values from a previous event.
    (w.dataLayer ||= []).push({ service_id: null, placement: null, form_id: null, error_category: null, ...parameters, event });
  } : undefined, accepted);
  if (!accepted) {
    if (initialized) googleCommand('consent', 'update', { analytics_storage: 'denied' });
    clearAnalyticsCookies();
    return;
  }
  if (!initialized) {
    googleCommand('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    initialized = true;
  }
  googleCommand('consent', 'update', { analytics_storage: 'granted' });
  if (document.getElementById('dm-gtm')) return;
  (w.dataLayer ||= []).push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.id = 'dm-gtm'; script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${analytics.containerId}`;
  script.onerror = () => script.remove();
  document.head.appendChild(script);
}

export function Analytics() {
  const choice = useSyncExternalStore(subscribe, readChoice, serverChoice);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    if (choice !== 'loading') applyChoice(choice);
  }, [choice]);
  useEffect(() => {
    const open = () => setSettingsOpen(true);
    window.addEventListener(settingsEvent, open);
    return () => window.removeEventListener(settingsEvent, open);
  }, []);
  useEffect(() => {
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('a') : null;
      if (!target) return;
      const url = new URL(target.href, location.href);
      const placement = target.closest('footer') ? 'footer' : target.closest('header') ? 'header' : location.pathname === '/contact' ? 'contact' : location.pathname === '/' ? 'home' : 'service';
      if (url.protocol === 'mailto:') track('email_click', { placement });
      else if (url.protocol === 'tel:') track('phone_click', { placement });
      else if (url.hostname === 'www.linkedin.com' || url.hostname === 'linkedin.com') track('linkedin_click', { placement });
      else if (url.origin === location.origin && url.pathname === '/contact' && url.searchParams.has('service')) track('service_cta_click', { service_id: url.searchParams.get('service') || '', placement });
    };
    document.addEventListener('click', click, true);
    return () => document.removeEventListener('click', click, true);
  }, []);
  function choose(next: 'accepted' | 'declined') {
    memoryChoice = next;
    try { localStorage.setItem(analytics.consentKey, next); } catch { /* The choice still applies for this visit. */ }
    applyChoice(next);
    window.dispatchEvent(new Event(changeEvent));
    setSettingsOpen(false);
  }
  if (choice === 'loading' || (choice !== 'unset' && !settingsOpen)) return null;
  return <aside className={styles.banner} aria-label="Analytics preferences">
    <div><p className={styles.title}>A little insight, with your permission.</p><p>I use Google Analytics to understand which pages and services are useful. Optional analytics cookies stay off unless you accept. <Link href="/privacy">Privacy notice</Link></p></div>
    <div className={styles.actions}><button onClick={() => choose('declined')}>Decline analytics</button><button onClick={() => choose('accepted')}>Accept analytics</button>{settingsOpen && <button onClick={() => setSettingsOpen(false)}>Close</button>}</div>
  </aside>;
}

export function AnalyticsPreferencesLink() {
  return <button className={styles.settings} onClick={() => window.dispatchEvent(new Event(settingsEvent))}>Cookie settings</button>;
}
