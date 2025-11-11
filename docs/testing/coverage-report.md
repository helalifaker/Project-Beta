# Phase 6 – Week 13 Coverage Snapshot

**Generated:** `vitest --coverage` (21:41:37)

## Summary

- **Global thresholds (70%)** remain unmet, though overall coverage improved with new admin specs:
  - Statements: **35.70%** (+3.6)
  - Branches: **27.65%** (+2.0)
  - Functions: **23.33%** (+3.8)
  - Lines: **35.34%** (+3.7)
- Finance engine still holds >90% line coverage, but branch coverage for `src/lib/finance/**` sits at **82.05%** (target 85%) because of untested guards in escalation/rent validation paths.
- Admin API surface (`workspace`, `curriculum-templates`, `capex-*`) now hits **100%** on exercised routes, yet **alt routes (`[id]` handlers) and admin UI tables remain uncovered**.

## High-Priority Gaps

| Area                                                               | Coverage | Notes                                                                                              |
| ------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------- |
| `src/app/(dashboard)/admin/**/*`                                   | ~0%      | Pages still untested (workspace, templates, capex, audit log).                                     |
| `src/app/api/v1/admin/**/[id]/route.ts`                            | 0%       | Detail routes (GET/PUT/DELETE) not covered.                                                        |
| `src/components/features/admin/*-list.tsx`, `audit-log-viewer.tsx` | <20%     | Only workspace form + dashboard tested; lists/tables/audit viewer remain uncovered.                |
| `src/lib/auth/utils.ts`                                            | 0%       | Auth helpers (register, role update, password reset) untested. Requires Supabase mocking strategy. |
| `src/lib/supabase/*`                                               | ≤11%     | Supabase client/server helpers untested.                                                           |
| `src/lib/utils/*`                                                  | ~0%      | Formatting/export/debounce helpers uncovered.                                                      |
| `src/app/(auth)/**/*`                                              | 0%       | Auth forms/routes lack coverage; consider component tests or Playwright flows.                     |

## Finance Module Follow‑ups

- `escalation.ts`: branch coverage 80% (misses negative-year guard scenarios).
- `rent.ts`: branch coverage 81%; add tests for indexation combinations + zero schedules.
- `validation/engine.ts`: branch coverage 79%; add cases for CPI bounds and staffing ratios once implemented.

## Next Actions (aligned with QA plan)

1. **Admin API coverage** – extend to `[id]` handlers (update/delete) and audit log list route.
2. **Admin UI component tests** – add RTL coverage for template lists, capex manager, and audit log viewer.
3. **Dashboard routing smoke tests** – extend Playwright suite to cover admin navigation, workspace update, and audit log filtering.
4. **Utility/auth coverage** – add focused unit tests for `src/lib/auth/utils.ts`, Supabase wrappers, and `src/lib/utils/*.ts`.
5. **Finance branch cleanup** – backfill missing edge-case assertions (escalation indexation guards, rent NPV zero filters, CPI bounds).

> Track follow-up work against TODOs `admin-feature-tests`, `extend-e2e-suite`, and `accessibility-report` in the Phase 6 plan.
