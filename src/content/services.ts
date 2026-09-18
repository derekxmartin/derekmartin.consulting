export type Service = {
  id: string; title: string; summary: string; scope: string;
  examples: string[]; deliverables: string[]; inputs: string;
  platformExamples: { name: string; confirmed: boolean }[];
  note?: string; subsection?: { title: string; text: string };
};

export const services: Service[] = [
  {
    id: 'ad-tags-pixels', title: 'Ad Tags & Pixels',
    summary: 'The right advertising events, parameters and pixels in the right places.',
    scope: 'Conversion, remarketing and audience tags for advertising platforms, networks and DSPs. Implementation through a tag manager or agreed direct-code installation, with the event parameters, values and identifiers the platform requires.',
    examples: ['Install a new advertising network’s site pixel.', 'Configure conversion and audience events from supplied partner specifications.', 'Map event values and identifiers across a lead or purchase journey.'],
    deliverables: ['Implemented tags and agreed event mapping', 'Validation evidence from the scoped test journeys', 'Configuration and handoff notes'],
    inputs: 'Platform and account, vendor specifications, website technology, relevant journeys, tag-manager access and a developer contact where needed.',
    platformExamples: ['Google Ads', 'Meta', 'LinkedIn', 'Microsoft Advertising', 'TikTok'].map(name => ({ name, confirmed: false })),
  },
  {
    id: 'floodlight-campaign-tracking', title: 'Floodlight & Campaign Tracking',
    summary: 'Floodlight activities, campaign trackers and the details that connect them.',
    scope: 'Floodlight activities with the appropriate counting behavior, conversion values, transaction identifiers and custom variables. Campaign tracking can include impression and click trackers, URL parameters, macros and scoped verification integrations.',
    examples: ['Implement Floodlight activities for a campaign launch.', 'Map custom variables and transaction values to the right activities.', 'Check a tracker chain between an ad server and media partner.', 'QA supplied third-party verification tags.'],
    deliverables: ['An activity and parameter implementation map', 'Configured tags and campaign tracking', 'Relevant firing, request and destination evidence', 'Documented limitations and handoff notes'],
    inputs: 'Advertiser access, activity definitions, counting and value requirements, placement or vendor documentation, site access and a test environment.',
    platformExamples: ['Campaign Manager 360', 'Display & Video 360', 'IAS', 'DoubleVerify'].map(name => ({ name, confirmed: false })),
  },
  {
    id: 'ga4-gtm', title: 'GA4 & GTM Implementation',
    summary: 'Events and data layers built around the actions that matter to your business.',
    scope: 'Property and container configuration, event tracking, custom dimensions, data-layer specifications and cross-domain measurement. The measurement plan follows the actual lead-generation or ecommerce journey.',
    examples: ['Track a successful form submission or booking.', 'Rebuild measurement after a website redesign.', 'Connect a journey that crosses more than one domain.'],
    deliverables: ['An agreed event and parameter plan', 'Property, container and data-layer implementation', 'Documented test journeys and results', 'A practical configuration handoff'],
    inputs: 'Properties and containers, domains, website stack, key business actions, developer dependencies and approved consent requirements.',
    platformExamples: [],
    subsection: { title: 'Ecommerce, from product to purchase.', text: 'Product views, cart changes, checkout and purchase events, with transaction identifiers and values checked across the agreed test flow.' },
  },
  {
    id: 'server-offline-conversions', title: 'Server-side & Offline Conversions',
    summary: 'Connect backend and CRM outcomes to the platforms that need them.',
    scope: 'Supported conversion APIs, server-side tagging, browser and server deduplication, and CRM or offline conversion feeds. We agree on the source, destination and exact integration before implementation.',
    examples: ['Send a qualified-lead milestone back from a CRM.', 'Deliver transaction signals from a backend.', 'Coordinate browser and server events without counting the same action twice.'],
    deliverables: ['Source-to-destination field mapping', 'The configured integration', 'Field, delivery and deduplication tests', 'Deployment, ownership and operating instructions'],
    inputs: 'Source and destination, event definitions, consent requirements, identifiers, hosting ownership, API access and existing integrations.',
    platformExamples: [],
    note: 'Ongoing hosting and subscription costs are separate from the implementation fee. Ongoing monitoring is not included in the project.',
  },
  {
    id: 'audits-repairs', title: 'Tracking Audits & Repairs',
    summary: 'Find what’s missing, duplicated or broken. Agree on a repair and verify it.',
    scope: 'Investigation of missing or duplicate conversions, unexpected values, broken triggers, tag conflicts and implementation discrepancies. Start with reproducible findings so the next step is clear.',
    examples: ['Diagnose conversions that stopped after a website change.', 'Review a setup inherited from another agency.', 'Resolve conflicting tags or incorrectly populated values.'],
    deliverables: ['Reproducible findings and prioritized recommendations', 'A defined repair scope', 'Agreed fixes and retesting when included'],
    inputs: 'Observed symptoms, affected platforms, expected behavior, dates of changes, account access and available evidence.',
    platformExamples: [],
    note: 'An audit can end with findings and a repair scope. A combined project can include the agreed repairs.',
  },
];

export const serviceIds = services.map(service => service.id);
export const defaultService = 'not-sure';
export function normalizeService(value: unknown): string {
  return typeof value === 'string' && serviceIds.includes(value) ? value : defaultService;
}
export function serviceTitle(id: string): string {
  return services.find(service => service.id === id)?.title ?? 'Not sure / help scoping';
}

export const faqs = [
  ['Can you work alongside our agency or developer?', 'Yes. We agree on technical ownership, developer dependencies and communication before implementation starts.'],
  ['Can you work behind the scenes for our client?', 'Agency collaboration and client communication can be agreed during scoping.'],
  ['Do you manage campaigns after implementation?', 'The engagement ends after the agreed implementation, verification and handoff. Media buying, bidding, pacing, creative rotation and daily campaign operations are outside the standard scope.'],
  ['How is the work priced?', 'Projects are scoped and quoted based on the implementation. The quote reflects the agreed deliverables, dependencies and test scope.'],
  ['What access will you need?', 'It depends on the project. Usually this means scoped account permissions, tag specifications, test journeys and a technical contact. Access is arranged after the scope is agreed.'],
  ['How do you confirm that it works?', 'We agree on the test scenarios and success criteria in advance. I check behavior, event parameters and the available destination evidence, and document any processing delays or limitations.'],
  ['What if the website changes later?', 'Later changes can be quoted as new work. Defect correction follows the agreed project terms.'],
  ['Can you diagnose the issue before quoting a repair?', 'Yes. A diagnostic audit can produce findings and a defined repair scope before you commit to implementation.'],
] as const;
