import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';
import { submissionSchema, fieldErrors } from '@/lib/inquiries/schema';
import { allowedOrigin, deliveryConfigured, isMockDelivery } from '@/lib/inquiries/config';
import { ResendAdapter, MockAdapter, DeliveryError } from '@/lib/inquiries/delivery';
import { getStore } from '@/lib/inquiries/store';
import { submitInquiry } from '@/lib/inquiries/submit';
import { receiptCookie, receiptLifetime, signReceipt } from '@/lib/inquiries/receipt';
export const runtime = 'nodejs';
export const maxDuration = 30;
const maxBytes = 32768;
function error(status: number, category: string, message: string, extra = {}) {
  return NextResponse.json({ ok: false, category, message, ...extra }, { status, headers: { 'Cache-Control': 'no-store' } });
}
async function readBounded(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('empty');
  const chunks: Uint8Array[] = [];
  let size = 0;
  const timer = setTimeout(() => { void reader.cancel(); }, 5000);
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new Error('large'); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { clearTimeout(timer); reader.releaseLock(); }
}
export async function POST(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return error(415, 'request', 'Please submit the project form as shown.');
  if (Number(request.headers.get('content-length') || 0) > maxBytes) return error(413, 'request', 'This request is too large. Please shorten your project description.');
  if (!allowedOrigin(request)) return error(403, 'request', 'Please submit the form from this website.');
  let body: unknown;
  try { body = await readBounded(request); } catch (e) { return error(e instanceof Error && e.message === 'large' ? 413 : 400, 'request', 'This request could not be read. Please check the form and try again.'); }
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) return error(422, 'validation', 'Please check the highlighted fields and try again.', { errors: fieldErrors(parsed.error) });
  const mock = isMockDelivery();
  if (!mock && !deliveryConfigured()) return error(503, 'unavailable', 'The project form is temporarily unavailable. Please try again later or use the email alternative when shown.');
  try {
    const store = getStore();
    // Vercel overwrites x-vercel-forwarded-for. Other hosts use a conservative shared bucket until a trusted proxy is configured.
    const networkId = process.env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() || 'shared' : 'local-or-self-hosted';
    const identity = createHmac('sha256', process.env.RECEIPT_SIGNING_SECRET || 'local-only-rate-limit-key').update(networkId).digest('hex');
    const limit = await store.limit(identity);
    if (!limit.success) {
      const result = error(429, 'rate_limited', 'Too many requests in a short time. Please wait before trying again.');
      result.headers.set('Retry-After', String(Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))));
      return result;
    }
    const result = await submitInquiry(parsed.data, store, mock ? new MockAdapter() : new ResendAdapter());
    const reference = `DM-${parsed.data.submissionId.replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const response = NextResponse.json({ ok: true, mock, duplicate: result.duplicate }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(receiptCookie, signReceipt(reference, mock), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/contact/thanks', maxAge: receiptLifetime });
    return response;
  } catch (e) {
    if (e instanceof DeliveryError && e.category === 'uncertain') return error(504, 'uncertain', 'I couldn’t confirm that your request was sent. Please retry or use email.');
    if (e instanceof DeliveryError && e.category === 'conflict') return error(409, 'conflict', 'This request reference is already in use. Reload the page before starting a new request.');
    return error(503, 'unavailable', 'The project form is temporarily unavailable. Your details are still here; please try again later.');
  }
}
