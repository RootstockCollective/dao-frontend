# Devlog: STORY-007 — Phase 1

**Date:** 2026-04-01
**Phase:** 1 of 4
**Developer:** Developer Agent

---

## What Was Planned

Phase 1 (plan Section 5): Reflow the REQUEST PROCESSING **detail row** in `RequestProcessingBlock` with a mobile-first layout—base column stack (`flex flex-col gap-4`), `md:flex-row md:gap-6`, cells `md:flex-1 md:min-w-0`, preserve ellipsis on value spans, keep the amount + rBTC row sensible. Update co-located tests if needed; optional stable class assertions. **AC-5:** No changes to `useActiveRequests`, `ActiveRequestSection`, or `data[0]`.

## What Was Done

- **`RequestProcessingBlock.tsx`:** Replaced the flat `flex gap-6 self-stretch` detail wrapper with `flex w-full min-w-0 flex-col gap-4 md:flex-row md:gap-6`. Each detail cell is now `flex min-w-0 flex-col gap-2 md:flex-1 md:min-w-0` (mobile: natural stack; desktop: equal columns with truncation).
- **Amount row:** Added `min-w-0` on the amount column chain; amount value span uses `min-w-0 flex-1` with existing ellipsis; RBTC label uses `shrink-0` so the icon and ticker stay visible while long amounts truncate.
- **`RequestProcessingBlock.test.tsx`:** Added `getDetailRow` (sibling after `request-status-stepper`) and a test asserting `flex-col`, `gap-4`, `md:flex-row`, `md:gap-6` on the detail wrapper. Existing tests unchanged in intent.

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| Omitted redundant `md:flex` on the detail wrapper | `flex` is already applied at base; `md:flex-row` matches `.workflow/rules/responsive-mobile-first.md` example | None — same responsive behavior |

## Discoveries

- `RequestStatusStepper` always renders a wrapper `div[data-testid="request-status-stepper"]` when visible, so the detail row is reliably `nextElementSibling` for tests when the stepper is present (default fixtures use `pending`).

## Plan Amendments

- None recorded in `STORY-007-plan.md` (deviation above is minor and documented here only).

## Notes for Code Review

- Confirm visually below the `md` breakpoint (768px) that the vertical stack reads well and at `md` and up that the four-column row matches prior desktop density.
- Phase 1 does **not** address AC-1, AC-2, AC-4, or containment; Phases 2–4 are separate sessions per plan.
