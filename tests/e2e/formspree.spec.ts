import { test, expect, type Page } from '@playwright/test';

async function fill(page: Page) {
  await page.locator('#name').fill('Form integration test');
  await page.locator('#email').fill('form-test@example.com');
  await page.locator('#website').fill('EXAMPLE.com/Contact?Ref=Campaign#Top');
  await expect(page.locator('#website')).toHaveValue('example.com/contact?ref=campaign#top');
  await page.locator('#description').fill('Synthetic inquiry for intercepted integration testing.');
}

test('validates, submits once, and confirms only after acceptance', async ({ page }) => {
  let requests = 0;
  await page.route('https://formspree.io/**', async route => {
    requests++;
    expect(route.request().url()).toBe('https://formspree.io/f/testform');
    const payload = route.request().postDataJSON();
    expect(payload.email).toBe('form-test@example.com');
    expect(payload.website).toBe('https://example.com/contact?ref=campaign#top');
    expect(payload.message).toContain('Synthetic inquiry');
    expect(payload._gotcha).toBe('');
    await new Promise(resolve => setTimeout(resolve, 300));
    await route.fulfill({ json: { next: '/thanks', ok: true } });
  });
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page.locator('form').getByRole('alert')).toBeFocused();
  expect(requests).toBe(0);
  await fill(page);
  await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Thanks for the details.' })).toBeVisible();
  await expect(page.getByText('Your project request has been received. I typically get back in 1-2 business days.', { exact: true })).toBeVisible();
  expect(requests).toBe(1);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Thanks for the details.' })).toHaveCount(0);
});

test('provider rejection preserves fields and permits correction', async ({ page }) => {
  await page.route('https://formspree.io/**', route => route.fulfill({ status: 422, json: { errors: [{ field: 'email', code: 'TYPE_EMAIL', message: 'Enter a deliverable email address.' }] } }));
  await page.goto('/contact'); await fill(page);
  await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#name')).toHaveValue('Form integration test');
  await expect(page.locator('#email')).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'Thanks for the details.' })).toHaveCount(0);
});

test('network failure never claims delivery or automatically retries', async ({ page }) => {
  let requests = 0;
  await page.route('https://formspree.io/**', route => { requests++; return route.abort('failed'); });
  await page.goto('/contact'); await fill(page);
  await page.getByRole('button', { name: 'Send project request' }).click();
  await expect(page.getByText('Your request may already have arrived. Retrying could send a second copy.')).toBeVisible();
  await expect(page.locator('#description')).toHaveValue('Synthetic inquiry for intercepted integration testing.');
  expect(requests).toBe(1);
});
