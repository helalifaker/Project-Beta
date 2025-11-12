import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: process.env.CI ? [['html'], ['github']] : 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Set test mode environment variable for middleware
    extraHTTPHeaders: {
      'X-Test-Mode': 'true',
    },
  },

  projects: process.env.CI
    ? [
        // In CI, only run chromium (matching GitHub Actions workflow)
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        // Local development: run all browsers
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
        // Mobile viewports
        {
          name: 'Mobile Chrome',
          use: { ...devices['Pixel 5'] },
        },
        {
          name: 'Mobile Safari',
          use: { ...devices['iPhone 12'] },
        },
      ],

  webServer: process.env.CI
    ? {
        // In CI, use production build (faster and more reliable)
        command: 'pnpm start',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 180 * 1000, // 3 minutes for CI (build + start can be slow)
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
          NODE_ENV: 'production',
          PORT: '3000',
        },
      }
    : {
        // Local development: use dev server
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true, // Reuse existing server if available (prevents port conflicts)
        timeout: 120 * 1000,
      },
});
