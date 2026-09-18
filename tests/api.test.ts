import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { POST } from '../src/app/api/inquiries/route';
import { allowedOrigin } from '../src/lib/inquiries/config';

const url = 'https://derekmartin.consulting/api/inquiries';
function body() { return { submissionId: randomUUID(), submittedAt: new Date().toISOString(), honeypot: '', inquiry: { name: 'Test Person', email: 'test@example.com', service: 'not-sure', description: 'A synthetic project request to exercise validation.' } }; }
function request(value: unknown, headers: Record<string, string> = {}) { return new Request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://derekmartin.consulting', ...headers }, body: JSON.stringify(value) }); }
test('endpoint rejects malformed, oversized, cross-origin and invalid data before delivery', async () => {
  assert.equal((await POST(request(body(), { 'Content-Type': 'text/plain' }))).status, 415);
  assert.equal((await POST(request(body(), { Origin: 'https://untrusted.example' }))).status, 403);
  assert.equal((await POST(request({ ...body(), padding: 'x'.repeat(33000) }))).status, 413);
  assert.equal((await POST(new Request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://derekmartin.consulting' }, body: '{bad' }))).status, 400);
  const invalid = body(); invalid.inquiry.email = 'invalid';
  const result = await POST(request(invalid)); assert.equal(result.status, 422);
  assert.ok((await result.json()).errors.email);
  assert.equal((await POST(request({ ...body(), honeypot: 'bot' }))).status, 422);
});
test('mock server acknowledgment sets an HTTP-only receipt, and replays are deduplicated', async () => {
  const env = process.env as Record<string, string | undefined>;
  const previous = { node: env.NODE_ENV, delivery: env.INQUIRY_DELIVERY };
  env.NODE_ENV = 'development'; env.INQUIRY_DELIVERY = 'mock';
  try {
    const data = body(); const response = await POST(request(data));
    assert.equal(response.status, 200); assert.equal((await response.json()).mock, true);
    assert.match(response.headers.get('set-cookie') || '', /HttpOnly/i);
    assert.match(response.headers.get('set-cookie') || '', /Path=\/contact\/thanks/);
    assert.doesNotMatch(response.headers.get('set-cookie') || '', /test@example/);
    assert.equal((await (await POST(request(data))).json()).duplicate, true);
    assert.equal(allowedOrigin(new Request('http://localhost:3000/api/inquiries', { headers: { Origin: 'http://127.0.0.1:3000' } })), true);
  } finally { if (previous.node === undefined) delete env.NODE_ENV; else env.NODE_ENV = previous.node; if (previous.delivery === undefined) delete env.INQUIRY_DELIVERY; else env.INQUIRY_DELIVERY = previous.delivery; }
});
test('a production process refuses mock success and missing credentials', async () => {
  const env = process.env as Record<string, string | undefined>; const previous = { node: env.NODE_ENV, delivery: env.INQUIRY_DELIVERY };
  env.NODE_ENV = 'production'; env.INQUIRY_DELIVERY = 'mock';
  try { const response = await POST(request(body())); assert.equal(response.status, 503); assert.equal(response.headers.get('set-cookie'), null); assert.equal((await response.json()).ok, false); }
  finally { if (previous.node === undefined) delete env.NODE_ENV; else env.NODE_ENV = previous.node; if (previous.delivery === undefined) delete env.INQUIRY_DELIVERY; else env.INQUIRY_DELIVERY = previous.delivery; }
});
