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
};

// Owner-supplied, publishable cases go here. No generated proof or client assets.
const cases: CaseStudy[] = [];
export function publishedCases(): CaseStudy[] {
  return cases.filter(c => c.status === 'published' && c.implementation.length > 0 &&
    c.verification.length > 0 && c.requirement.trim() && c.summary.trim() &&
    c.serviceIds.every(id => services.some(s => s.id === id)) &&
    (c.evidenceType !== 'Client case study' || c.permissionConfirmed));
}
export function getCase(slug: string): CaseStudy | undefined {
  return publishedCases().find(c => c.slug === slug);
}
