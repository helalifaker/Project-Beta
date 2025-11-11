# Week 4: Base API & Data Layer — Complete

## Overview

Complete API infrastructure, database layer, and caching implementation for Week 4.

**Status**: ✅ Complete  
**Date**: 2025-11-10

---

## What's Been Implemented

### Day 1-2: API Infrastructure

#### 1. API Error Classes (`src/lib/api/errors.ts`)
- `ApiError` — Base error class
- `ValidationError` — 400 Bad Request
- `UnauthorizedError` — 401 Unauthorized
- `ForbiddenError` — 403 Forbidden
- `NotFoundError` — 404 Not Found
- `ConflictError` — 409 Conflict
- `RateLimitError` — 429 Too Many Requests
- `InternalServerError` — 500 Internal Server Error

#### 2. API Response Utilities (`src/lib/api/response.ts`)
- `successResponse()` — Standardized success responses
- `errorResponse()` — Standardized error responses
- `paginatedResponse()` — Paginated data responses

#### 3. API Middleware (`src/lib/api/middleware.ts`)
- `applyApiMiddleware()` — Unified middleware function
- `withErrorHandling()` — Error handling wrapper
- Supports: auth, authorization, body validation, query validation, rate limiting

#### 4. Validation Schemas (`src/lib/api/schemas.ts`)
- `paginationSchema` — Pagination parameters
- `sortSchema` — Sorting parameters
- `idParamSchema` — UUID validation
- `userRoleSchema` — User role enum
- `emailSchema` — Email validation
- `passwordSchema` — Password validation
- `dateRangeSchema` — Date range filters
- `filterSchema` — Generic filters

#### 5. Rate Limiting (`src/lib/security/ratelimit.ts`)
- `checkRateLimit()` — Check rate limit for identifier
- `getRateLimitHeaders()` — Get rate limit headers
- Uses `@upstash/ratelimit` with Redis
- Configurable limits and windows

### Day 3-4: Database Layer

#### 6. Repository Pattern (`src/lib/db/repository.ts`)
- `BaseRepository` — Abstract base class
- Methods: `findMany`, `findUnique`, `create`, `update`, `delete`, `count`
- Ready for soft delete extension

#### 7. User Repository (`src/lib/db/repositories/user-repository.ts`)
- `UserRepository` — User-specific repository
- Methods: `findByEmail`, `findByExternalId`, `findByRole`, `updateRole`
- Extends `BaseRepository`

#### 8. Transaction Utilities (`src/lib/db/transactions.ts`)
- `withTransaction()` — Execute function in transaction
- `parallelTransaction()` — Execute multiple operations in parallel

### Day 5: Caching & Performance

#### 9. Vercel KV Caching (`src/lib/cache/kv.ts`)
- `getCached()` — Get cached value
- `setCached()` — Set cached value
- `deleteCached()` — Delete cached value
- `getOrSetCached()` — Get or set pattern
- `invalidateCache()` — Invalidate cache by pattern

#### 10. React Cache API (`src/lib/cache/react-cache.ts`)
- `createCachedFunction()` — Create cached async function
- `generateCacheKey()` — Generate cache keys
- Request deduplication within React render

---

## Files Created (15 files)

### API Infrastructure
- `src/lib/api/errors.ts` — Error classes
- `src/lib/api/response.ts` — Response utilities
- `src/lib/api/middleware.ts` — Middleware functions
- `src/lib/api/schemas.ts` — Validation schemas
- `src/lib/api/example-route.ts` — Example usage
- `src/lib/api/middleware.spec.ts` — Middleware tests

### Database Layer
- `src/lib/db/repository.ts` — Base repository
- `src/lib/db/repositories/user-repository.ts` — User repository
- `src/lib/db/transactions.ts` — Transaction utilities
- `src/lib/db/repository.spec.ts` — Repository tests

### Caching & Performance
- `src/lib/cache/kv.ts` — Vercel KV utilities
- `src/lib/cache/react-cache.ts` — React Cache API utilities

### Security
- `src/lib/security/ratelimit.ts` — Rate limiting

---

## Usage Examples

### API Route with Middleware

```typescript
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { paginationSchema } from '@/lib/api/schemas';

export const GET = withErrorHandling(async (request: Request) => {
  const { session, query } = await applyApiMiddleware(request, {
    requireAuth: true,
    requireRole: 'ADMIN',
    validateQuery: paginationSchema,
  });

  // Use validated query and session
  const { page, limit } = query as { page: number; limit: number };
  
  // Business logic
  const data = await fetchData(page, limit);

  return successResponse(data);
});
```

### Repository Usage

```typescript
import { userRepository } from '@/lib/db/repositories/user-repository';

// Find user by email
const user = await userRepository.findByEmail('user@example.com');

// Update role
await userRepository.updateRole(userId, 'ADMIN');

// Create user
const newUser = await userRepository.create({
  email: 'new@example.com',
  role: 'ANALYST',
  externalId: 'supabase-user-id',
});
```

### Caching Usage

```typescript
import { getOrSetCached } from '@/lib/cache/kv';
import { generateCacheKey } from '@/lib/cache/react-cache';

const cacheKey = generateCacheKey('users', userId);

const user = await getOrSetCached(
  cacheKey,
  async () => {
    return await userRepository.findUnique({ id: userId });
  },
  { ttl: 300 } // Cache for 5 minutes
);
```

---

## Dependencies Added

- `@upstash/ratelimit@^2.1.2` — Rate limiting
- `@upstash/redis@^1.35.1` — Redis client for rate limiting
- `@vercel/kv@^1.2.1` — Vercel KV caching

---

## Quality Gates Met

- ✅ API routes respond correctly
- ✅ Validation works with Zod schemas
- ✅ Rate limiting infrastructure ready
- ✅ Errors handled gracefully with custom error classes
- ✅ Repository pattern implemented
- ✅ CRUD utilities available
- ✅ Caching layer functional
- ✅ React Cache API setup
- ✅ Tests written (middleware + repository)
- ✅ Zero linting errors
- ✅ TypeScript strict mode compliant

---

## Environment Variables Required

Add to `.env.local`:

```env
# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Vercel KV (for caching)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

---

## Next Steps

**Week 5**: Financial Engine
- Decimal.js setup
- Revenue calculations
- Staff cost calculations
- Rent calculations
- OpEx calculations
- Capex calculations

---

**Last Updated**: 2025-11-10

