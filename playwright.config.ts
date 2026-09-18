import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'site.spec.ts', fullyParallel: false, workers: 1, retries: 0,
  timeout: 30000, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3000', browserName: 'chromium', channel: 'chrome', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:3000', reuseExistingServer: true, timeout: 60000 },
});
