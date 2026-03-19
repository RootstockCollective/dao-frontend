# STORY-003 Phase 1 — Devlog

## What was done

- **Formatters:** Added `formatDateClosingOn(unix: number): string` in `src/app/btc-vault/services/ui/formatters.ts` using Luxon `DateTime.fromSeconds(unix, { zone: 'utc' }).toFormat('MMMM d')` for consistent "closing on February 23" style. Added two unit tests in `formatters.test.ts`.
- **Types:** Added optional `tvlPercentFormatted?: string` to `VaultMetricsDisplay` in `src/app/btc-vault/services/ui/types.ts`. TVL % is shown when provided; otherwise the component uses placeholder "—".
- **BtcVaultMetrics:** Redesigned to four columns in one row:
  - **TVL:** Label + tooltip; primary line `tvlFormatted rBTC | tvlPercentFormatted` (or "—" for %); secondary line USD when price available.
  - **APY (est.):** Label + tooltip; primary line APY%; secondary line "Last updated on [date]" from `metrics.timestamp` via `formatDateMonthFirst`.
  - **Deposit window {epochId}:** Uses `useEpochState()`; when epoch is open shows "closing on [Month Day]" via `formatDateClosingOn(epoch.endTime)`; otherwise "—". Tooltip: "Current deposit window closes at this date."
  - **Price per Share:** Label + tooltip; primary value + rBTC symbol; secondary USD.
- Custom `MetricColumn` helper used for all four columns (label + tooltip, bold primary, dimmed secondary) since `BalanceInfo` does not support "value | %" or two secondary lines. Same section container and "View history" link preserved; loading and error states unchanged.
- **Tests:** Updated `BtcVaultMetrics.test.tsx`: mocked `useEpochState`; asserted four columns; "APY (est.)"; "Deposit window 1" and "closing on February 23" when epoch open; TVL with "—" or `tvlPercentFormatted`; "Last updated on" under APY; Price per Share with symbol; View history link; loading/error unchanged. Formatter tests for `formatDateClosingOn` added.

## Deviations

- **formatDateClosingOn timezone:** Implemented with `{ zone: 'utc' }` so the displayed date is consistent across environments (tests use 1740268800 for Feb 23, 2025 UTC). No deviation from plan.
- **TVL %:** Not populated in mapper; backend does not provide it. Component shows "—" when `tvlPercentFormatted` is absent. Type is optional for future backend support.
- **Member ordering:** Interface `MetricColumnProps` was reordered to satisfy `@typescript-eslint/member-ordering` (required members before optional).

## Notes for Code Review

- `MetricColumn` is an internal helper; not exported. Could be extracted to a shared component later if reused.
- "Last updated on" uses existing `formatDateMonthFirst` (e.g. "Feb 27, 2024").
- Epoch endTime is in seconds (Unix); `formatDateClosingOn` uses UTC for deterministic display.
