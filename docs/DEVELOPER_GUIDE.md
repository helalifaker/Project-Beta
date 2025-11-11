# School Relocation Planner — Developer Guide

## Overview

This guide helps developers get started with the School Relocation Planner project, covering setup, development workflow, and best practices.

**Last Updated**: 2025-11-10  
**Status**: Phase 0 - Foundation (Week 2)

---

## Prerequisites

### Required Software

- **Node.js**: 20.x or higher
- **pnpm**: 8.x or higher
- **Git**: Latest version
- **VS Code** (recommended): With extensions (see below)

### Recommended VS Code Extensions

- **ESLint** — Code linting
- **Prettier** — Code formatting
- **Prisma** — Prisma schema syntax highlighting
- **Tailwind CSS IntelliSense** — Tailwind autocomplete
- **TypeScript Vue Plugin** — TypeScript support

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd school-relocation-planner
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Vercel KV (optional for local dev)
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# Sentry (optional for local dev)
SENTRY_DSN="..."
```

**Important**: Copy the exact connection strings from Supabase (pgBouncer for `DATABASE_URL`, direct for `DIRECT_URL`), including `sslmode=require`.

### 4. Set Up Database

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database (optional)
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Development Workflow

### Daily Checklist

1. ✅ Pull latest changes: `git pull origin main`
2. ✅ Install dependencies if `package.json` changed: `pnpm install`
3. ✅ Run migrations if schema changed: `pnpm prisma:migrate`
4. ✅ Start dev server: `pnpm dev`
5. ✅ Run tests: `pnpm test`
6. ✅ Check linting: `pnpm lint`

### Creating a New Feature

1. **Check Dependencies**
   - Read `DEPENDENCIES_MASTER.md` to ensure consistency
   - Verify no conflicts with existing dependencies

2. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Write Code**
   - Follow [CODE_WRITING_CONVENTIONS.md](../CODE_WRITING_CONVENTIONS.md)
   - Write tests alongside implementation
   - Add JSDoc comments

4. **Run Quality Checks**
   ```bash
   pnpm lint
   pnpm type-check
   pnpm test
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Project Structure

See [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for detailed structure.

### Key Directories

- `src/app/` — Next.js pages and API routes
- `src/components/` — React components
- `src/lib/` — Utility functions
- `prisma/` — Database schema and migrations
- `tests/` — Test files

---

## Code Standards

### TypeScript

- **Strict mode**: Always enabled
- **No `any` types**: Use proper types or `unknown`
- **Explicit return types**: All functions must have return types
- **Type imports**: Use `import type` for type-only imports

### Code Style

- **ESLint**: 0 errors, 0 warnings
- **Prettier**: Auto-format on save
- **Import ordering**: External → Internal → Types
- **Naming**: PascalCase (components), camelCase (functions), UPPER_SNAKE_CASE (constants)

### Testing

- **Unit tests**: Colocated with source (`*.spec.ts`)
- **E2E tests**: In `tests/e2e/`
- **Coverage**: 85%+ for financial modules
- **Golden datasets**: Use for financial engine tests

See [ZERO_ERROR_DEVELOPMENT_GUIDE.md](../ZERO_ERROR_DEVELOPMENT_GUIDE.md) for detailed standards.

---

## Database Development

### Creating a Migration

```bash
# Make changes to prisma/schema.prisma
pnpm prisma:migrate dev --name add_new_field
```

### Viewing Database

```bash
# Open Prisma Studio
pnpm prisma:studio
```

### Resetting Database (⚠️ Destructive)

```bash
# Reset database and run migrations
pnpm prisma:migrate reset
```

---

## API Development

### Creating an API Route

1. Create file: `src/app/api/v1/[resource]/route.ts`
2. Export handlers: `GET`, `POST`, `PUT`, `DELETE`
3. Add authentication/authorization
4. Add input validation (Zod)
5. Write tests

See [API_CONVENTIONS.md](./API_CONVENTIONS.md) for detailed patterns.

### Example API Route

```typescript
// src/app/api/v1/versions/route.ts
import { getServerSession } from '@/lib/auth/session';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

const CreateVersionSchema = z.object({
  name: z.string().min(3).max(200),
});

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const versions = await prisma.version.findMany();
  return Response.json({ data: versions });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await request.json();
  const validatedData = CreateVersionSchema.parse(body);

  const version = await prisma.version.create({
    data: validatedData,
  });

  return Response.json({ data: version }, { status: 201 });
}
```

---

## Component Development

### Creating a Component

1. Create file: `src/components/features/[feature]/[component-name].tsx`
2. Export component with PascalCase name
3. Add JSDoc comments
4. Write tests

### Example Component

```typescript
/**
 * VersionCard displays a version summary card
 * 
 * @param version - Version data to display
 * @param onEdit - Callback when edit button is clicked
 */
export function VersionCard({
  version,
  onEdit,
}: VersionCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{version.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{version.description}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={onEdit}>Edit</Button>
      </CardFooter>
    </Card>
  );
}
```

---

## Financial Engine Development

### Key Principles

1. **Use Decimal.js**: Never use JavaScript `number` for money
2. **Round at Display**: Round only when displaying, not during calculations
3. **Iterative Cash Engine**: Balance Sheet and Cash Flow converge iteratively
4. **Validation**: Validate all inputs before calculations

### Example Calculation

```typescript
import Decimal from 'decimal.js';

/**
 * Calculates rent NPV
 * 
 * @param schedule - Array of annual rent amounts
 * @param discountRate - Annual discount rate (e.g., 0.08 for 8%)
 * @param startYear - First year of schedule
 * @returns NPV rounded to 2 decimal places
 */
export function calculateRentNpv(
  schedule: number[],
  discountRate: number,
  startYear: number
): number {
  let npv = new Decimal(0);
  
  for (let i = 0; i < schedule.length; i++) {
    const year = startYear + i;
    const yearsFromStart = year - startYear;
    
    const presentValue = new Decimal(schedule[i])
      .dividedBy(new Decimal(1 + discountRate).pow(yearsFromStart));
    
    npv = npv.plus(presentValue);
  }
  
  return npv.toDecimalPlaces(2).toNumber();
}
```

---

## Testing

### Running Tests

```bash
# Unit tests
pnpm test

# Tests with UI
pnpm test:ui

# Coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# E2E tests with UI
pnpm test:e2e:ui
```

### Writing Tests

```typescript
// src/lib/finance/rent.spec.ts
import { describe, it, expect } from 'vitest';
import { calculateRentNpv } from './rent';

describe('calculateRentNpv', () => {
  it('should calculate NPV correctly with 8% discount rate', () => {
    const schedule = [5_000_000, 5_150_000, 5_304_500];
    const discountRate = 0.08;
    const startYear = 2028;
    
    const npv = calculateRentNpv(schedule, discountRate, startYear);
    
    expect(npv).toBe(13_245_678.90);
  });
  
  it('should throw error for negative discount rate', () => {
    const schedule = [5_000_000];
    const discountRate = -0.08;
    const startYear = 2028;
    
    expect(() => calculateRentNpv(schedule, discountRate, startYear))
      .toThrow('Discount rate must be non-negative');
  });
});
```

---

## Debugging

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Database Debugging

```bash
# View database in Prisma Studio
pnpm prisma:studio

# Check migration status
pnpm prisma migrate status

# View database logs (Supabase dashboard)
```

### API Debugging

- Use `console.log` (will be removed before commit)
- Check Network tab in browser DevTools
- Check Vercel logs for production

---

## Common Tasks

### Adding a New Dependency

1. Install: `pnpm add <package-name>`
2. Update `DEPENDENCIES_MASTER.md` if it's a core dependency
3. Run: `pnpm install`
4. Commit: `git add package.json pnpm-lock.yaml`

### Updating Dependencies

```bash
# Check for updates
pnpm outdated

# Update all (careful!)
pnpm update

# Update specific package
pnpm update <package-name>
```

### Fixing Linting Errors

```bash
# Auto-fix
pnpm lint:fix

# Check specific file
pnpm eslint src/path/to/file.ts
```

### Fixing Type Errors

```bash
# Type check
pnpm type-check

# VS Code: Hover over error for details
```

---

## Troubleshooting

### Database Connection Issues

**Error**: `Environment variable not found: DATABASE_URL`

**Solution**:
1. Ensure `.env.local` exists in project root
2. Copy exact connection strings from Supabase
3. Reload shell: `source .env.local` or open new terminal
4. Verify: `echo $DATABASE_URL`

**Error**: `Invalid database string`

**Solution**:
- Copy exact, pre-encoded connection strings from Supabase dashboard
- Don't manually encode URLs
- Ensure `sslmode=require` is included

### Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
pnpm prisma:generate
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

### Import Path Alias Not Resolving

**Error**: `Cannot find module '@/components/ui/button'`

**Solution**:
1. Restart VS Code
2. Check `tsconfig.json` has correct paths
3. Run: `pnpm type-check`

---

## Performance Tips

### Development

- Use React Server Components by default
- Use Edge Runtime for API routes when possible
- Implement caching with Vercel KV
- Use TanStack Query for client-side caching

### Database Queries

- Use `include`/`select` to avoid N+1 queries
- Add database indexes for frequently queried fields
- Use transactions for multi-step operations

### Build Optimization

- Use dynamic imports for heavy components
- Optimize images with Next.js Image component
- Enable code splitting (automatic with App Router)

---

## Git Workflow

### Branch Naming

- `feature/description` — New features
- `fix/description` — Bug fixes
- `chore/description` — Maintenance tasks
- `docs/description` — Documentation updates

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add rent NPV calculation
fix: correct staff cost escalation
docs: update API conventions
chore: update dependencies
```

### Pull Requests

1. Create PR with clear description
2. Link to related issues
3. Ensure all CI checks pass
4. Request review
5. Address feedback
6. Squash commits before merging

---

## Resources

### Documentation

- [Architecture Documentation](./ARCHITECTURE.md)
- [Folder Structure](./FOLDER_STRUCTURE.md)
- [API Conventions](./API_CONVENTIONS.md)
- [Project Delivery Plan](../PROJECT_DELIVERY_PLAN.md)
- [Code Writing Conventions](../CODE_WRITING_CONVENTIONS.md)
- [Zero Error Development Guide](../ZERO_ERROR_DEVELOPMENT_GUIDE.md)
- [Dependencies Master](../DEPENDENCIES_MASTER.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Tremor Documentation](https://www.tremor.so/docs)

---

## Getting Help

1. **Check Documentation**: Start with this guide and architecture docs
2. **Search Issues**: Check GitHub issues for similar problems
3. **Ask Team**: Reach out to team lead or senior developers
4. **Create Issue**: If bug, create detailed issue with reproduction steps

---

## Next Steps

After completing setup:

1. ✅ Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand system design
2. ✅ Review [API_CONVENTIONS.md](./API_CONVENTIONS.md) for API patterns
3. ✅ Check [PROJECT_DELIVERY_PLAN.md](../PROJECT_DELIVERY_PLAN.md) for current tasks
4. ✅ Pick a task from the current phase
5. ✅ Create feature branch and start coding!

---

**Last Updated**: 2025-11-10  
**Maintained By**: Development Team

