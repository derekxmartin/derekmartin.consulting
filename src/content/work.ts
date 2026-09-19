import { services } from './services';

export type CaseStudy = {
  slug: string; title: string; summary: string; status: 'draft' | 'published';
  evidenceType: 'Demonstration' | 'Client case study' | 'Technical walkthrough';
  serviceIds: string[]; platforms: string[]; permissionConfirmed: boolean;
  hero?: { src: string; alt: string; width: number; height: number; caption: string };
  requirement: string; scope: string[]; implementation: string[]; challenges: string;
  verification: { scenario: string; expected: string; observed: string }[];
  limitations: string; demoUrl?: string; videoUrl?: string;
  artifacts?: { label: string; url: string }[]; lastVerifiedAt?: string;
  inProgress?: boolean;
};

// Owner-supplied, publishable cases go here. No generated proof or client assets.
const cases: CaseStudy[] = [{
  slug: 'fieldwork-mechanical',
  title: 'From inquiry to measurable lead.',
  summary: 'Fieldwork Mechanical is a fictional commercial HVAC business built to explore a practical question: what should count as a lead? Explore the static preview and the measurement plan taking shape behind it.',
  status: 'published', inProgress: true, evidenceType: 'Demonstration',
  permissionConfirmed: false,
  serviceIds: ['ga4-gtm', 'floodlight-campaign-tracking', 'ad-tags-pixels'],
  platforms: ['WordPress', 'GTM', 'GA4', 'Google Ads', 'Floodlight', 'Meta'],
  demoUrl: 'https://portfolio-leads-nine.vercel.app/',
  requirement: 'For a service business, clicking Submit is only the beginning. The goal is to connect campaign context to a successfully saved inquiry, then distinguish that inquiry from a qualified opportunity and a won project. This proof of concept explores how to make each step visible and testable without treating every interaction as a conversion.',
  scope: [
    'Build a commercial HVAC journey from service discovery to a three-step assessment request.',
    'Preserve useful campaign context and create one canonical assessment_accepted event only after a request is saved.',
    'Make retries recover the original receipt without creating another lead, and keep validation or storage failures out of conversion counts.',
    'Map accepted inquiries to GA4 generate_lead, a Google Ads inquiry action, Floodlight and Meta Lead, with qualification and won milestones kept separate.',
    'Make consent choices, event mappings and destination evidence inspectable, then package the findings into a clear handoff.'
  ],
  implementation: [
    'The public preview introduces Fieldwork Mechanical through its homepage, service pages and assessment journey. An implementation walkthrough explains the proposed event model, destination mappings and failure scenarios.',
    'The linked deployment is a static portfolio preview. Forms, sessions and tracking are disabled there, so visitors can explore the design without creating a lead or sending advertising events.',
    'The walkthrough describes a WordPress block theme and project-owned plugin, with transactional storage, signed sessions, retry protection and a qualification lab. These are the architecture being developed for the interactive POC; the static preview is not evidence that those behaviors have been verified end to end.'
  ],
  verification: [
    { scenario: 'Public preview', expected: 'Visitors can inspect the design and implementation approach.', observed: 'Homepage and implementation walkthrough are available. The preview explicitly identifies its disabled forms, sessions and tracking.' },
    { scenario: 'Acceptance and retries', expected: 'A saved request creates one lead; retrying returns the same receipt.', observed: 'Planned acceptance criterion. Interactive runtime verification remains part of completing the POC.' },
    { scenario: 'Consent and failure handling', expected: 'Declining optional tracking keeps the inquiry journey usable. Failed storage creates no conversion.', observed: 'Documented in the walkthrough; not verified through this static deployment.' },
    { scenario: 'Destination receipt', expected: 'Authorized test accounts show the intended events and parameters.', observed: 'GA4, Google Ads, Floodlight, Meta and CRM receipt remain unverified. Local mappings are not proof of platform delivery.' }
  ],
  challenges: 'The next milestone is a complete synthetic journey through the interactive runtime: validation, durable acceptance, retry recovery, consent changes and lead qualification. Destination checks then need to show what actually arrived in each authorized test account, separately from what the application generated.',
  limitations: 'Draft case study for an in-progress proof of concept, not a completed client engagement. Fieldwork Mechanical is fictional. No campaign performance, revenue lift or verified advertising outcomes are claimed. This write-up will be updated with test evidence and confirmed functionality once the POC is complete.',
  artifacts: [{ label: 'Read the implementation walkthrough', url: 'https://portfolio-leads-nine.vercel.app/implementation/' }],
}];
export function publishedCases(): CaseStudy[] {
  return cases.filter(c => c.status === 'published' && c.implementation.length > 0 &&
    c.verification.length > 0 && c.requirement.trim() && c.summary.trim() &&
    c.serviceIds.every(id => services.some(s => s.id === id)) &&
    (c.evidenceType !== 'Client case study' || c.permissionConfirmed));
}
export function getCase(slug: string): CaseStudy | undefined {
  return publishedCases().find(c => c.slug === slug);
}
