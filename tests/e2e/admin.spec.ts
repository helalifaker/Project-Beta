import type { Page, Route } from '@playwright/test';
import { expect, test } from '@playwright/test';

/**
 * Setup authentication for admin tests
 * Mocks Supabase session and profile API calls
 */
async function setupAuth(page: Page): Promise<void> {
  // Mock Supabase auth session API (used by middleware)
  await page.route('**/auth/v1/session**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {
          id: 'mock-user-id',
          email: 'admin@example.com',
          aud: 'authenticated',
          role: 'authenticated',
        },
      }),
    });
  });

  // Mock Supabase profile query (used by middleware to check role)
  await page.route('**/rest/v1/profile**', async (route: Route) => {
    // Handle select query
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'profile-id',
            external_id: 'mock-user-id',
            email: 'admin@example.com',
            role: 'ADMIN',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]),
      });
    } else {
      await route.continue();
    }
  });

  // Mock session API route (used by client components)
  await page.route('**/api/auth/session', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          user: {
            id: 'profile-id',
            email: 'admin@example.com',
            role: 'ADMIN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      }),
    });
  });

  // Set auth cookies to simulate authenticated session
  // Supabase SSR uses specific cookie names
  const cookies = [
    {
      name: 'sb-access-token',
      value: 'mock-access-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax' as const,
    },
    {
      name: 'sb-refresh-token',
      value: 'mock-refresh-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax' as const,
    },
  ];

  await page.context().addCookies(cookies);
}

test.describe('Admin flows', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('admin dashboard renders navigation cards', async ({ page }) => {
    // Mock any API calls that might be made
    await page.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto('/admin');

    // Wait for page to load and Suspense to resolve
    await page.waitForLoadState('networkidle');

    // Wait for the heading with a longer timeout
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible({
      timeout: 20000,
    });

    // Wait for cards to render
    await page.waitForSelector('[role="link"]:has-text("Manage")', { timeout: 10000 });

    const manageButtons = page.getByRole('link', { name: 'Manage' });
    await expect(manageButtons.first()).toBeVisible();

    // Check that we have at least some manage buttons (may be 6 or more)
    const count = await manageButtons.count();
    expect(count).toBeGreaterThanOrEqual(6);

    const sections = [
      'Workspace Settings',
      'Curriculum Templates',
      'Rent Templates',
      'Capex Rules',
      'User Management',
      'Audit Log',
    ];

    for (const title of sections) {
      await expect(page.getByText(title, { exact: true })).toBeVisible({ timeout: 5000 });
    }
  });

  test('workspace settings form loads and submits updates', async ({ page }) => {
    await setupAuth(page);

    const initialWorkspace = {
      name: 'Default Workspace',
      baseCurrency: 'SAR',
      timezone: 'Asia/Riyadh',
      discountRate: 0.08,
      cpiMin: 0.02,
      cpiMax: 0.05,
    };

    let capturedUpdateBody: Record<string, unknown> | null = null;

    // Mock workspace API
    await page.route('**/api/v1/admin/workspace', async (route: Route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: initialWorkspace }),
        });
        return;
      }

      if (method === 'PUT') {
        const payload = route.request().postData();
        capturedUpdateBody = payload ? JSON.parse(payload) : null;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              ...initialWorkspace,
              ...(capturedUpdateBody ?? {}),
            },
          }),
        });
        return;
      }

      await route.fallback();
    });

    await page.goto('/admin/workspace');

    // Wait for Suspense boundary to resolve and form to load
    await page.waitForLoadState('networkidle');

    // Wait for form label with longer timeout
    await page.waitForSelector('label', { timeout: 15000 });

    // Try to find the input by label text, fallback to placeholder
    let nameInput = page.getByLabel('Workspace Name');
    const inputCount = await nameInput.count();

    if (inputCount === 0) {
      // Fallback: try to find by placeholder or name attribute
      nameInput = page
        .locator('input[name="name"], input[placeholder*="Workspace"], input[placeholder*="name"]')
        .first();
    }

    await expect(nameInput.first()).toBeVisible({ timeout: 10000 });

    const inputValue = await nameInput.first().inputValue();
    expect(inputValue).toContain('Default');

    await nameInput.first().fill('Updated Workspace');

    // Wait for button and click
    const saveButton = page.getByRole('button', { name: /Save/i });
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();

    // Wait for success message (may take a moment)
    await expect(page.getByText(/Settings saved|success/i).first()).toBeVisible({ timeout: 10000 });

    expect(capturedUpdateBody).not.toBeNull();
    const updateBody = capturedUpdateBody as { name: string } | null;
    expect(updateBody?.name).toBe('Updated Workspace');
  });

  test('audit log page shows entries and filters', async ({ page }) => {
    await setupAuth(page);

    // Mock audit log API
    await page.route('**/api/v1/admin/audit-log**', async (route: Route) => {
      const url = new URL(route.request().url());
      const entityType = url.searchParams.get('entityType') ?? 'all';

      const responsePayload =
        entityType === 'version'
          ? {
              data: [
                {
                  id: 'entry-2',
                  action: 'UPDATE',
                  entityType: 'version',
                  entityId: 'ver-2',
                  metadata: {},
                  createdAt: new Date('2024-02-02T10:00:00.000Z').toISOString(),
                  actor: { email: 'analyst@example.com', role: 'ANALYST' },
                },
              ],
              pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
            }
          : {
              data: [
                {
                  id: 'entry-1',
                  action: 'CREATE',
                  entityType: 'template',
                  entityId: 'tmpl-1',
                  metadata: {},
                  createdAt: new Date('2024-02-01T09:00:00.000Z').toISOString(),
                  actor: { email: 'admin@example.com', role: 'ADMIN' },
                },
              ],
              pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
            };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responsePayload),
      });
    });

    await page.goto('/admin/audit-log');

    // Wait for Suspense boundary to resolve and page to load
    await page.waitForLoadState('networkidle');

    // Wait for the heading with longer timeout
    await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText('CREATE template')).toBeVisible();

    await page.getByLabel('Entity Type').click();
    await page.getByRole('option', { name: 'Version' }).click();

    await expect(page.getByText('UPDATE version')).toBeVisible();
  });
});
