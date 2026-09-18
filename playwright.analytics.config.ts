import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', testMatch: 'analytics.spec.ts', workers: 1,
  use: { baseURL: 'http://127.0.0.1:3003' },
  projects: [
    { name: 'chrome', use: { browserName: 'chromium', channel: 'chrome' } },
    { name: 'iphone-webkit', use: { ...devices['iPhone 13'], browserName: 'webkit' } },
  ],
  webServer: { command: 'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3003', url: 'http://127.0.0.1:3003', reuseExistingServer: false, env: { ANALYTICS_TEST: '1', FORMSPREE_FORM_ID: 'testform' } },
});
