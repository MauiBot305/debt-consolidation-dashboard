import { defineConfig, devices } from '@playwright/test';

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://a81c66cd.debt-consolidation-dashboard-8e1.pages.dev';

export default defineConfig({
  testDir: './tests',
  timeout: 15 * 60 * 1000,
  expect: {
    timeout: 10_000,
  },
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: DASHBOARD_URL,
    trace: 'off',
    video: 'off',
    screenshot: 'off',
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});
