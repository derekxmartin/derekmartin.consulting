import type { Submission } from './schema';
import { serviceTitle } from '@/content/services';
export class DeliveryError extends Error {
  constructor(public category: 'unavailable' | 'uncertain' | 'conflict') { super(category); }
}
export interface DeliveryAdapter { send(submission: Submission): Promise<void> }
export function notification(submission: Submission) {
  const d = submission.inquiry;
  // Plain-text message; visitor values never become From or Subject headers.
  return {
    from: process.env.CONTACT_FROM_EMAIL,
    to: [process.env.CONTACT_TO_EMAIL],
    reply_to: d.email,
    subject: `Project request: ${serviceTitle(d.service)}`,
    text: [
      `Project request: ${submission.submissionId}`, `Submitted: ${submission.submittedAt}`,
      `Name: ${d.name}`, `Email: ${d.email}`, `Agency / company: ${d.company || 'Not supplied'}`,
      `Client website: ${d.website || 'Not supplied'}`, `Service: ${serviceTitle(d.service)}`,
      `Platforms: ${d.platforms || 'Not supplied'}`, `Timing: ${d.timing || 'Not supplied'}`,
      `Desired date: ${d.desiredDate || 'Not supplied'}`, `Budget note: ${d.budget || 'Not supplied'}`,
      '', 'Project description:', d.description,
    ].join('\n'),
  };
}
export class ResendAdapter implements DeliveryAdapter {
  constructor(private request: typeof fetch = fetch) {}
  async send(submission: Submission) {
    try {
      const response = await this.request('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `inquiry/${submission.submissionId}` },
        body: JSON.stringify(notification(submission)), signal: AbortSignal.timeout(10000),
      });
      if (response.status === 409) throw new DeliveryError('conflict');
      if (!response.ok) throw new DeliveryError(response.status >= 500 ? 'uncertain' : 'unavailable');
      const body = await response.json();
      if (!body || typeof body.id !== 'string' || !body.id) throw new DeliveryError('uncertain');
    } catch (error) {
      if (error instanceof DeliveryError) throw error;
      throw new DeliveryError('uncertain');
    }
  }
}
export class MockAdapter implements DeliveryAdapter {
  async send() {
    if (process.env.MOCK_OUTCOME === 'failure') throw new DeliveryError('unavailable');
    if (process.env.MOCK_OUTCOME === 'timeout') throw new DeliveryError('uncertain');
  }
}
