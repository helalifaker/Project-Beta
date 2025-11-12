# E2E Test CI Fixes

## Issues Identified

### 1. **WebServer Configuration Issue**

**Problem**: The Playwright config was using `pnpm dev` for both local and CI environments. In CI:

- Dev server is slower and may timeout
- Should test against production build (more realistic)
- CI already builds the app, so should use `pnpm start`

**Fix**: Updated `playwright.config.ts` to:

- Use `pnpm start` (production build) in CI
- Use `pnpm dev` (dev server) locally
- Increased timeout to 180 seconds for CI
- Added proper environment variables

### 2. **Missing Environment Variables in CI**

**Problem**: The E2E test step in CI didn't have all required environment variables for the production server to start.

**Fix**: Added all required env vars to the E2E test step:

- `NODE_ENV: production`
- `PORT: '3000'`
- `DATABASE_URL` and `DIRECT_URL` (for Prisma)
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. **Timeout Issues**

**Problem**: 15-minute timeout might not be enough for build + server start + tests in CI.

**Fix**: Increased timeout to 20 minutes for E2E tests.

## Changes Made

### `playwright.config.ts`

- Conditional `webServer` config based on `CI` environment variable
- CI: Uses `pnpm start` with production build
- Local: Uses `pnpm dev` with dev server
- Increased timeout to 180 seconds for CI

### `.github/workflows/ci.yml`

- Added `NODE_ENV: production` to E2E test step
- Added `PORT: '3000'` environment variable
- Added `DATABASE_URL` and `DIRECT_URL` to E2E test step
- Increased timeout to 20 minutes

## Testing

To test locally:

```bash
# Test with production build (simulates CI)
CI=true pnpm build && CI=true pnpm test:e2e

# Test with dev server (normal development)
pnpm test:e2e
```

## Expected Behavior

1. **CI Environment**:
   - Builds the app (`pnpm build`)
   - Starts production server (`pnpm start`)
   - Runs E2E tests against production build
   - More reliable and faster than dev server

2. **Local Environment**:
   - Starts dev server (`pnpm dev`)
   - Runs E2E tests against dev server
   - Faster iteration for development

## Notes

- The middleware deprecation warning is harmless and doesn't affect functionality
- React Hook Form compatibility warnings are expected and don't cause failures
- All smoke tests should pass as the home page is public (no auth required)
- Admin tests use mocked authentication, so they should work in CI
