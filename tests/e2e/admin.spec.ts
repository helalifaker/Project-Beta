import type { Page, Route } from '@playwright/test';
import { expect, test } from '@playwright/test';

/**
 * Setup authentication for admin tests
 * Mocks Supabase session and profile API calls
 */
async function setupAuth(page: Page): Promise<void> {
  // Get Supabase URL from environment or use default
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'test';

  // Mock all Supabase auth API endpoints (used by middleware and server components)
  // The middleware calls supabase.auth.getSession() which makes HTTP requests
  await page.route('**/auth/v1/session**', async (route: Route) => {
    // Handle GET requests for session validation
    if (route.request().method() === 'GET') {
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
            app_metadata: {},
            user_metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock Supabase profile query (used by middleware to check role)
  // The middleware queries: .from('profile').select('role').eq('external_id', session.user.id).single()
  // PostgREST format: /rest/v1/profile?select=role&external_id=eq.mock-user-id
  await page.route('**/rest/v1/profile**', async (route: Route) => {
    const url = new URL(route.request().url());

    // Handle GET requests
    if (route.request().method() === 'GET') {
      const profileData = {
        id: 'profile-id',
        external_id: 'mock-user-id',
        email: 'admin@example.com',
        role: 'ADMIN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if this matches the middleware query
      // PostgREST uses format: external_id=eq.mock-user-id
      const externalIdParam = url.searchParams.get('external_id');
      const hasSelect = url.searchParams.has('select');
      const isMiddlewareQuery =
        hasSelect &&
        (externalIdParam === 'eq.mock-user-id' ||
          externalIdParam?.startsWith('eq.') ||
          url.searchParams.toString().includes('external_id'));

      // Check if it's a single query (.single() adds Prefer: return=representation header)
      const headers = route.request().headers();
      const preferHeader = headers['prefer'] || headers['Prefer'] || '';
      const isSingleQuery = isMiddlewareQuery || preferHeader.includes('return=representation');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Content-Type': 'application/json',
          'Content-Range': isSingleQuery ? '*/1' : '0-0/1',
        },
        body: JSON.stringify(isSingleQuery ? profileData : [profileData]),
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

  // Set auth cookies in the format that Supabase SSR expects
  // Supabase SSR uses cookies with names like: sb-<project-ref>-auth-token
  // The cookie value should be a JSON stringified session object
  const sessionData = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'mock-user-id',
      email: 'admin@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  const cookies = [
    {
      name: `sb-${projectRef}-auth-token`,
      value: JSON.stringify(sessionData),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax' as const,
      expires: Math.floor(Date.now() / 1000) + 3600,
    },
  ];

  // Set cookies before navigating
  await page.context().addCookies(cookies);

  // Set test cookies for test mode (bypasses Supabase HTTP requests)
  // The middleware checks these first in test mode
  await page.context().addCookies([
    {
      name: 'test-user-id',
      value: 'mock-user-id',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax' as const,
    },
    {
      name: 'test-user-role',
      value: 'ADMIN',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax' as const,
    },
  ]);

  // Also intercept and modify any requests to Supabase to ensure they return the mocked data
  // This handles cases where the Supabase client might use different URL patterns
  await page.route('**/*supabase*/auth/v1/session**', async (route: Route) => {
    if (route.request().method() === 'GET') {
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
            app_metadata: {},
            user_metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Also intercept Supabase-specific URLs (in case they use full URLs)
  await page.route('**/*supabase*/rest/v1/profile**', async (route: Route) => {
    const url = new URL(route.request().url());
    if (route.request().method() === 'GET') {
      const profileData = {
        id: 'profile-id',
        external_id: 'mock-user-id',
        email: 'admin@example.com',
        role: 'ADMIN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if this matches the middleware query (PostgREST format)
      const externalIdParam = url.searchParams.get('external_id');
      const hasSelect = url.searchParams.has('select');
      const isMiddlewareQuery =
        hasSelect &&
        (externalIdParam === 'eq.mock-user-id' ||
          externalIdParam?.startsWith('eq.') ||
          url.searchParams.toString().includes('external_id'));

      const headers = route.request().headers();
      const preferHeader = headers['prefer'] || headers['Prefer'] || '';
      const isSingleQuery = isMiddlewareQuery || preferHeader.includes('return=representation');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Content-Type': 'application/json',
          'Content-Range': isSingleQuery ? '*/1' : '0-0/1',
        },
        body: JSON.stringify(isSingleQuery ? profileData : [profileData]),
      });
    } else {
      await route.continue();
    }
  });
}

test.describe('Admin flows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication before each test
    // This sets cookies and mocks Supabase requests
    await setupAuth(page);

    // Ensure test mode is enabled by setting environment variable
    // This is handled by the X-Test-Mode header in playwright.config.ts
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

    // Navigate and wait for either the page to load or a redirect
    const response = await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Check if we were redirected (status 307/308)
    if (response && (response.status() === 307 || response.status() === 308)) {
      // Wait for the redirect to complete
      await page.waitForURL('**/admin', { timeout: 10000 });
    }

    // Wait for page to load and Suspense to resolve
    await page.waitForLoadState('networkidle');

    // Check if we're on the unauthorized page
    const currentUrl = page.url();
    if (currentUrl.includes('/unauthorized') || currentUrl.includes('/login')) {
      throw new Error(`Unexpected redirect to ${currentUrl}. Auth setup may be incorrect.`);
    }

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

    // Navigate and wait for either the page to load or a redirect
    const response = await page.goto('/admin/workspace', { waitUntil: 'domcontentloaded' });

    // Check if we were redirected
    if (response && (response.status() === 307 || response.status() === 308)) {
      await page.waitForURL('**/admin/workspace', { timeout: 10000 });
    }

    // Wait for Suspense boundary to resolve and form to load
    await page.waitForLoadState('networkidle');

    // Check if we're on the unauthorized page
    const currentUrl = page.url();
    if (currentUrl.includes('/unauthorized') || currentUrl.includes('/login')) {
      throw new Error(`Unexpected redirect to ${currentUrl}. Auth setup may be incorrect.`);
    }

    // Wait for the page heading first
    await expect(page.getByRole('heading', { name: 'Workspace Settings' })).toBeVisible({
      timeout: 15000,
    });

    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 15000 });

    // Try to find the input by label text, fallback to placeholder
    let nameInput = page.getByLabel('Workspace Name');
    const inputCount = await nameInput.count();

    if (inputCount === 0) {
      // Fallback: try to find by placeholder or name attribute
      nameInput = page
        .locator('input[name="name"], input[placeholder*="Workspace"], input[placeholder*="name"]')
        .first();
    }

    await expect(nameInput.first()).toBeVisible({ timeout: 15000 });

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

    // Navigate and wait for either the page to load or a redirect
    const response = await page.goto('/admin/audit-log', { waitUntil: 'domcontentloaded' });

    // Check if we were redirected
    if (response && (response.status() === 307 || response.status() === 308)) {
      await page.waitForURL('**/admin/audit-log', { timeout: 10000 });
    }

    // Wait for Suspense boundary to resolve and page to load
    await page.waitForLoadState('networkidle');

    // Check if we're on the unauthorized page
    const currentUrl = page.url();
    if (currentUrl.includes('/unauthorized') || currentUrl.includes('/login')) {
      throw new Error(`Unexpected redirect to ${currentUrl}. Auth setup may be incorrect.`);
    }

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
