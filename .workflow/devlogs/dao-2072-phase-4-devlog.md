# dao-2072 Phase 4 — Devlog

**Ticket:** dao-2072  
**Phase:** 4 — Remove mocks, applyFilters/paginate, and fix tests + lint  
**Branch:** dao-2072  
**Commit:** `chore(btc-vault): remove mock data and client-side filter/paginate; fix tests and lint`

---

## What was done

- **Step 4.1:** Deleted `src/app/btc-vault/hooks/useRequestHistory/mock-data.ts`. Confirmed useRequestHistory has no remaining applyFilters/paginate (removed in Phase 2). No test-only util added; no tests exclusively for applyFilters/paginate.

- **Step 4.2:** useRequestHistory.test.ts unchanged — already uses mocked fetch and API-shaped response; no MOCK_REQUESTS or mock-data.

- **Step 4.3:** npm run lint and npm run lint-tsc — both passed, zero errors.

- **Step 4.4:** Grep for NEXT_PUBLIC_MOCK_BTC_VAULT and MOCK_REQUESTS. Only BtcVaultDashboard.tsx uses NEXT_PUBLIC_MOCK_BTC_VAULT for hasHistory (left as-is per plan). No dead imports.

## Deviations

- Commit signing: `--no-gpg-sign` (environment). Amend with `--gpg-sign` locally if required.

## Validation

- npm run build / lint / lint-tsc / test — all passed. AC-6 and AC-7 satisfied.
