import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: 'html',
  use: {
    baseURL: 'https://www.instagram.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Firefox (Pixel 7)',
      use: { ...devices['Pixel 7'], browserName: 'firefox' },
    },
    {
      name: 'Mobile Firefox (Galaxy S23)',
      use: {
        ...devices['Galaxy S23'],
        browserName: 'firefox',
      },
    },
  ],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
});