# School Relocation Planner — Folder Structure

## Overview

This document describes the complete folder structure of the School Relocation Planner application, explaining the purpose of each directory and file.

**Last Updated**: 2025-11-10  
**Status**: Phase 0 - Foundation (Week 2)

---

## Root Directory

```
school-relocation-planner/
├── .github/                      # GitHub Actions workflows
├── .husky/                       # Git hooks (pre-commit)
├── docs/                         # Architecture documentation
├── node_modules/                # Dependencies (gitignored)
├── prisma/                       # Database schema and migrations
├── public/                       # Static assets
├── src/                          # Application source code
├── tests/                        # Test files
├── .editorconfig                 # Editor configuration
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment variables (gitignored)
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignore rules
├── .prettierignore               # Prettier ignore rules
├── .prettierrc                   # Prettier configuration
├── CONTRIBUTING.md               # Contribution guidelines
├── DEPLOYMENT.md                 # Deployment documentation
├── eslint.config.mjs             # ESLint configuration (ESM)
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── playwright.config.ts          # Playwright E2E test configuration
├── postcss.config.mjs            # PostCSS configuration
├── pnpm-lock.yaml                # pnpm lock file
├── README.md                     # Project README
├── tsconfig.json                 # TypeScript configuration
├── vercel.json                   # Vercel deployment configuration
└── vitest.config.ts              # Vitest unit test configuration
```

---

## Detailed Structure

### `.github/` — GitHub Actions Workflows

```
.github/
└── workflows/
    ├── ci.yml                    # Continuous Integration (lint, type-check, test, build)
    └── e2e.yml                   # E2E test workflow (Playwright)
```

**Purpose**: Automated CI/CD pipelines for code quality and testing.

---

### `.husky/` — Git Hooks

```
.husky/
└── pre-commit                    # Pre-commit hook (runs lint-staged)
```

**Purpose**: Enforce code quality before commits (linting, formatting).

---

### `docs/` — Architecture Documentation

```
docs/
├── ARCHITECTURE.md               # System architecture documentation
├── FOLDER_STRUCTURE.md           # This file
├── API_CONVENTIONS.md            # API design conventions
└── DEVELOPER_GUIDE.md            # Developer onboarding guide
```

**Purpose**: Comprehensive architecture and developer documentation.

---

### `prisma/` — Database Schema & Migrations

```
prisma/
├── migrations/                   # Database migration history
│   └── YYYYMMDDHHMMSS_migration_name/
│       └── migration.sql         # SQL migration file
├── schema.prisma                 # Prisma schema definition
└── seed.ts                       # Database seed script
```

**Purpose**: Database schema definition, migrations, and seed data.

**Key Files**:
- `schema.prisma`: Defines all database models (Profile, Version, CurriculumPlan, etc.)
- `seed.ts`: Seeds initial data (workspace, curriculum templates, sample version)

---

### `public/` — Static Assets

```
public/
├── favicon.ico                   # Site favicon
├── file.svg                      # SVG assets
├── globe.svg
├── next.svg
├── vercel.svg
└── window.svg
```

**Purpose**: Static files served directly by Next.js (images, icons, fonts).

---

### `src/` — Application Source Code

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (grouped, not in URL)
│   │   ├── login/                # Login page
│   │   └── mfa/                  # Multi-factor authentication
│   │
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── overview/             # Dashboard home
│   │   ├── versions/             # Version management
│   │   │   ├── page.tsx         # Version list
│   │   │   └── [id]/            # Version detail
│   │   │       ├── page.tsx     # Version detail page
│   │   │       ├── assumptions/  # Assumptions page
│   │   │       ├── pl/          # P&L page
│   │   │       ├── bs/          # Balance Sheet page
│   │   │       └── cf/          # Cash Flow page
│   │   ├── compare/              # Comparison page
│   │   ├── reports/              # Reports and exports
│   │   └── admin/                # Admin pages
│   │       ├── workspace/       # Workspace settings
│   │       ├── templates/       # Curriculum templates
│   │       └── rules/           # Capex rules
│   │
│   ├── api/                      # API routes
│   │   └── v1/                   # Versioned API
│   │       ├── versions/        # Version endpoints
│   │       ├── assumptions/     # Assumptions endpoints
│   │       ├── statements/       # Financial statements endpoints
│   │       └── compare/         # Comparison endpoints
│   │
│   ├── globals.css                # Global styles (Tailwind)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── badge.tsx            # Badge component
│   │   ├── button.tsx           # Button component
│   │   ├── card.tsx             # Card component
│   │   ├── input.tsx            # Input component
│   │   ├── label.tsx            # Label component
│   │   └── textarea.tsx         # Textarea component
│   │
│   ├── features/                 # Feature-specific components
│   │   ├── versions/            # Version-related components
│   │   │   ├── version-list.tsx
│   │   │   ├── version-card.tsx
│   │   │   └── version-form.tsx
│   │   ├── assumptions/         # Assumptions components
│   │   │   ├── curriculum-form.tsx
│   │   │   ├── staff-form.tsx
│   │   │   ├── rent-form.tsx
│   │   │   └── opex-form.tsx
│   │   ├── statements/          # Financial statement components
│   │   │   ├── pl-table.tsx
│   │   │   ├── bs-table.tsx
│   │   │   └── cf-table.tsx
│   │   └── comparison/          # Comparison components
│   │       └── comparison-view.tsx
│   │
│   ├── charts/                   # Tremor chart wrappers
│   │   ├── revenue-trend.tsx    # Revenue trend chart
│   │   ├── cost-breakdown.tsx   # Cost breakdown chart
│   │   └── npv-comparison.tsx   # NPV comparison chart
│   │
│   └── layout/                   # Layout components
│       ├── app-header.tsx       # Application header
│       ├── app-sidebar.tsx      # Application sidebar
│       ├── app-footer.tsx       # Application footer
│       └── app-shell.tsx        # Main app shell wrapper
│
├── lib/                          # Utilities and helpers
│   ├── db/                       # Database utilities
│   │   └── prisma.ts            # Prisma client singleton
│   │
│   ├── finance/                  # Financial calculation engine
│   │   ├── revenue.ts           # Revenue calculations
│   │   ├── staffing.ts          # Staff cost calculations
│   │   ├── rent.ts              # Rent calculations
│   │   ├── opex.ts              # OpEx calculations
│   │   ├── capex.ts             # Capex calculations
│   │   ├── pl.ts                # P&L generation
│   │   ├── bs.ts                # Balance Sheet generation
│   │   ├── cf.ts                # Cash Flow generation
│   │   └── engine.ts            # Main financial engine
│   │
│   ├── validation/               # Validation rules
│   │   ├── assumptions.ts       # Assumption validation
│   │   ├── statements.ts        # Statement validation
│   │   └── rules.ts             # Validation rule definitions
│   │
│   ├── auth/                     # Authentication utilities
│   │   ├── session.ts           # Session management
│   │   └── rbac.ts              # Role-based access control
│   │
│   └── utils/                    # General utilities
│       ├── cn.ts                # Class name utility (Tailwind)
│       ├── format.ts            # Formatting utilities (currency, dates)
│       └── logger.ts           # Logging utility
│
└── types/                        # TypeScript types and interfaces
    ├── version.ts               # Version types
    ├── assumption.ts            # Assumption types
    ├── statement.ts             # Financial statement types
    └── api.ts                   # API types
```

**Purpose**: All application source code organized by feature and concern.

**Key Conventions**:
- `app/`: Next.js App Router pages and API routes
- `components/`: Reusable React components
- `lib/`: Pure utility functions (no React dependencies)
- `types/`: Shared TypeScript types

---

### `tests/` — Test Files

```
tests/
├── e2e/                          # End-to-end tests (Playwright)
│   └── smoke.spec.ts            # Smoke tests
│
├── golden/                       # Golden datasets for testing
│   ├── README.md                # Golden dataset documentation
│   └── toy-version.json         # Sample version data
│
└── utils/                        # Test utilities
    ├── mocks.ts                 # Mock data and clients
    ├── setup.ts                 # Global test setup
    └── test-utils.tsx           # React Testing Library utilities
```

**Purpose**: All test files organized by test type (unit, integration, E2E).

**Key Conventions**:
- Tests colocated with source: `foo.spec.ts` next to `foo.ts`
- E2E tests in `tests/e2e/`
- Golden datasets in `tests/golden/`
- Test utilities in `tests/utils/`

---

## File Naming Conventions

### Components
- **React Components**: `PascalCase.tsx` (e.g., `VersionCard.tsx`)
- **Page Components**: `page.tsx` (Next.js convention)
- **Layout Components**: `layout.tsx` (Next.js convention)

### Utilities
- **Modules**: `kebab-case.ts` (e.g., `calculate-rent-npv.ts`)
- **Hooks**: `use-kebab-case.ts` (e.g., `use-versions.ts`)

### Types
- **Type Files**: `kebab-case.ts` (e.g., `version-assumption.ts`)
- **Type Names**: `PascalCase` (e.g., `VersionAssumption`)

### Tests
- **Test Files**: `*.spec.ts` or `*.spec.tsx` (e.g., `version-card.spec.tsx`)
- **E2E Tests**: `*.spec.ts` (e.g., `smoke.spec.ts`)

---

## Import Path Aliases

Configured in `tsconfig.json`:

```typescript
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Usage**:
```typescript
import { Button } from '@/components/ui/button';
import { calculateRentNpv } from '@/lib/finance/rent';
import type { Version } from '@/types/version';
```

---

## Key Configuration Files

### `package.json`
- **Dependencies**: All project dependencies
- **Scripts**: Development, build, test, lint commands

### `tsconfig.json`
- **TypeScript Configuration**: Strict mode, path aliases, compiler options

### `next.config.ts`
- **Next.js Configuration**: App Router settings, image optimization, environment variables

### `prisma/schema.prisma`
- **Database Schema**: All Prisma models, relations, indexes

### `eslint.config.mjs`
- **ESLint Configuration**: Linting rules, import ordering, TypeScript rules

### `.prettierrc`
- **Prettier Configuration**: Code formatting rules

### `vitest.config.ts`
- **Vitest Configuration**: Test environment, coverage, path aliases

### `playwright.config.ts`
- **Playwright Configuration**: E2E test settings, browsers, base URL

---

## Directory Purpose Summary

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `src/app/` | Next.js pages and API routes | `page.tsx`, `layout.tsx`, `api/` |
| `src/components/` | React components | `ui/`, `features/`, `charts/`, `layout/` |
| `src/lib/` | Utility functions | `db/`, `finance/`, `validation/`, `auth/`, `utils/` |
| `src/types/` | TypeScript types | `version.ts`, `assumption.ts`, `statement.ts` |
| `prisma/` | Database schema | `schema.prisma`, `migrations/`, `seed.ts` |
| `tests/` | Test files | `e2e/`, `golden/`, `utils/` |
| `docs/` | Documentation | `ARCHITECTURE.md`, `API_CONVENTIONS.md`, etc. |

---

## Adding New Files

### Component
1. Create file in `src/components/features/[feature]/[component-name].tsx`
2. Export component with `PascalCase` name
3. Add JSDoc comments
4. Create test file `[component-name].spec.tsx`

### Utility Function
1. Create file in `src/lib/[category]/[function-name].ts`
2. Export function with `camelCase` name
3. Add JSDoc comments with `@param` and `@returns`
4. Create test file `[function-name].spec.ts`

### API Route
1. Create file in `src/app/api/v1/[resource]/route.ts`
2. Export `GET`, `POST`, `PUT`, `DELETE` handlers
3. Add authentication/authorization checks
4. Add input validation (Zod)
5. Create test file `route.spec.ts`

### Database Model
1. Add model to `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name add_[model_name]`
3. Update seed script if needed

---

## References

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Conventions](./API_CONVENTIONS.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Code Writing Conventions](../CODE_WRITING_CONVENTIONS.md)

---

**Last Updated**: 2025-11-10  
**Maintained By**: Development Team

