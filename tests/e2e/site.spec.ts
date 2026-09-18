import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const screens = path.join(process.cwd(), 'docs', 'screenshots');
const paths = ['/', '/services', '/work', '/how-it-works', '/about', '/contact', '/privacy', '/getting-started'];
async function ready(page: Page) { await page.evaluate(() => document.fonts.ready); }
async function fillRequest(page: Page) {
  await page.getByLabel('Name (required)', { exact: true }).fill('Preview Test');
  await page.getByLabel('Email (required)', { exact: true }).fill('preview@example.com');
  await page.getByLabel('Project description (required)', { exact: true }).fill('A synthetic preview request for a Floodlight implementation.');
}
test('pages have one heading, load their font and avoid overflow at every required width', async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const url of paths) {
      const response = await page.goto(url); expect(response?.status(), url).toBe(200); await ready(page);
      await expect(page.locator('h1'), url).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${url} at ${width}px`).toBe(true);
      expect(await page.locator('body').evaluate(el => getComputedStyle(el).fontFamily)).toContain('manrope');
    }
  }
  expect(errors).toEqual([]);
});
test('Floodlight links preselect contact; invalid service safely falls back', async ({ page }) => {
  await page.goto('/services#floodlight-campaign-tracking');
  await page.locator('#floodlight-campaign-tracking').getByRole('link', { name: 'Discuss this implementation' }).click();
  await expect(page.getByLabel('Main service (required)')).toHaveValue('floodlight-campaign-tracking');
  await page.goto('/contact?service=unknown'); await expect(page.getByLabel('Main service (required)')).toHaveValue('not-sure');
});
test('mobile menu opens, Escape returns focus, link navigation closes the panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click(); await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.screenshot({ path: path.join(screens, 'mobile-navigation.png') });
  await page.keyboard.press('Escape'); await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click(); await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Services', exact: true }).click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});
test('contact errors are associated and focused; conditional date is required', async ({ page }) => {
  await page.goto('/contact'); await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page.locator('form').getByRole('alert')).toBeFocused();
  await expect(page.locator('#name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#email')).toHaveAttribute('aria-describedby', 'email-error');
  await fillRequest(page); await page.getByLabel('Target timing').selectOption('Specific date');
  await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page.getByText('Please choose a valid desired date.', { exact: true }).last()).toBeVisible();
});
test('real local endpoint returns signed mock confirmation and neutral direct visit', async ({ page, context }) => {
  await page.goto('/contact/thanks'); await expect(page.getByRole('heading', { level: 1 })).toHaveText('Let’s start with your project.');
  await page.goto('/contact'); await fillRequest(page);
  const response = page.waitForResponse(r => r.url().endsWith('/api/inquiries'));
  await page.getByRole('button', { name: 'Send project request' }).click();
  const reply = await response; expect(reply.status()).toBe(200); expect((await reply.json()).mock).toBe(true);
  await expect(page).toHaveURL(/\/contact\/thanks$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test request received.');
  await expect(page.getByText(/No email was sent/)).toBeVisible();
  const cookie = (await context.cookies()).find(c => c.name === 'dm_inquiry_receipt'); expect(cookie?.httpOnly).toBe(true);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
test('uncertain retries preserve the exact payload; provider outage preserves inputs', async ({ page }) => {
  const payloads: string[] = [];
  await page.route('**/api/inquiries', async route => { payloads.push(route.request().postData()!); await route.fulfill({ status: 504, contentType: 'application/json', body: JSON.stringify({ ok: false, category: 'uncertain', message: 'I couldn’t confirm that your request was sent. Please retry or use email.' }) }); });
  await page.goto('/contact'); await fillRequest(page); await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page.locator('form').getByRole('alert')).toContainText('couldn’t confirm');
  await page.getByRole('button', { name: 'Retry project request' }).click();
  await expect.poll(() => payloads.length).toBe(2); expect(payloads[0]).toBe(payloads[1]);
  await expect(page.locator('#name')).toHaveValue('Preview Test');
  await page.unroute('**/api/inquiries');
  await page.route('**/api/inquiries', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, category: 'unavailable', message: 'The project form is temporarily unavailable.' }) }));
  await page.goto('/contact'); await fillRequest(page); await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page.locator('form').getByRole('alert')).toContainText('temporarily unavailable'); await expect(page.locator('#name')).toHaveValue('Preview Test');
});
test('unknown content returns 404; preview is noindex and fixture is clearly labeled', async ({ page, request }) => {
  expect((await request.get('/work/not-published')).status()).toBe(404);
  expect((await request.get('/not-a-page')).status()).toBe(404);
  const response = await page.goto('/work/layout-preview'); expect(response?.headers()['x-robots-tag']).toContain('noindex');
  await expect(page.getByText('Development fixture.', { exact: false }).first()).toBeVisible();
  const sitemap = await (await request.get('/sitemap.xml')).text(); expect(sitemap).not.toContain('layout-preview');
});
test('required screenshot set, reduced motion and 200% text remain usable', async ({ page }) => {
  test.setTimeout(60000); await mkdir(screens, { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    const size = width === 1440 ? 'desktop' : 'mobile';
    await page.goto('/'); await ready(page); await page.screenshot({ path: path.join(screens, `home-${size}.png`) });
    await page.screenshot({ path: path.join(screens, `home-${size}-full.png`), fullPage: true });
    await page.goto('/services'); await ready(page); await page.screenshot({ path: path.join(screens, `services-${size}.png`), fullPage: true });
    await page.locator('#floodlight-campaign-tracking').screenshot({ path: path.join(screens, `floodlight-${size}.png`) });
    await page.goto('/contact'); await ready(page); await page.screenshot({ path: path.join(screens, `contact-${size}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Send project request' }).click(); await page.screenshot({ path: path.join(screens, `contact-errors-${size}.png`), fullPage: true });
    await page.goto('/work'); await ready(page); await page.screenshot({ path: path.join(screens, `work-${size}.png`), fullPage: true });
    await page.goto('/work/layout-preview'); await ready(page); await page.screenshot({ path: path.join(screens, `case-fixture-${size}.png`), fullPage: true });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  // 200% desktop browser zoom corresponds to a 720 CSS-pixel viewport.
  await page.setViewportSize({ width: 720, height: 500 }); await page.goto('/contact');
  await expect(page.locator('#name')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
