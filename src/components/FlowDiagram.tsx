import type { CSSProperties } from 'react';
import { advertisingPlatforms, measurementPlatforms } from '@/content/platforms';
import { IconTooltip } from './IconTooltip';
import styles from './flow.module.css';

const eventExamples = ['website event', 'add_to_cart', 'generate_lead', 'purchase'];
const branches = [
  'M353 199H375Q401 199 401 173V119Q401 93 427 93H448',
  'M353 199H448',
  'M353 199H375Q401 199 401 225V279Q401 305 427 305H448',
];
const mobileBranches = [
  'M150 0V6Q150 12 144 12H56Q50 12 50 18V24',
  'M150 0V24',
  'M150 0V6Q150 12 156 12H244Q250 12 250 18V24',
];

export function FlowDiagram({ showCaption = true }: { showCaption?: boolean }) {
  return <figure className={styles.figure} aria-label="Illustrative flow: website events such as add to cart, generate lead and purchase pass through tag configuration to Google Analytics 4, Floodlight in Campaign Manager 360, or advertising platforms including Google Ads, Facebook and TikTok.">
    <div className={styles.diagram}>
      <div className={styles.field} aria-hidden="true" />
      <svg className={styles.lines} viewBox="0 0 628 430" fill="none" focusable="false" aria-hidden="true">
        <defs><marker id="route-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="m1 1 4 2.5L1 6" stroke="#7C9588" strokeWidth="1" /></marker></defs>
        <g stroke="#7C9588" strokeWidth="1.2" strokeLinecap="round" markerEnd="url(#route-arrow)">
          <path d="M146 199H183" />
          {branches.map(path => <path key={path} d={path} />)}
        </g>
        <path className={styles.sourcePulse} pathLength="100" d="M146 199H183" />
        <g className={styles.branchPulse}>
          {branches.map(path => <path key={path} pathLength="100" d={path} />)}
        </g>
        <path d="M255 168V102Q255 76 281 76H310Q336 76 336 50V24M255 230V330Q255 356 281 356H320Q346 356 346 382V406" stroke="#B6CDC0" strokeWidth="1" />
        <g fill="#94CFB3"><rect x="332" y="20" width="8" height="8" rx="2"/><rect x="342" y="402" width="8" height="8" rx="2"/><rect x="397" y="142" width="8" height="8" rx="2"/><rect x="397" y="250" width="8" height="8" rx="2"/></g>
      </svg>
      <div className={`${styles.node} ${styles.source}`} aria-hidden="true">
        <span className={styles.pulseHalo} /><span className={styles.dot} />
        <span className={styles.staticEvent}>Website event</span>
        <span className={styles.eventTicker}>
          {eventExamples.map((event, index) => <span key={event} className={styles.typedEvent} style={{ '--characters': event.length, '--event-delay': `${index * 6}s` } as CSSProperties}>{event}</span>)}
        </span>
        <svg className={styles.mobileSource} viewBox="0 0 4 24" fill="none" focusable="false">
          <path d="M2 0V24" stroke="#7C9588" strokeWidth="1.2" />
          <path className={styles.sourcePulse} pathLength="100" d="M2 0V24" />
        </svg>
      </div>
      <div className={`${styles.node} ${styles.config}`} aria-hidden="true">
        <span className={styles.pulseHalo} />
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14M7 3v4M13 8v4M8 13v4" stroke="currentColor" strokeWidth="1.5" /></svg>Tag configuration
      </div>
      <div className={styles.destinations}>
        <svg className={styles.mobileBranches} viewBox="0 0 300 24" preserveAspectRatio="none" fill="none" focusable="false" aria-hidden="true">
          <g stroke="#7C9588" strokeWidth="1.2">
            {mobileBranches.map(path => <path key={path} d={path} vectorEffect="non-scaling-stroke" />)}
          </g>
          <g className={styles.branchPulse}>
            {mobileBranches.map(path => <path key={path} pathLength="100" d={path} vectorEffect="non-scaling-stroke" />)}
          </g>
        </svg>
        {measurementPlatforms.map((platform, index) => <div key={platform.name} className={`${styles.node} ${styles.destination} ${styles.platformDestination}`}>
          <span className={styles.pulseHalo} aria-hidden="true" />
          <IconTooltip label={platform.name} mobileAlign={index === 0 ? 'start' : 'center'}>
            <svg className={styles.measurementLogo} viewBox="0 0 24 24" fill="currentColor" focusable="false" aria-hidden="true"><path d={platform.path} /></svg>
          </IconTooltip>
        </div>)}
        <div className={`${styles.node} ${styles.destination} ${styles.platformDestination}`}>
          <span className={styles.pulseHalo} aria-hidden="true" />
          <span className={styles.platformLogos}>
            {advertisingPlatforms.map(platform => <IconTooltip key={platform.name} label={platform.name}>
              <svg viewBox="0 0 24 24" fill="currentColor" focusable="false" aria-hidden="true"><path d={platform.path} /></svg>
            </IconTooltip>)}
          </span>
        </div>
      </div>
    </div>
    {showCaption ? <figcaption>Illustrative implementation flow</figcaption> : null}
  </figure>;
}
