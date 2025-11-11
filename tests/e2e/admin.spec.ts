import { expect, test } from '@playwright/test';

/**
 * Setup authentication for admin tests
 * Mocks Supabase session and profile API calls
 */
async function setupAuth(page: Awaited<ReturnType<typeof test>['page']>) {
  // Mock Supabase auth session API (used by middleware)
  await page.route('**/auth/v1/session**', async (route) => {
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
  await page.route('**/rest/v1/profile**', async (route) => {
    const url = new URL(route.request().url());
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
  await page.route('**/api/auth/session', async (route) => {
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
    await page.goto('/admin');

    // Wait for page to load and Suspense to resolve
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Admin Dashboard")', { timeout: 10000 });

    await expect(
      page.getByRole('heading', { name: 'Admin Dashboard' }),
    ).toBeVisible();

    const manageButtons = page.getByRole('link', { name: 'Manage' });
    await expect(manageButtons).toHaveCount(6);

    const sections = [
      'Workspace Settings',
      'Curriculum Templates',
      'Rent Templates',
      'Capex Rules',
      'User Management',
      'Audit Log',
    ];

    for (const title of sections) {
      await expect(page.getByText(title, { exact: true })).toBeVisible();
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

    await page.route('**/api/v1/admin/workspace', async (route) => {
      const { method } = route.request();

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
    await page.waitForSelector('label:has-text("Workspace Name")', { timeout: 10000 });

    const nameInput = page.getByLabel('Workspace Name');
    await expect(nameInput).toHaveValue('Default Workspace');

    await nameInput.fill('Updated Workspace');
    await page.getByRole('button', { name: 'Save Settings' }).click();

    await expect(
      page.getByText('Settings saved successfully'),
    ).toBeVisible();

    expect(capturedUpdateBody).not.toBeNull();
    expect(capturedUpdateBody?.name).toBe('Updated Workspace');
  });

  test('audit log page shows entries and filters', async ({ page }) => {
    await setupAuth(page);

    await page.route('**/api/v1/admin/audit-log**', async (route) => {
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
    await page.waitForSelector('h1:has-text("Audit Log")', { timeout: 10000 });

    await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
    await expect(page.getByText('CREATE template')).toBeVisible();

    await page.getByLabel('Entity Type').click();
    await page.getByRole('option', { name: 'Version' }).click();

    await expect(page.getByText('UPDATE version')).toBeVisible();
  });
});


