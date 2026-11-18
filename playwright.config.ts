import { defineConfig, devices } from '@playwright/test';
import { ENV, ADMIN_STORAGE_STATE } from './config/env';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  timeout: 90_000,
  expect: { timeout: ENV.defaultTimeout },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  // The public demo is shared and rate-sensitive, so keep parallelism modest.
  workers: isCI ? 1 : 2,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['json', { outputFile: 'reports/test-results.json' }],
  ],

  use: {
    baseURL: ENV.baseUrl,
    headless: ENV.headless,
    actionTimeout: ENV.defaultTimeout,
    navigationTimeout: 45_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    testIdAttribute: 'data-testid',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, storageState: ADMIN_STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 }, storageState: ADMIN_STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
});
