'use client';

import { useState, useSyncExternalStore } from 'react';
import styles from './motion-diagnostics.module.css';

// Temporary, opt-in instrumentation. Never changes animation or motion settings.
async function captureMotion() {
  const elements = [...document.querySelectorAll('.ambient-signal, [class*="typedEvent"], [class*="sourcePulse"], [class*="branchPulse"], [class*="pulseHalo"], [class*="eventTicker"], [class*="staticEvent"], [class*="field"]')];
  const ids = new Map<Animation, number>();
  const sample = () => ({
    at: performance.now(), visibility: document.visibilityState,
    reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
    noPreference: matchMedia('(prefers-reduced-motion: no-preference)').matches,
    elements: elements.map((element, index) => {
      const css = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const hiddenAncestors = [];
      for (let parent: Element | null = element; parent; parent = parent.parentElement) {
        if (getComputedStyle(parent).display === 'none') hiddenAncestors.push(parent.getAttribute('class') || parent.tagName);
      }
      return { index, class: element.getAttribute('class'), text: element.textContent,
        animationName: css.animationName, duration: css.animationDuration, delay: css.animationDelay,
        playState: css.animationPlayState, timingFunction: css.animationTimingFunction,
        display: css.display, visibility: css.visibility, opacity: css.opacity, width: css.width,
        transform: css.transform, strokeDashoffset: css.strokeDashoffset, hiddenAncestors,
        inViewport: rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth,
        characters: css.getPropertyValue('--characters'), eventDelay: css.getPropertyValue('--event-delay'),
        pseudos: ['::before', '::after'].map(pseudo => { const c = getComputedStyle(element, pseudo); return { pseudo, name: c.animationName, duration: c.animationDuration, state: c.animationPlayState, transform: c.transform }; }),
        animations: typeof element.getAnimations === 'function' ? element.getAnimations().map(animation => {
          if (!ids.has(animation)) ids.set(animation, ids.size);
          return { id: ids.get(animation), name: 'animationName' in animation ? animation.animationName : null,
            currentTime: animation.currentTime, playState: animation.playState, pending: animation.pending,
            playbackRate: animation.playbackRate, timing: animation.effect?.getComputedTiming() };
        }) : null,
      };
    }),
  });
  const media: { condition: string; matches: boolean }[] = [];
  const keyframes: string[] = [];
  function inspectRules(rules: CSSRuleList) {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) media.push({ condition: rule.conditionText, matches: matchMedia(rule.conditionText).matches });
      if (rule instanceof CSSKeyframesRule) keyframes.push(rule.cssText);
      if ('cssRules' in rule) inspectRules((rule as CSSGroupingRule).cssRules);
    }
  }
  const stylesheets = Array.from(document.styleSheets).map(sheet => {
    try { inspectRules(sheet.cssRules); return { href: sheet.href, disabled: sheet.disabled, rules: sheet.cssRules.length }; }
    catch (error) { return { href: sheet.href, error: String(error) }; }
  });
  const before = sample();
  await new Promise(resolve => setTimeout(resolve, 2000));
  const after = sample();
  const clocks = before.elements.flatMap(element => (element.animations || []).map(animation => {
    const end = after.elements[element.index].animations?.find(item => item.id === animation.id);
    return { element: element.index, name: animation.name, before: animation.currentTime, after: end?.currentTime,
      deltaMs: typeof animation.currentTime === 'number' && typeof end?.currentTime === 'number' ? end.currentTime - animation.currentTime : null };
  }));
  return { version: 1, capturedAt: new Date().toISOString(), userAgent: navigator.userAgent,
    path: location.pathname, viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    elapsedMs: after.at - before.at, animationApi: typeof document.getAnimations === 'function',
    supports: { steps: CSS.supports('animation-timing-function', 'steps(13, end)'), variableSteps: CSS.supports('animation-timing-function', 'steps(var(--characters), end)'), variableWidth: CSS.supports('width', 'calc(var(--characters) * 1ch)') },
    stylesheetLinks: Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map(link => ({ href: link.href, loaded: !!link.sheet })),
    stylesheets, media, keyframes, clocks, before, after,
    logo: document.querySelector<HTMLImageElement>('header img')?.currentSrc,
    note: 'SVG image internals are not exposed to the parent animation API. Hidden desktop paths have no active animation on mobile. The logo animation runs once. Resource timing does not prove HTTP success; stylesheet CSSOM availability confirms parsing.',
  };
}

const subscribeToLocation = (notify: () => void) => {
  window.addEventListener('popstate', notify);
  return () => window.removeEventListener('popstate', notify);
};
const isRequested = () => new URLSearchParams(location.search).get('motion-debug') === '1';
const serverSnapshot = () => false;

export function MotionDiagnostics() {
  const enabled = useSyncExternalStore(subscribeToLocation, isRequested, serverSnapshot);
  const [closed, setClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<Awaited<ReturnType<typeof captureMotion>> | null>(null);
  const [status, setStatus] = useState('Scroll the graphic into view, then capture. Keep this tab visible for two seconds.');
  if (!enabled || closed) return null;
  const json = report ? JSON.stringify(report, null, 2) : '';
  return <aside className={styles.panel} aria-label="Motion diagnostics">
    <details open><summary>Motion diagnostics · temporary</summary>
      <p role="status">{status}</p>
      <div className={styles.actions}>
        <button disabled={busy} onClick={async () => {
          setBusy(true); setStatus('Measuring for two seconds…');
          try { const data = await captureMotion(); setReport(data); setStatus(`Reduce motion: ${data.before.reduce}. ${data.clocks.filter(clock => (clock.deltaMs || 0) > 0).length}/${data.clocks.length} animation clocks advanced over ${Math.round(data.elapsedMs)} ms.`); }
          catch (error) { setStatus(`Capture failed: ${String(error)}`); }
          finally { setBusy(false); }
        }}>Capture 2 seconds</button>
        <button disabled={!report || busy} onClick={async () => {
          try { await navigator.clipboard.writeText(json); setStatus('Report copied. Paste it into our conversation.'); }
          catch { setStatus('Copy unavailable. Select the report below and copy it manually.'); }
        }}>Copy report</button>
        <button onClick={() => setClosed(true)}>Close</button>
      </div>
      {report && <details><summary>Full report</summary><textarea aria-label="Motion diagnostic report" readOnly value={json} /></details>}
    </details>
  </aside>;
}
