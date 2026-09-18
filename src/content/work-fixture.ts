import type { CaseStudy } from './work';
// Imported ONLY by the explicitly development-gated preview route.
export const workFixture: CaseStudy = {
  slug: 'layout-preview', title: 'A clearer path from event to activity.',
  summary: 'Development layout fixture for a Floodlight implementation case. All scenarios below are illustrative, with no live account or delivery claim.',
  status: 'draft', evidenceType: 'Demonstration', permissionConfirmed: false,
  serviceIds: ['floodlight-campaign-tracking'], platforms: ['Floodlight'],
  requirement: 'Example brief: map a lead event to a defined activity, document its parameters and set out the verification that a real implementation would require.',
  scope: ['Activity and parameter mapping', 'Agreed website event and trigger', 'A documented verification plan'],
  implementation: ['This fixture exercises the case-study layout and evidence table only.', 'A published case would explain the actual configuration and include sanitized artifacts from the work.'],
  challenges: 'A browser request alone cannot establish that a destination has accepted and processed a conversion. A real case would distinguish those checks.',
  verification: [
    { scenario: 'Successful lead action', expected: 'The agreed activity is requested once.', observed: 'Not tested. Layout fixture only.' },
    { scenario: 'Invalid form attempt', expected: 'No successful-lead activity.', observed: 'Not tested. Layout fixture only.' },
    { scenario: 'Destination processing', expected: 'The signal appears with agreed values.', observed: 'Not tested. No destination connected.' },
  ],
  limitations: 'No client implementation, account access, live conversion or platform acceptance is demonstrated. This page is unavailable in production and excluded from the portfolio and sitemap.',
};
