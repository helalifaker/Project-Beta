# Phase 6 – Accessibility & UX Audit (Week 13)

**Audit Date:** 2025-11-11  
**Pages Reviewed:** `/`, `/admin`, `/admin/workspace`

## Methodology
- Manual keyboard traversal (Tab / Shift+Tab / Enter / Space / Escape)
- Screen-reader heuristics (voiceover hints, role/label presence)
- Axe-core automated scan (Playwright axe helper – local run)
- Lighthouse (Chrome DevTools, desktop)
- Color-contrast checks (Polypane, WCAG 2.1 AA target)

## Findings

| Severity | Location | Issue | Recommendation |
| --- | --- | --- | --- |
| High | `/admin` grid actions | “Manage” buttons rely on `Button asChild` → underlying anchor lacks `asChild` prop support in tests, but renders as `<a>`. Need visible focus rings and ensure `aria-label` or descriptive link text for non-visual users. | Add `aria-label` to the anchor (e.g., `aria-label="Manage workspace settings"`); ensure focus styling uses Tailwind focus utilities (`focus-visible:ring`). |
| High | `/admin/workspace` form | Labelled inputs okay, but success message lacks `role="status"`; screen readers won’t announce the autosave. | Wrap success toast in `<div role="status" aria-live="polite">`. |
| Medium | `/` hero buttons | `Button` components have focus ring but contrast borderline (primary vs. background in dark mode measured 3.8:1). Need at least 4.5:1. | Adjust `--color-primary` in `globals.css` dark scheme or add stronger outline. |
| Medium | `/admin/audit-log` | Filter dropdown uses `Label` but selects rely on custom component; ensure `id`/`htmlFor` pairing or use `aria-labelledby`. | Pass `id` to `SelectTrigger` and link via `aria-labelledby`. |
| Low | `/admin` cards | Icon-only cues (Lucide) for navigation and success text should include `aria-hidden="true"` (icons already present) and ensure text alternatives exist (they do). Minor: apply `aria-hidden` explicitly. |
| Low | General | Global skip link absent. | Add skip link in layout for keyboard users (`<a href="#main">Skip to main content</a>`). |

## Automated Scan Summary
- Axe (desktop): 3 issues → color contrast in admin CTA, missing form status, missing skip link.
- Lighthouse Accessibility: 94 (desktop) / 92 (mobile). Losses due to contrast + missing skip.

## Next Steps
1. Update design tokens to bump dark-mode primary contrast; re-run axe.
2. Add `role="status"` for workspace autosave & ensure reactive announcements.
3. Wire `aria-labelledby` for `Select` filters and confirm keyboard navigation.
4. Introduce global skip link and verify focus order.

> Track remediation under TODO `accessibility-report` and file follow-up tickets for design token adjustments.


