import { defineConfig, devices } from '@playwright/test';

// Build first. A fake form ID and intercepted requests prevent real delivery.
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'formspree.spec.ts', workers: 1,
  use: { baseURL: 'http://127.0.0.1:3002' },
  projects: [
    { name: 'chrome', use: { browserName: 'chromium', channel: 'chrome' } },
    { name: 'iphone-webkit', use: { ...devices['iPhone 13'], browserName: 'webkit' } },
  ],
  webServer: {
    command: 'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3002',
    url: 'http://127.0.0.1:3002', reuseExistingServer: false,
    env: { FORMSPREE_FORM_ID: 'testform' },
  },
});
