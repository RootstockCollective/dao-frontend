# dao-2072 Phase 2 — Devlog

**Ticket:** dao-2072  
**Phase:** 2 — useRequestHistory wires to GET /api/btc-vault/v1/history  
**Branch:** dao-2072  
**Date:** 2025-03-18  

---

## Summary

- `useRequestHistory` now fetches from `GET /api/btc-vault/v1/history` with query params: `address`, `page`, `limit`, `sort_field` (default `timestamp`), `sort_direction`, and `type[]` from `historyFiltersToApiTypes(filters)`.
- Response is mapped with `apiHistoryToPaginatedDisplay`; client-side status filter is applied when `filters?.status?.length` (rows filtered by `displayStatus`; total/page/limit/totalPages unchanged).
- Query key: `['btc-vault', 'history', address, params, filters]`; `enabled: !!address`.
- Mock path, `applyFilters`, `paginate`, `IS_MOCK_ENABLED`, and mock-data import removed from the hook. `mock-data.ts` left in place (Phase 4 deletes it).
- `BtcVaultHistoryTable` passes `sortField` from table context (`date` → passed as `'date'`, `amount` → `'amount'`); hook maps to API `sort_field` `timestamp` | `assets`.
- Tests: query disabled when address undefined; fetch URL and params when address defined; API-shaped mock response → `PaginatedHistoryDisplay`; client-side status filter; `sort_field=assets` when `sortField` is `'amount'`.

## Files changed

| File | Change |
|------|--------|
| `src/app/btc-vault/hooks/useRequestHistory/useRequestHistory.ts` | Reimplemented: fetch API, `buildHistoryUrl`, `toApiSortField`, mapper + client-side status filter; removed mock, applyFilters, paginate. |
| `src/app/btc-vault/request-history/components/BtcVaultHistoryTable.tsx` | Pass `sortField` from `sort?.columnId` (`date`/`amount`) into `useRequestHistory` params. |
| `src/app/btc-vault/hooks/useRequestHistory/useRequestHistory.test.ts` | Replaced applyFilters/paginate tests with API-path tests (enabled, URL, mapped result, status filter, sort_field). |

## Validation

- `npm run build` — pass
- `npm run lint` — pass
- `npm run lint-tsc` — pass
- `npm run test` — 825 tests pass (including 6 useRequestHistory tests)

## Plan amendments

None. Implementation matches Phase 2 of the approved plan.
