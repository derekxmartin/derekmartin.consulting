import { test, expect } from '@playwright/test';

test('consent blocks Google, persists, loads once, and supports withdrawal', async ({ page }) => {
  let requests = 0;
  await page.route('https://www.googletagmanager.com/**', route => { requests++; return route.fulfill({ contentType: 'text/javascript', body: '' }); });
  await page.goto('/');
  await expect(page.getByRole('complementary', { name: 'Analytics preferences' })).toBeVisible();
  expect(requests).toBe(0);
  await page.getByRole('button', { name: 'Decline analytics' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Accept analytics' })).toHaveCount(0);
  expect(requests).toBe(0);
  await page.getByRole('button', { name: 'Cookie settings' }).click();
  await page.getByRole('button', { name: 'Accept analytics' }).click();
  await expect.poll(() => requests).toBe(1);
  await page.getByRole('link', { name: 'Services', exact: true }).first().click();
  await expect(page).toHaveURL(/\/services$/);
  expect(requests).toBe(1);
  await page.getByRole('button', { name: 'Cookie settings' }).click();
  await page.getByRole('button', { name: 'Decline analytics' }).click();
  expect(await page.evaluate(() => window['ga-disable-G-J2T8NHV8VV'])).toBe(true);
  await page.reload();
  expect(requests).toBe(1);
});

test('accepted inquiry produces one safe lead event; failure produces none', async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  let succeed = false;
  await page.route('https://formspree.io/**', route => route.fulfill({ status: succeed ? 200 : 422, json: succeed ? { ok: true, next: '/thanks' } : { errors: [{ field: 'email', code: 'TYPE_EMAIL', message: 'Check email' }] } }));
  await page.goto('/contact?service=ga4-gtm&analytics-debug=1');
  const diagnostics = page.getByLabel('Tracking diagnostic report');
  await expect(diagnostics).toContainText('"savedConsent": "unset"');
  await page.getByText('Tracking diagnostics', { exact: true }).click();
  await page.getByRole('button', { name: 'Accept analytics' }).click();
  await page.locator('#name').fill('Private test name');
  await page.locator('#email').fill('private-test@example.com');
  await page.locator('#description').fill('Private project details should never enter analytics.');
  await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
  expect(await page.evaluate(() => window.dataLayer?.filter(item => (item as {event?: string}).event === 'generate_lead').length)).toBe(0);
  succeed = true;
  await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page.getByRole('heading', { name: 'Thanks for the details.' })).toBeVisible();
  const data = await page.evaluate(() => JSON.stringify(window.dataLayer));
  expect(JSON.parse(data).filter((item: {event?: string}) => item.event === 'generate_lead')).toHaveLength(1);
  expect(JSON.parse(data).filter((item: {event?: string}) => item.event === 'form_start')).toHaveLength(1);
  expect(data).not.toContain('Private'); expect(data).not.toContain('private-test@example.com');
  await page.getByText('Tracking diagnostics', { exact: true }).click();
  await expect(diagnostics).toContainText('"leadQueued": 1');
  await expect(diagnostics).toContainText('"formSuccessVisible": true');
  await expect(diagnostics).toContainText('"savedConsent": "accepted"');
  await expect(diagnostics).toContainText('"gtmExecuted": false'); // Script is deliberately stubbed.
  await expect(diagnostics).not.toContainText('Private');
  await expect(diagnostics).not.toContainText('private-test@example.com');
});
