# Devlog: STORY-DAO-2077 — Phase 2

**Date:** 2026-04-03  
**Phase:** 2 of 2  
**Developer:** Developer Agent

---

## What Was Planned

- Add `Breadcrumbs.test.tsx` with mocked `usePathname`, assert parent links include `text-primary`, current span keeps `text-text-100`.

## What Was Done

- Created `src/components/Breadcrumbs/Breadcrumbs.test.tsx`.
- Mocked `next/navigation` `usePathname` and `next/link` (anchor stub passes `className` and `data-testid`).
- Covered multi-segment path `/btc-vault/request-history` (two parent links + current) and single-segment `/staking-history` (Home link + current).
- Added `afterEach(cleanup)` from RTL so `getAllByTestId('breadcrumb-link')` does not accumulate anchors across tests (otherwise the second test saw links from the first render).

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| Edge path uses `/staking-history` instead of `/btc-vault` | `/btc-vault` produced more than one parent link in the real breadcrumb map/menu-driven trail; `/staking-history` matches “one segment after Home” cleanly | Same AC coverage (current styling + single parent link) |

## Discoveries

- Vitest + RTL in this repo does not globally `cleanup()` after each test; co-located suites that query by test id across multiple renders should call `cleanup` explicitly.

## Plan Amendments

- None beyond Phase 1 (plan file is gitignored locally).

## Notes for Code Review

- Optional third test for root-only pathname `/` (only current “Home”) was omitted as low value; say if you want it added.
