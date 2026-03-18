# STORY-001 Phase 3 — Devlog

**Story:** STORY-001  
**Phase:** 3 — useRequestById resolves one request from same backend  
**Branch:** `feature/STORY-001-btc-vault-hooks-api`  
**Commit:** `feat(btc-vault): useRequestById fetches from history API and finds by id`

---

## What was done

- **Step 3.1 — Mapper:** In `src/app/btc-vault/services/ui/mappers.ts`:
  - Imported `BtcVaultHistoryItemWithStatus` from `./api-types`.
  - Added `mapApiItemToVaultRequest(item: BtcVaultHistoryItemWithStatus): VaultRequest`. Maps: `action` → `type` (deposit/withdrawal via `DEPOSIT_ACTIONS`); `displayStatus` → `status` via existing `displayStatusToRequestStatus`; `assets`/`shares` → `amount` (bigint); `transactionHash` → `txHashes.submit`; `timestamp` → `timestamps.created` and `updated`; `id`, `epochId` (deposit), `batchRedeemId` (withdrawal, from `item.epochId`); `failureReason` when displayStatus is `rejected` or `cancelled`. TransactionDetailPage continues to use `toRequestDetailDisplay(request, null, rbtcPrice, address)` unchanged.

- **Step 3.2 — useRequestById:** In `src/app/btc-vault/hooks/useRequestById/useRequestById.ts`:
  - Signature: `useRequestById(id: string | undefined, address: string | undefined)`.
  - queryFn: fetches `GET /api/btc-vault/v1/history?address={address}&limit=200&page=1&sort_field=timestamp&sort_direction=desc`; parses JSON; finds `response.data.find(d => d.id === id)`; if not found returns `null`, else returns `mapApiItemToVaultRequest(item)`.
  - queryKey: `['btc-vault', 'request', id, address]`. enabled: `!!id && !!address`. staleTime: Infinity.
  - Removed all `MOCK_REQUESTS` and mock queryFn.

- **Step 3.3 — TransactionDetailPage:** In `src/app/btc-vault/request-history/[id]/TransactionDetailPage.tsx`:
  - Updated to call `useRequestById(id, address ?? undefined)`. Address comes from existing `useAccount()`; when not connected the hook is disabled and the page already shows "not-connected" before using request data.

- **Step 3.4:** Inline MOCK_REQUESTS and mock path were removed as part of Step 3.2 (full hook rewrite).

- **Tests:** Created `src/app/btc-vault/hooks/useRequestById/useRequestById.test.ts`:
  - When `id` is undefined, query is disabled (fetch not called).
  - When `address` is undefined, query is disabled (fetch not called).
  - When both set: queryFn fetches history with correct URL (address, page=1, limit=200, sort_field, sort_direction); finds item by id; returns mapped VaultRequest with expected shape (id, type, amount, status, epochId, batchRedeemId, timestamps, txHashes).
  - When item not in response, returns null.
  - Uses same pattern as useRequestHistory.test.ts (QueryClientProvider, mock fetch, renderHook, waitFor).

---

## Deviations

- **Commit signing:** Commit was created with `--no-gpg-sign` because the environment could not access the GPG agent. You may amend with signing if required: `git commit --amend --no-edit --gpg-sign`.

---

## Validation

- `npm run build` — passed  
- `npm run lint` — passed  
- `npm run lint-tsc` — passed  
- `npm run test` — all 829 tests passed (including 4 new useRequestById tests and existing TransactionDetailPage tests)

---

## Notes for Code Review

- `mock-data.ts` was not deleted (per instructions: "Do NOT delete mock-data.ts"; Phase 4 will remove it).
- useRequestById uses a fixed limit of 200; requests older than the first 200 history items for the user will not be found. Plan documents this trade-off.
