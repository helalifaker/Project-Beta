# School Relocation Planner — API Conventions

## Overview

This document defines the API design conventions, patterns, and best practices for the School Relocation Planner application.

**Version**: 1.0  
**Last Updated**: 2025-11-10  
**Status**: Phase 0 - Foundation (Week 2)

---

## API Design Principles

### 1. RESTful Design
- Use standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Use resource-based URLs
- Return appropriate HTTP status codes
- Use JSON for request/response bodies

### 2. Versioning
- All APIs are versioned: `/api/v1/`
- Future breaking changes will use `/api/v2/`
- Version in URL path, not headers

### 3. Consistency
- Consistent error response format
- Consistent pagination format
- Consistent filtering/sorting conventions

### 4. Security First
- All routes require authentication (except `/api/auth/*`)
- Role-based authorization checks
- Input validation at API boundary
- Rate limiting on all public endpoints

### 5. Performance
- Use Edge Runtime for read operations
- Implement caching headers
- Support pagination for large datasets
- Optimize database queries

---

## API Structure

### Base URL

```
Production:  https://app.example.com/api/v1
Development: http://localhost:3000/api/v1
```

### Resource Naming

- **Plural nouns**: `/api/v1/versions`, `/api/v1/assumptions`
- **Nested resources**: `/api/v1/versions/{id}/assumptions`
- **Actions**: `/api/v1/versions/{id}/generate-statements`
- **Collections**: `/api/v1/versions/{id}/comparisons`

---

## Request Format

### Headers

```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-Request-ID: {uuid}  # Optional, for tracing
```

### Authentication

All API routes (except `/api/auth/*`) require authentication:

```typescript
// In API route handler
import { getServerSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  const session = await getServerSession();
  
  if (!session) {
    return Response.json(
      { error: 'UNAUTHORIZED', message: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Continue with request
}
```

### Request Body

```json
{
  "field1": "value1",
  "field2": 123,
  "field3": {
    "nested": "value"
  }
}
```

---

## Response Format

### Success Response (200 OK)

```json
{
  "data": {
    "id": "uuid",
    "name": "Version Name",
    "status": "DRAFT"
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z"
  }
}
```

### Success Response (201 Created)

```json
{
  "data": {
    "id": "uuid",
    "name": "New Version",
    "status": "DRAFT",
    "createdAt": "2025-11-10T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "fields": {
    "name": ["Name is required"],
    "baseAmount": ["Base amount must be positive"]
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z",
    "requestId": "uuid"
  }
}
```

### Error Response (401 Unauthorized)

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required",
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z"
  }
}
```

### Error Response (403 Forbidden)

```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions",
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z"
  }
}
```

### Error Response (404 Not Found)

```json
{
  "error": "NOT_FOUND",
  "message": "Resource not found",
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z",
    "resource": "version",
    "id": "uuid"
  }
}
```

### Error Response (500 Internal Server Error)

```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z",
    "requestId": "uuid"
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate name) |
| 422 | Unprocessable Entity | Business logic validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Pagination

### Request

```http
GET /api/v1/versions?page=1&limit=20&sort=createdAt&order=desc
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Field to sort by (default: `createdAt`)
- `order`: Sort order (`asc` or `desc`, default: `desc`)

### Response

```json
{
  "data": [
    { "id": "uuid1", "name": "Version 1" },
    { "id": "uuid2", "name": "Version 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z"
  }
}
```

---

## Filtering

### Request

```http
GET /api/v1/versions?status=DRAFT&ownerId=uuid&createdAfter=2025-01-01
```

**Conventions**:
- Filter by exact match: `?status=DRAFT`
- Filter by range: `?createdAfter=2025-01-01&createdBefore=2025-12-31`
- Filter by array: `?status=DRAFT,READY`
- Filter by relation: `?ownerId=uuid`

### Response

```json
{
  "data": [...],
  "filters": {
    "status": "DRAFT",
    "ownerId": "uuid",
    "createdAfter": "2025-01-01"
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00Z"
  }
}
```

---

## Sorting

### Request

```http
GET /api/v1/versions?sort=name&order=asc
GET /api/v1/versions?sort=createdAt,status&order=desc,asc
```

**Conventions**:
- Single sort: `?sort=name&order=asc`
- Multiple sorts: `?sort=createdAt,status&order=desc,asc`
- Default: `createdAt` descending

---

## API Route Patterns

### Standard CRUD Pattern

```typescript
// src/app/api/v1/versions/route.ts
import { getServerSession } from '@/lib/auth/session';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

const CreateVersionSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().optional(),
  rentModelType: z.enum(['FIXED_ESC', 'REV_SHARE', 'PARTNER']),
});

export const runtime = 'edge'; // For read operations

export async function GET(request: Request) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session) {
      return Response.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const status = searchParams.get('status');

    // 3. Build query
    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    // 4. Fetch data
    const [versions, total] = await Promise.all([
      prisma.version.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.version.count({ where }),
    ]);

    // 5. Return response
    return Response.json({
      data: versions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('GET /api/v1/versions error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred',
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session) {
      return Response.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Authorize (check role)
    if (session.user.role !== 'ADMIN' && session.user.role !== 'ANALYST') {
      return Response.json(
        { error: 'FORBIDDEN', message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // 3. Parse and validate input
    const body = await request.json();
    const validatedData = CreateVersionSchema.parse(body);

    // 4. Business logic
    const version = await prisma.version.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
        status: 'DRAFT',
      },
    });

    // 5. Return response
    return Response.json(
      {
        data: version,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          fields: error.flatten().fieldErrors,
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    console.error('POST /api/v1/versions error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred',
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
```

### Resource Detail Pattern

```typescript
// src/app/api/v1/versions/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const version = await prisma.version.findUnique({
      where: { id: params.id },
      include: {
        assumptions: true,
        owner: true,
      },
    });

    if (!version) {
      return Response.json(
        {
          error: 'NOT_FOUND',
          message: 'Version not found',
          meta: {
            resource: 'version',
            id: params.id,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    return Response.json({
      data: version,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('GET /api/v1/versions/[id] error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred',
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
```

### Action Pattern

```typescript
// src/app/api/v1/versions/[id]/generate-statements/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check version exists and user has access
    const version = await prisma.version.findUnique({
      where: { id: params.id },
    });

    if (!version) {
      return Response.json(
        {
          error: 'NOT_FOUND',
          message: 'Version not found',
          meta: {
            resource: 'version',
            id: params.id,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // Generate statements
    const statements = await generateFinancialStatements(params.id);

    return Response.json({
      data: statements,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('POST /api/v1/versions/[id]/generate-statements error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred',
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
```

---

## Rate Limiting

All public endpoints are rate-limited:

```typescript
import { ratelimit } from '@/lib/security/ratelimit';

export async function POST(request: Request) {
  // Rate limit check
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return Response.json(
      {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 429 }
    );
  }
  
  // Continue with request
}
```

**Limits**:
- Authenticated: 100 requests/minute
- Unauthenticated: 10 requests/minute

---

## Caching

### Cache Headers

```typescript
// For cacheable responses
return Response.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  },
});
```

### Cache Invalidation

```typescript
// After mutations
import { revalidatePath } from 'next/cache';

await prisma.version.update({ ... });
revalidatePath('/api/v1/versions');
```

---

## API Endpoints Reference

### Versions

- `GET /api/v1/versions` — List versions (paginated, filtered)
- `POST /api/v1/versions` — Create version
- `GET /api/v1/versions/{id}` — Get version detail
- `PUT /api/v1/versions/{id}` — Update version
- `DELETE /api/v1/versions/{id}` — Delete version
- `POST /api/v1/versions/{id}/generate-statements` — Generate financial statements
- `POST /api/v1/versions/{id}/validate` — Validate version assumptions

### Assumptions

- `GET /api/v1/versions/{id}/assumptions` — Get assumptions
- `PUT /api/v1/versions/{id}/assumptions` — Update assumptions

### Comparisons

- `GET /api/v1/compare` — List comparison sets
- `POST /api/v1/compare` — Create comparison set
- `GET /api/v1/compare/{id}` — Get comparison detail

### Admin

- `GET /api/v1/admin/workspace` — Get workspace settings
- `PUT /api/v1/admin/workspace` — Update workspace settings
- `GET /api/v1/admin/templates` — List curriculum templates
- `POST /api/v1/admin/templates` — Create curriculum template

---

## Testing API Routes

### Unit Test Example

```typescript
// src/app/api/v1/versions/route.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { GET, POST } from './route';
import { getServerSession } from '@/lib/auth/session';

vi.mock('@/lib/auth/session');

describe('GET /api/v1/versions', () => {
  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    
    const request = new Request('http://localhost/api/v1/versions');
    const response = await GET(request);
    
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('UNAUTHORIZED');
  });
  
  it('should return versions if authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'uuid', role: 'ANALYST' },
    });
    
    const request = new Request('http://localhost/api/v1/versions');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toBeDefined();
  });
});
```

---

## References

- [Architecture Documentation](./ARCHITECTURE.md)
- [Folder Structure](./FOLDER_STRUCTURE.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Zero Error Development Guide](../ZERO_ERROR_DEVELOPMENT_GUIDE.md)

---

**Last Updated**: 2025-11-10  
**Maintained By**: Development Team

