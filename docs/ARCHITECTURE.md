# School Relocation Planner — Architecture Documentation

## Overview

The School Relocation Planner is a Next.js 14 application built with TypeScript, Supabase, and Prisma. It provides financial modeling capabilities for evaluating school relocation scenarios over a 30-year horizon (2023-2052).

**Version**: 1.0  
**Last Updated**: 2025-11-10  
**Status**: Phase 0 - Foundation (Week 2)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │   Tremor     │  │   TanStack   │      │
│  │   App Router │  │   Charts     │  │   Query      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   API Routes │  │   Financial   │  │   Validation │      │
│  │  (Edge RT)   │  │    Engine     │  │    Engine    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │    Prisma     │  │   Vercel KV  │      │
│  │  (Postgres)  │  │     ORM       │  │   (Redis)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Next.js 14** (App Router) — React framework with server components
- **TypeScript 5.3+** — Strict type safety
- **Tailwind CSS 4** — Utility-first styling with design tokens
- **shadcn/ui** — Accessible component primitives
- **Tremor 3.14+** — Financial charts and dashboards
- **TanStack Query** — Server state management and caching
- **React Hook Form + Zod** — Form handling and validation
- **Lucide React** — Icon library

#### Backend
- **Next.js API Routes** — Edge Runtime for ultra-fast responses
- **Supabase** — Authentication, PostgreSQL 15+, Storage, RLS
- **Prisma** — Type-safe ORM
- **Decimal.js 10.4+** — Financial precision (no floating-point errors)

#### Performance & Caching
- **Vercel KV (Redis)** — Distributed caching
- **Next.js ISR** — Incremental Static Regeneration
- **React Cache API** — Request deduplication

#### Infrastructure
- **Vercel** — Hosting and Edge Network
- **GitHub Actions** — CI/CD pipeline
- **Sentry** — Error tracking
- **Vercel Analytics** — Usage analytics
- **Vercel Speed Insights** — Performance monitoring

---

## Data Flow Architecture

### Request Flow (Read Operations)

```
User Request
    │
    ▼
Next.js App Router (Server Component)
    │
    ├─► React Cache API (deduplication)
    │       │
    │       ▼
    │   Vercel KV Cache (check)
    │       │
    │       ├─► Cache Hit → Return cached data
    │       │
    │       └─► Cache Miss → Continue
    │
    ▼
Prisma Client (type-safe queries)
    │
    ▼
Supabase PostgreSQL (with RLS)
    │
    ▼
Return Data → Cache → Render
```

### Request Flow (Write Operations)

```
User Action (Form Submit)
    │
    ▼
API Route Handler (Edge Runtime)
    │
    ├─► Authentication Check (Supabase Auth)
    ├─► Authorization Check (RBAC)
    ├─► Input Validation (Zod)
    │
    ▼
Prisma Transaction
    │
    ├─► Update Database
    ├─► Create Audit Log
    └─► Invalidate Cache
    │
    ▼
Return Response → Update UI (TanStack Query)
```

### Financial Engine Flow

```
Version Assumptions
    │
    ├─► Curriculum Plans (per curriculum)
    │       ├─► Capacity (ceiling per curriculum)
    │       ├─► Ramp Profile (5-year ramp, curriculum-specific)
    │       ├─► Enrollment Projections (2023-2052)
    │       └─► Tuition & CPI (per curriculum)
    │
    ├─► Staff Plan
    │       ├─► Shared Ratios (student:teacher, student:non-teacher)
    │       ├─► Average Salaries (teacher vs non-teacher)
    │       └─► Escalation Rates
    │
    ├─► Rent Schedule
    │       ├─► Rent Model Type (FIXED_ESC, REV_SHARE, PARTNER)
    │       ├─► Base Amount / Parameters
    │       └─► Indexation (rate + frequency: ANNUAL, EVERY_2_YEARS, EVERY_3_YEARS)
    │
    ├─► OpEx Schedule
    │       ├─► Revenue Percentage (per category)
    │       └─► Revenue Reference (total revenue)
    │
    └─► Capex Rules (from Admin)
            ├─► Category-Based Rules
            ├─► Trigger Logic (cycle, utilization, custom date)
            └─► Escalation
    │
    ▼
Financial Engine (Iterative Cash Engine)
    │
    ├─► Revenue Calculation
    │       └─► Sum(curriculum_tuition × curriculum_students) per year
    │
    ├─► Staff Cost Calculation
    │       └─► Headcount = ceil(total_students / ratio)
    │       └─► Cost = headcount × avg_salary × escalation^t
    │
    ├─► Rent Calculation
    │       ├─► Fixed+Esc: base × (1 + escalation)^t (with indexation frequency)
    │       ├─► Revenue Share: max(floor, min(cap, revenue × pct))
    │       └─► Partner: ((land_sqm × land_cost) + (bua_sqm × bua_cost)) × yield (with optional indexation)
    │
    ├─► OpEx Calculation
    │       └─► Per category: revenue × revenue_percentage
    │
    ├─► COGS = Staff Costs + Rent + OpEx
    │
    ├─► Capex Calculation
    │       └─► Trigger-based reinvestment per category
    │
    ├─► P&L Generation
    │
    ├─► Balance Sheet Generation
    │
    └─► Cash Flow Generation (iterative until convergence)
    │
    ▼
Financial Statements (2023-2052)
    │
    ├─► P&L (Revenue, COGS, OpEx, Depreciation, Net Income)
    ├─► Balance Sheet (Assets, Liabilities, Equity)
    └─► Cash Flow (Operating, Investing, Financing)
```

---

## Component Architecture

### Application Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, MFA)
│   ├── (dashboard)/              # Protected routes
│   │   ├── overview/            # Dashboard
│   │   ├── versions/            # Version list and detail
│   │   ├── compare/             # Comparison page
│   │   ├── reports/             # Reports and exports
│   │   └── admin/               # Admin pages
│   ├── api/                      # API routes
│   │   └── v1/                   # Versioned API
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives
│   ├── features/                 # Feature-specific components
│   ├── charts/                  # Tremor chart wrappers
│   └── layout/                   # Layout components
│
├── lib/                          # Utilities and helpers
│   ├── db/                       # Database utilities (Prisma)
│   ├── finance/                  # Financial calculation engine
│   ├── validation/               # Validation rules
│   ├── auth/                     # Authentication utilities
│   └── utils/                    # General utilities
│
└── types/                        # TypeScript types and interfaces
```

### Component Hierarchy

```
AppShell
├── AppHeader
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── AppSidebar
│   └── NavigationItems
├── Main Content (Page)
│   ├── Feature Components
│   │   ├── VersionList
│   │   ├── VersionDetail
│   │   ├── AssumptionsForm
│   │   ├── FinancialStatements
│   │   └── ComparisonView
│   └── Charts (Tremor)
└── AppFooter
```

---

## Database Architecture

### Entity Relationship Overview

```
WorkspaceSetting (1)
    │
    ├─► CurriculumTemplate (N)
    │       └─► CurriculumRampBand (N)
    │       └─► CurriculumTuitionBand (N)
    │
    └─► Version (N)
            │
            ├─► VersionAssumption (1)
            │       │
            │       ├─► CurriculumPlan (N) ──► CurriculumTemplate
            │       │       └─► Enrollment per year (2023-2052)
            │       │
            │       ├─► StaffPlan (1)
            │       │       └─► Ratios, salaries, escalation
            │       │
            │       ├─► RentSchedule (1)
            │       │       └─► Rent amounts per year (2028-2052)
            │       │
            │       ├─► OpExSchedule (N)
            │       │       └─► Revenue percentage per category
            │       │
            │       └─► CapexSchedule (N) ──► CapexRule
            │               └─► CapexCategory
            │
            ├─► FinancialStatement (N)
            │       └─► P&L, Balance Sheet, Cash Flow
            │
            ├─► ValidationResult (N)
            │
            └─► ComparisonSet (N)
```

### Key Design Decisions

1. **Curriculum-Specific Modeling**
   - Each curriculum has its own capacity ceiling
   - Each curriculum has its own ramp profile (5-year ramp, can start at 100% for established curricula)
   - Each curriculum has its own tuition and CPI schedule
   - Revenue = sum(curriculum_tuition × curriculum_students) per year

2. **Shared Staffing Ratios**
   - Student:teacher and student:non-teacher ratios are shared across curricula
   - Headcount calculated from total students
   - Separate average salaries for teachers vs non-teachers
   - Separate escalation rates per cohort

3. **Rent Indexation**
   - Indexation rate (e.g., 2%) with frequency (ANNUAL, EVERY_2_YEARS, EVERY_3_YEARS)
   - Applied to Fixed+Esc and Partner models
   - Example: 2% every 2 years → apply in 2028, 2030, 2032, 2034, etc.

4. **OpEx Revenue-Based**
   - OpEx categories defined with revenue percentage
   - Automatically scales with revenue projections
   - Can override specific year amounts with reason

5. **Capex Category-Based Rules**
   - Admin defines rules per category (cycle-based, utilization-based, custom date)
   - Rules trigger reinvestment automatically
   - Escalation applied to reinvestment amounts

---

## Security Architecture

### Authentication & Authorization

```
User Request
    │
    ▼
Supabase Auth (JWT)
    │
    ├─► Session Validation
    ├─► Role Extraction (ADMIN, ANALYST, VIEWER)
    │
    ▼
API Route Handler
    │
    ├─► Authentication Check (getServerSession)
    ├─► Authorization Check (RBAC)
    │       ├─► ADMIN: Full access
    │       ├─► ANALYST: Scenario planning
    │       └─► VIEWER: Read-only
    │
    ▼
Prisma Query (with RLS)
    │
    └─► Supabase RLS Policies
            └─► Enforce data access based on role
```

### Row-Level Security (RLS)

- **Profile**: Users can only read their own profile
- **Version**: Users can read versions they own or are shared with
- **WorkspaceSetting**: Only ADMIN can modify
- **CurriculumTemplate**: Only ADMIN can modify
- **CapexRule**: Only ADMIN can modify

### Data Validation

- **API Boundary**: All input validated with Zod schemas
- **Database**: Prisma enforces types and constraints
- **Client**: React Hook Form + Zod for form validation

---

## Performance Architecture

### Caching Strategy

1. **React Cache API** — Request deduplication within a single request
2. **Vercel KV** — Distributed caching for frequently accessed data
3. **Next.js ISR** — Incremental Static Regeneration for static pages
4. **TanStack Query** — Client-side caching with stale-while-revalidate

### Edge Runtime

- **API Routes**: Use Edge Runtime for ultra-fast cold starts (0ms)
- **Static Generation**: Pre-render pages at build time
- **Streaming**: Stream server components for faster TTI

### Optimization Techniques

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Next.js Font optimization
- **Virtualization**: TanStack Table for large datasets
- **Lazy Loading**: Dynamic imports for heavy components

---

## Deployment Architecture

### Vercel Deployment

```
GitHub Repository
    │
    ├─► Push to main → Production Deployment
    ├─► Push to branch → Preview Deployment
    │
    ▼
GitHub Actions CI/CD
    │
    ├─► Lint
    ├─► Type Check
    ├─► Test
    └─► Build
    │
    ▼
Vercel Deployment
    │
    ├─► Edge Network (Global CDN)
    ├─► Serverless Functions (API Routes)
    └─► Environment Variables
```

### Environment Variables

- `DATABASE_URL` — Supabase PostgreSQL (pgBouncer)
- `DIRECT_URL` — Supabase PostgreSQL (direct connection)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `KV_REST_API_URL` — Vercel KV URL
- `KV_REST_API_TOKEN` — Vercel KV token
- `SENTRY_DSN` — Sentry error tracking DSN

---

## Monitoring & Observability

### Error Tracking

- **Sentry**: Captures errors, exceptions, and performance issues
- **Error Boundaries**: React error boundaries for graceful error handling

### Performance Monitoring

- **Vercel Speed Insights**: Real user monitoring (RUM)
- **Vercel Analytics**: Page views, conversions, performance metrics
- **Custom Logging**: Structured logging for financial calculations

### Metrics

- **Page Load Time**: Target <800ms (p95)
- **Statement Generation**: Target <400ms (p95)
- **API Response Time**: Target <100ms (p95)
- **Error Rate**: Target <0.1%

---

## Future Considerations

### Scalability

- **Database**: Supabase auto-scaling PostgreSQL
- **Caching**: Vercel KV can scale horizontally
- **CDN**: Vercel Edge Network for global distribution

### Extensibility

- **Plugin Architecture**: Consider plugin system for custom rent models
- **API Versioning**: `/api/v1/` allows future API versions
- **Feature Flags**: Consider feature flags for gradual rollouts

### Migration Path

- **Database Migrations**: Prisma migrations for schema changes
- **Data Migrations**: Separate scripts for data transformations
- **Versioning**: API versioning for breaking changes

---

## References

- [Technical Specification](../SCHOOL_RELOCATION_PLANNER_TECHNICAL_SPEC.md)
- [Project Delivery Plan](../PROJECT_DELIVERY_PLAN.md)
- [Folder Structure](./FOLDER_STRUCTURE.md)
- [API Conventions](./API_CONVENTIONS.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)

---

**Last Updated**: 2025-11-10  
**Maintained By**: Development Team

