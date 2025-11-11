# Authentication & Authorization Setup

## Overview

Complete authentication and authorization infrastructure for Week 3 Day 1-2.

**Status**: ✅ Complete  
**Date**: 2025-11-10

---

## What's Been Implemented

### 1. Supabase Client Configuration

- **Server Client** (`src/lib/supabase/server.ts`): For Server Components, API Routes, Server Actions
- **Client Client** (`src/lib/supabase/client.ts`): For Client Components and client-side code
- Uses `@supabase/ssr` for proper Next.js App Router integration

### 2. Session Management

- **`getServerSession()`**: Get current session from server-side
- **`getServerUser()`**: Get current user from server-side
- **`requireAuth()`**: Require authentication (throws if not authenticated)
- **`requireRole()`**: Require specific role (throws if insufficient permissions)

### 3. Role-Based Access Control (RBAC)

- **Role Hierarchy**: ADMIN > ANALYST > VIEWER
- **`canPerformAction()`**: Check if user can perform specific action
- **`canAccessResource()`**: Check if user can access specific resource
- **`getAllowedActions()`**: Get all allowed actions for a role

### 4. Auth Middleware

- **Route Protection**: Automatically protects routes based on configuration
- **Role Checking**: Validates user roles for protected routes
- **Redirect Handling**: Redirects unauthenticated users to login

### 5. Auth Utilities

- **`loginWithPassword()`**: Email/password login
- **`loginWithMagicLink()`**: Magic link login
- **`logout()`**: Logout user
- **`registerUser()`**: Register new user (admin only, requires service role key)
- **`updateUserRole()`**: Update user role (admin only)
- **`sendPasswordReset()`**: Send password reset email
- **`updatePassword()`**: Update user password

### 6. API Routes

- **`POST /api/auth/login`**: Login endpoint
- **`POST /api/auth/logout`**: Logout endpoint
- **`GET /api/auth/session`**: Get current session

---

## Usage Examples

### Server Component

```typescript
import { getServerUser } from '@/lib/auth/session';

export default async function Page() {
  const user = await getServerUser();
  
  if (!user) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Welcome, {user.email}</div>;
}
```

### API Route

```typescript
import { requireAuth } from '@/lib/auth/session';
import { canPerformAction } from '@/lib/auth/rbac';

export async function POST(request: Request) {
  const session = await requireAuth();
  
  const canEdit = canPerformAction(session.user.role, 'versions:edit');
  if (!canEdit.allowed) {
    return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
  }
  
  // Continue with request
}
```

### Client Component

```typescript
'use client';

import { loginWithPassword } from '@/lib/auth/utils';

export function LoginForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await loginWithPassword(email, password);
    if (error) {
      console.error('Login failed:', error);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Protected Routes Configuration

Routes are protected in `src/lib/auth/middleware.ts`:

```typescript
const PROTECTED_ROUTES: ProtectedRoute[] = [
  { path: '/admin', roles: ['ADMIN'] },
  { path: '/versions', roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
  { path: '/compare', roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
  { path: '/reports', roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
];
```

---

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional (for admin user creation):

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Next Steps

1. **Week 3 Day 3-4**: Create auth UI (login page, registration page, password reset)
2. **Week 3 Day 5**: User management (CRUD operations, role assignment)

---

## Files Created

- `src/types/auth.ts` - Auth types
- `src/types/database.ts` - Database types
- `src/lib/supabase/client.ts` - Client-side Supabase client
- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/lib/auth/session.ts` - Session management
- `src/lib/auth/rbac.ts` - Role-based access control
- `src/lib/auth/middleware.ts` - Auth middleware
- `src/lib/auth/utils.ts` - Auth utilities
- `src/middleware.ts` - Next.js middleware
- `src/app/api/auth/login/route.ts` - Login API
- `src/app/api/auth/logout/route.ts` - Logout API
- `src/app/api/auth/session/route.ts` - Session API

---

**Last Updated**: 2025-11-10

