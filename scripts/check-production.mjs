import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const origin = 'http://127.0.0.1:3001';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3001'], { env: { ...process.env, NODE_ENV: 'production', SITE_URL: origin, SITE_ENV: 'preview', INQUIRY_DELIVERY: 'mock' }, windowsHide: true, stdio: 'pipe' });
let startupError = '';
server.stderr.on('data', chunk => { startupError += chunk; });
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error(`Production server exited: ${startupError}`);
    try { if ((await fetch(origin, { signal: AbortSignal.timeout(1000) })).ok) { ready = true; break; } } catch { /* Wait for startup. */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, 'Production server started');
  for (const route of ['/', '/services', '/work', '/about', '/how-it-works', '/contact', '/privacy', '/getting-started', '/contact/thanks']) assert.equal((await fetch(origin + route)).status, 200, route);
  for (const route of ['/work/layout-preview', '/work/unpublished', '/not-a-page']) assert.equal((await fetch(origin + route)).status, 404, route);
  const work = await (await fetch(origin + '/work')).text(); assert.ok(!work.includes('Development review only'));
  const thanks = await (await fetch(origin + '/contact/thanks')).text(); assert.ok(thanks.includes('There’s no confirmed request to display.'));
  const response = await fetch(origin + '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ submissionId: randomUUID(), submittedAt: new Date().toISOString(), honeypot: '', inquiry: { name: 'Production Guard Test', email: 'test@example.com', service: 'not-sure', description: 'This request must be rejected without configured delivery.' } }) });
  assert.equal(response.status, 503); assert.equal((await response.json()).ok, false); assert.equal(response.headers.get('set-cookie'), null);
  const social = await fetch(origin + '/opengraph-image'); assert.equal(social.status, 200); assert.match(social.headers.get('content-type'), /image\/png/);
  console.log('Production checks passed: 9 routes, 3 real 404s, neutral Thanks, hidden fixture, generated social image, mock delivery rejected.');
} finally { server.kill(); }
