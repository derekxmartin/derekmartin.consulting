import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { inquirySchema, submissionSchema } from '../src/lib/inquiries/schema';
import { isMockDelivery, deliveryConfigured } from '../src/lib/inquiries/config';
import { signReceipt, verifyReceipt } from '../src/lib/inquiries/receipt';
import { MockStore } from '../src/lib/inquiries/store';
import { submitInquiry } from '../src/lib/inquiries/submit';
import { ResendAdapter, DeliveryError, notification } from '../src/lib/inquiries/delivery';
import { configureAnalytics, track } from '../src/lib/analytics/events';
import { publishedCases, getCase } from '../src/content/work';
import { normalizeService } from '../src/content/services';

const inquiry = { name: '  Test Person  ', email: 'test@example.com', service: 'floodlight-campaign-tracking', description: 'Please implement the agreed Floodlight activity.', website: 'example.com' };
const makeSubmission = () => submissionSchema.parse({ submissionId: randomUUID(), submittedAt: new Date().toISOString(), honeypot: '', inquiry });
test('schema trims values, accepts personal email and normalizes a website', () => {
  const result = inquirySchema.parse(inquiry);
  assert.equal(result.name, 'Test Person'); assert.equal(result.website, 'https://example.com/');
  assert.equal(result.budget, '');
});
test('required fields, lengths, invalid services, URLs and conditional dates are rejected', () => {
  for (const patch of [{ name: '' }, { email: 'bad' }, { description: 'too short' }, { name: 'a'.repeat(101) }, { platforms: 'a'.repeat(301) }, { service: 'untrusted-service' }, { website: 'javascript:alert(1)' }, { website: 'https://user:password@example.com' }, { timing: 'Specific date', desiredDate: '' }, { timing: 'Specific date', desiredDate: '2027-02-30' }]) assert.equal(inquirySchema.safeParse({ ...inquiry, ...patch }).success, false, JSON.stringify(patch));
  assert.equal(inquirySchema.parse({ ...inquiry, timing: 'Flexible', desiredDate: '2027-01-01' }).desiredDate, '');
  assert.equal(normalizeService('<script>'), 'not-sure');
});
test('honeypot, invalid IDs and stale retries are rejected', () => {
  const submission = makeSubmission();
  for (const patch of [{ honeypot: 'bot' }, { submissionId: 'abc' }, { submittedAt: '2020-01-01T00:00:00.000Z' }]) assert.equal(submissionSchema.safeParse({ ...submission, ...patch }).success, false);
});
test('sequential retries do not deliver twice; changed payload with same ID is rejected', async () => {
  const store = new MockStore(); const submission = makeSubmission(); let sends = 0;
  const adapter = { async send() { sends++; } };
  assert.equal((await submitInquiry(submission, store, adapter)).duplicate, false);
  assert.equal((await submitInquiry(submission, store, adapter)).duplicate, true);
  assert.equal(sends, 1);
  await assert.rejects(submitInquiry({ ...submission, inquiry: { ...submission.inquiry, name: 'Changed' } }, store, adapter), (e: unknown) => e instanceof DeliveryError && e.category === 'conflict');
});
test('concurrent submissions reserve one delivery and allow later confirmation', async () => {
  const store = new MockStore(); const submission = makeSubmission(); let sends = 0;
  const adapter = { async send() { sends++; await new Promise(resolve => setTimeout(resolve, 20)); } };
  const results = await Promise.allSettled([submitInquiry(submission, store, adapter), submitInquiry(submission, store, adapter)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1); assert.equal(sends, 1);
  assert.equal((await submitInquiry(submission, store, adapter)).duplicate, true);
});
test('uncertain delivery retains the same reference for retry', async () => {
  const store = new MockStore(); const submission = makeSubmission(); const ids: string[] = [];
  const adapter = { async send(value: typeof submission) { ids.push(value.submissionId); if (ids.length === 1) throw new DeliveryError('uncertain'); } };
  await assert.rejects(submitInquiry(submission, store, adapter));
  assert.equal((await submitInquiry(submission, store, adapter)).duplicate, false);
  assert.deepEqual(ids, [submission.submissionId, submission.submissionId]);
});
test('rate limiting caps attempts and does not reset on rejection', async () => {
  const store = new MockStore();
  for (let i = 0; i < 5; i++) assert.equal((await store.limit('visitor')).success, true);
  const sixth = await store.limit('visitor'); assert.equal(sixth.success, false);
  assert.equal((await store.limit('visitor')).reset, sixth.reset);
  assert.equal((await store.limit('another-visitor')).success, true);
});
test('provider request uses stable idempotency, validated reply-to and plain text', async () => {
  const submission = makeSubmission(); const requests: RequestInit[] = [];
  const adapter = new ResendAdapter(async (_url, init) => { requests.push(init!); return Response.json({ id: 'provider-test-id' }); });
  await adapter.send(submission); await adapter.send(submission);
  assert.deepEqual(requests[0].body, requests[1].body);
  assert.equal((requests[0].headers as Record<string, string>)['Idempotency-Key'], `inquiry/${submission.submissionId}`);
  const formatted = notification(submission);
  assert.equal(formatted.reply_to, 'test@example.com'); assert.match(formatted.text, /Floodlight/);
  assert.equal('html' in formatted, false);
});
test('provider failure and ambiguous responses never become success', async () => {
  for (const response of [new Response('', { status: 503 }), new Response('', { status: 401 }), Response.json({}), Response.json({ id: null })]) await assert.rejects(new ResendAdapter(async () => response).send(makeSubmission()));
  await assert.rejects(new ResendAdapter(async () => { throw new Error('network'); }).send(makeSubmission()), (e: unknown) => e instanceof DeliveryError && e.category === 'uncertain');
});
test('production cannot enable mocks and requires every live integration setting', () => {
  assert.equal(isMockDelivery({ NODE_ENV: 'production', INQUIRY_DELIVERY: 'mock' }), false);
  assert.equal(isMockDelivery({ NODE_ENV: 'development', VERCEL_ENV: 'production', INQUIRY_DELIVERY: 'mock' }), false);
  assert.equal(isMockDelivery({ NODE_ENV: 'development', INQUIRY_DELIVERY: 'mock' }), true);
  assert.equal(deliveryConfigured({}), false);
});
test('signed receipt expires and rejects tampering, direct visits and production mocks', () => {
  const original = process.env.INQUIRY_DELIVERY; process.env.INQUIRY_DELIVERY = 'mock';
  const now = Date.now(); const value = signReceipt('DM-ABCDEF123456', true, now);
  assert.equal(verifyReceipt(value, now)?.mock, true);
  assert.equal(verifyReceipt(undefined, now), null);
  assert.equal(verifyReceipt(value + 'x', now), null);
  assert.equal(verifyReceipt(value, now + 16 * 60 * 1000), null);
  process.env.INQUIRY_DELIVERY = 'resend'; assert.equal(verifyReceipt(value, now), null);
  if (original === undefined) delete process.env.INQUIRY_DELIVERY; else process.env.INQUIRY_DELIVERY = original;
});
test('portfolio excludes fixtures and analytics defaults to no collection', () => {
  assert.deepEqual(publishedCases(), []); assert.equal(getCase('layout-preview'), undefined);
  let events = 0; configureAnalytics(() => { events++; }, false);
  track('generate_lead', { form_id: 'project-inquiry', service_id: 'ga4-gtm' });
  assert.equal(events, 0); configureAnalytics(undefined, false);
});
