import { expect, test } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that the page loaded
    expect(page.url()).toContain('localhost:3000');
  });

  test('should display the main heading', async ({ page }) => {
    await page.goto('/');

    // Check for the main heading
    const heading = page.getByRole('heading', {
      name: 'Model the complete school relocation journey.',
    });
    await expect(heading).toBeVisible();
  });

  test('should display the relocation program badge', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for the 2028 Relocation Program badge (use first() to avoid strict mode violation)
    const badge = page.getByText('2028 Relocation Program').first();
    await expect(badge).toBeVisible();
  });

  test('should have a valid title', async ({ page }) => {
    await page.goto('/');

    // Check page title matches School Relocation Planner
    await expect(page).toHaveTitle(/School Relocation Planner/);
  });

  test('should display call-to-action buttons', async ({ page }) => {
    await page.goto('/');

    // Check for primary action buttons
    await expect(page.getByRole('button', { name: 'View Latest Scenario' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compare Plans' })).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    // Check that content is visible
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check that heading is still visible on mobile
    const heading = page.getByRole('heading', {
      name: 'Model the complete school relocation journey.',
    });
    await expect(heading).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for console errors
    expect(consoleErrors).toHaveLength(0);
  });
});
