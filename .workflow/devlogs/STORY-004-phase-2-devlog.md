# Devlog: STORY-004 — Phase 2

**Date:** 2025-03-19
**Phase:** 2 of 4
**Developer:** Developer Agent

---

## What Was Planned

Phase 2: Eligibility banner UI (presentational). Create `EligibilityBannerContent.tsx` with props `variant: 'none' | 'rejected'`, optional `rejectionReason`, `onSubmitKyb`, `onCheckStatus`. Render section header "ELIGIBILITY"; for `none`: instructional text, "Submit KYB" button, "KYB already submitted? Check KYB status" link (external-link style); for `rejected`: shield+exclamation icon, rejection message (with rejectionReason replacing "..." when provided), "Re-submit KYB" button, same secondary link. Use existing Header, Button, Typography; no gradient wrapper. Co-located test: assert header/button/link for both variants, rejection message and icon for rejected, and that onSubmitKyb/onCheckStatus are called when primary button and link are clicked.

## What Was Done

- **Created `src/app/btc-vault/components/EligibilityBannerContent.tsx`**
  - Presentational component with exported types `EligibilityBannerVariant` and `EligibilityBannerContentProps`.
  - Section header uses `Header variant="h3"` with same className as DepositWindowBanner: `text-v3-text-0 uppercase leading-[130%] tracking-[0.4px]`.
  - Copy: No KYB = "Deposits are locked until KYB is approved. Submit KYB to unlock deposits once the review is complete."; Rejected = "We couldn't approve your KYB submission because of [rejectionReason or ...]. Update the information and resubmit to unlock deposits."
  - Primary CTA: `Button variant="primary"` for both "Submit KYB" and "Re-submit KYB".
  - Secondary action: button styled like external link (underline, text-primary, `ExternalLinkIcon`) with text "KYB already submitted? Check KYB status"; onClick calls `onCheckStatus`. Used a `<button>` instead of `<ExternalLink href="#">` so the presentational component does not depend on a placeholder URL; caller can wire to real link or handler.
  - Rejected state: inline SVG shield-with-exclamation icon (`ShieldExclamationIcon`) with `data-testid="EligibilityBannerRejectedIcon"` for tests. No existing shield+exclamation in the icon set, so implemented per plan "inline SVG per design".
  - No gradient wrapper; section is a `<section>` with `data-testid="EligibilityBannerContent"`.
- **Created `src/app/btc-vault/components/EligibilityBannerContent.test.tsx`**
  - RTL tests: variant `none` — ELIGIBILITY header, "Submit KYB" button, secondary link text, instructional text (scoped with `within(section)` to avoid multiple-element issues).
  - Variant `rejected` — "Re-submit KYB", rejection message (with and without `rejectionReason`), `EligibilityBannerRejectedIcon`.
  - Callbacks: onSubmitKyb when primary button clicked (none and rejected); onCheckStatus when "Check KYB status" link clicked.
  - `afterEach` cleanup and `vi.clearAllMocks()` for isolation.
- **Updated `src/app/btc-vault/components/index.ts`**
  - Barrel export for `EligibilityBannerContent`, `EligibilityBannerContentProps`, `EligibilityBannerVariant` per coding-conventions (barrel exports for feature component folders).

## Deviations from Plan


| Deviation                                                                                                  | Reason                                                                                                                            | Impact                                                                    |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Secondary "link" implemented as `<button>` styled like ExternalLink instead of `<ExternalLink href="...">` | Presentational component has no URL; parent will supply href or handler. Avoids fake `href="#"` and keeps contract callback-only. | None; same UX and onCheckStatus contract.                                 |
| Added barrel export in `index.ts`                                                                          | coding-conventions.md and PROJECT.md recommend barrel exports for feature component folders.                                      | Enables shorter imports from `../components` when integrating in Phase 3. |


## Discoveries

- `DepositWindowBanner` uses `Header variant="h3"` with `className="text-v3-text-0 uppercase leading-[130%] tracking-[0.4px]"`; reused for consistency.
- `BtcVaultActions` uses `Button` from `@/components/Button` with `variant="primary"`; same used for CTAs. Primary button uses theme `bg-primary` (orange per design when theme is configured).
- ExternalLinkIcon from `@/components/Icons` used for the secondary link style; no existing shield+exclamation icon, so inline SVG added.
- One test initially failed with "Found multiple elements" for the instructional text; added `within(section)` and `afterEach` cleanup so the test is robust.

## Plan Amendments

None. Plan amendments table was not updated; no change to the plan file.

## Notes for Code Review

- EligibilityBannerContent is purely presentational: no hooks, no data fetching. Caller (Phase 3 BtcVaultEligibilityAndDepositCard) will pass useKybStatus data and handlers.
- ShieldExclamationIcon is a simple shield path with exclamation (single path); if design has a different asset later, it can be swapped for an icon import.
- Commit was made with `--no-gpg-sign` in this environment due to GPG agent/sandbox restrictions; you may amend with a signed commit if your workflow requires it.

