# School Relocation Planner

A financial planning application for evaluating school relocation scenarios over a 30-year horizon (2023-2052). Generate, compare, and analyze different lease proposals with comprehensive P&L, Balance Sheet, and Cash Flow statements.

## 🎯 Project Overview

**Goal**: Enable data-driven decision-making for school relocation by providing fast, accurate financial modeling and comparison tools.

**Key Features**:

- Version management (create, edit, compare, lock)
- Financial modeling (P&L, Balance Sheet, Cash Flow)
- 3 rent models (Fixed+Escalation, Revenue Share, Partner)
- Curriculum planning (2 curricula, capacity management)
- Staffing calculations (ratio-based, escalation)
- OpEx planning (revenue-based percentages)
- Capex rules (category-based reinvestment)
- Validation engine (critical, warning, info)
- Comparison tools (NPV, side-by-side)
- Admin configuration (workspace settings, templates)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase account
- Vercel account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/helalifaker/Project-Beta.git
cd school-relocation-planner

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
pnpm type-check       # Run TypeScript compiler

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run database migrations
pnpm prisma:studio    # Open Prisma Studio
pnpm db:seed          # Seed the database

# Testing
pnpm test             # Run unit tests
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run E2E tests with UI
```

## 🗄️ Database Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment**  
   Copy `.env.example` → `.env.local` and set `DATABASE_URL` / `DIRECT_URL` to your Supabase Postgres connection strings.

3. **Run migrations & generate client**

   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

4. **Seed baseline data (workspace, curriculum templates, sample version)**
   ```bash
   pnpm db:seed
   ```

> Prisma schema and seed live under `prisma/`. Database access helpers are under `src/lib/db/prisma.ts`.

## 🏗️ Tech Stack

### Frontend

- **Next.js 14** — React framework with App Router
- **TypeScript 5.3+** — Type safety
- **Tailwind CSS 4 (inline design tokens)** — Styling + theme system
- **shadcn/ui patterns + CVA** — Accessible UI primitives
- **Tremor 3.14+** — Financial dashboards and charts
- **TanStack Query** — Server state management
- **React Hook Form + Zod** — Forms and validation
- **Lucide React** — Iconography

### Backend

- **Next.js API Routes** — API with Edge Runtime
- **Supabase** — Auth, PostgreSQL 15+, Storage
- **Prisma** — ORM
- **Decimal.js 10.4+** — Financial calculations

### Performance & Caching

- **Vercel KV (Redis)** — Caching
- **Next.js ISR** — Incremental Static Regeneration
- **React Cache API** — Request deduplication

### Testing & Quality

- **Vitest** — Unit/integration testing
- **Playwright** — E2E testing
- **ESLint + Prettier** — Code quality
- **Husky + lint-staged** — Pre-commit hooks

### Monitoring & Deployment

- **Sentry** — Error tracking
- **Vercel Analytics** — Usage analytics
- **Vercel Speed Insights** — Performance monitoring
- **Vercel** — Hosting
- **GitHub Actions** — CI/CD

## 📊 Project Status

**Current Phase**: Phase 4 - Analysis & Comparison (Week 10-11 Complete) ✅  
**Progress**: Statement Tables ✅ | Charts ✅ | Comparison Tools ✅ | NPV Comparison ✅ | Ready for Phase 5

**Test Coverage**: ✅ **72.36% branches, 75.71% functions** (exceeds 70% threshold)  
**Tests**: 732 passing tests across 112 test files

See [PROJECT_DELIVERY_PLAN.md](../PROJECT_DELIVERY_PLAN.md) for the complete 16-week delivery plan.

## 📚 Documentation

- [Project Delivery Plan](../PROJECT_DELIVERY_PLAN.md) — Complete 16-week plan
- [Technical Specification](../SCHOOL_RELOCATION_PLANNER_TECHNICAL_SPEC.md) — Requirements and architecture
- [Execution Quick Start](../EXECUTION_QUICK_START.md) — Developer quick start
- [Code Writing Conventions](../CODE_WRITING_CONVENTIONS.md) — Best-in-class standards
- [Zero Error Development Guide](../ZERO_ERROR_DEVELOPMENT_GUIDE.md) — Quality standards
- [Dependencies Master](../DEPENDENCIES_MASTER.md) — Single source of truth
- [Contributing Guide](./CONTRIBUTING.md) — How to contribute

## 🎯 Quality Standards

- **Error Rate**: <0.1% (99.9% reliability)
- **Page Load**: <800ms (p95)
- **Statement Generation**: <400ms (p95)
- **Test Coverage**: 72.36% branches, 75.71% functions (exceeds 70% threshold)
- **Lighthouse Score**: ≥95
- **Accessibility**: WCAG 2.1 AA
- **Security**: Zero vulnerabilities

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Workflow

1. Read [PROJECT_DELIVERY_PLAN.md](../PROJECT_DELIVERY_PLAN.md)
2. Check [DEPENDENCIES_MASTER.md](../DEPENDENCIES_MASTER.md)
3. Follow [CODE_WRITING_CONVENTIONS.md](../CODE_WRITING_CONVENTIONS.md)
4. Write tests
5. Run quality checks
6. Submit PR

## 📝 License

This project is proprietary and confidential.

## 👥 Team

- **Product Owner**: Faker Helali (CAO)
- **Tech Lead**: TBD
- **Developers**: TBD

## 📞 Support

For questions or issues:

1. Check documentation
2. Search GitHub issues
3. Contact team lead

---

**Built with ❤️ for data-driven school relocation decisions**
