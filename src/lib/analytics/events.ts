import { site } from '@/content/site';
import { serviceIds } from '@/content/services';
type EventName = 'service_cta_click' | 'case_study_view' | 'demo_open' | 'form_start' | 'generate_lead' | 'form_error' | 'email_click';
type SafeParams = { service_id?: string; placement?: string; case_slug?: string; evidence_type?: string; form_id?: string; error_category?: string };
type Adapter = (name: EventName, parameters: SafeParams) => void;
let adapter: Adapter | undefined;
let consentGranted = false;
const eventKeys: Record<EventName, (keyof SafeParams)[]> = {
  service_cta_click: ['service_id', 'placement'], case_study_view: ['case_slug', 'evidence_type'], demo_open: ['case_slug'],
  form_start: ['form_id'], generate_lead: ['form_id', 'service_id'], form_error: ['form_id', 'error_category'], email_click: ['placement'],
};
// A future reviewed integration supplies both a real adapter and consent behavior.
export function configureAnalytics(nextAdapter: Adapter | undefined, consent: boolean) { adapter = nextAdapter; consentGranted = consent; }
export function setAnalyticsConsent(consent: boolean) { consentGranted = consent; }
export function track(name: EventName, parameters: SafeParams) {
  if (!site.analyticsEnabled || !adapter || !consentGranted) return;
  const safe: SafeParams = {};
  for (const key of eventKeys[name]) {
    const value = parameters[key];
    if (!value) continue;
    if (key === 'service_id' && [...serviceIds, 'not-sure'].includes(value)) safe[key] = value;
    if (key === 'form_id' && value === 'project-inquiry') safe[key] = value;
    if (key === 'placement' && ['header', 'footer', 'home', 'service', 'contact', 'case'].includes(value)) safe[key] = value;
    if (key === 'error_category' && ['validation', 'unavailable', 'uncertain', 'rate_limited', 'request', 'conflict'].includes(value)) safe[key] = value;
    // Case identifiers are added only by a reviewed adapter using published local records.
  }
  try { adapter(name, safe); } catch { /* Analytics never blocks navigation or inquiries. */ }
}
