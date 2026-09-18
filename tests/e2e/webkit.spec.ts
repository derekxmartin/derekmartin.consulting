import { test, expect } from '@playwright/test';
import path from 'node:path';
test('WebKit mobile pages, menu and local inquiry journey', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  for (const route of ['/', '/services', '/work', '/about', '/how-it-works', '/contact', '/privacy', '/getting-started', '/work/layout-preview']) {
    const response = await page.goto(route); expect(response?.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
  }
  await page.goto('/');
  await page.screenshot({ path: path.join('docs', 'screenshots', 'home-webkit-mobile.png') });
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused();
  await page.goto('/contact?service=floodlight-campaign-tracking');
  await expect(page.locator('#service')).toHaveValue('floodlight-campaign-tracking');
  await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page.locator('form').getByRole('alert')).toBeFocused();
  await page.locator('#name').fill('WebKit Preview');
  await page.locator('#email').fill('webkit-preview@example.com');
  await page.locator('#description').fill('A synthetic local WebKit test of the inquiry journey.');
  await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page).toHaveURL(/\/contact\/thanks$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test request received.');
  expect(errors).toEqual([]);
});
