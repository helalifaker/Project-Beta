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
git clone <repository-url>
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

# Testing
pnpm test             # Run unit tests
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run E2E tests with UI
```

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** — React framework with App Router
- **TypeScript 5.3+** — Type safety
- **Tailwind CSS 3.4+** — Styling
- **shadcn/ui** — UI components
- **Tremor 3.14+** — Charts
- **TanStack Query** — Server state management
- **React Hook Form + Zod** — Forms and validation

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

**Current Phase**: Phase 0 - Foundation Setup (Week 1)  
**Progress**: Day 1-2 Complete ✅

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
- **Test Coverage**: 85%+ (financial modules)
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
