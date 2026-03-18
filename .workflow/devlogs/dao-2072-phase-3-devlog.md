# dao-2072 Phase 3 — Devlog

**Ticket:** dao-2072  
**Phase:** 3 — useRequestById resolves one request from same backend  
**Branch:** dao-2072  
**Commit:** `feat(btc-vault): useRequestById fetches from history API and finds by id`

---

## What was done

- **Step 3.1 — Mapper:** In `src/app/btc-vault/services/ui/mappers.ts`: Added `mapApiItemToVaultRequest(item): VaultRequest`. Maps action → type (deposit/withdrawal via DEPOSIT_ACTIONS); displayStatus → status; assets/shares → amount (bigint); transactionHash → txHashes.submit; timestamp → timestamps; id, epochId, batchRedeemId; failureReason when relevant. TransactionDetailPage continues to use `toRequestDetailDisplay(request, null, rbtcPrice, address)` unchanged.

- **Step 3.2 — useRequestById:** Signature `useRequestById(id, address)`. queryFn: fetches GET /api/btc-vault/v1/history?address={address}&limit=200&page=1; parses JSON; finds item by id; returns mapApiItemToVaultRequest(item) or null. queryKey: `['btc-vault', 'request', id, address]`. enabled: `!!id && !!address`. Removed all MOCK_REQUESTS and mock queryFn.

- **Step 3.3 — TransactionDetailPage:** Calls `useRequestById(id, address ?? undefined)`. Address from useAccount().

- **Step 3.4:** Inline MOCK_REQUESTS and mock path removed.

- **Tests:** useRequestById.test.ts — disabled when id or address undefined; when both set: fetch history, find by id, return mapped VaultRequest or null.

## Deviations

- Commit signing: `--no-gpg-sign` (environment). Amend with `--gpg-sign` locally if required.

## Validation

- npm run build / lint / lint-tsc / test — all passed.
