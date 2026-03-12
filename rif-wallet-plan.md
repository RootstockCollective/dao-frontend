# RIF Wallet Services Removal Plan

> **Ticket**: Remove `NEXT_PUBLIC_RIF_WALLET_SERVICES` (RWS) dependency from `dao-frontend`
>
> **Goal**: Eliminate the RIF Wallet Services backend as a runtime dependency. All blockchain data currently fetched through RWS should be sourced directly via RPC (`viem`) or Blockscout API.

---

## Current State

RWS is used as an HTTP proxy for three categories of blockchain data:

| Category | RWS Endpoint Pattern | Consumer Count |
|----------|---------------------|---------------|
| Event logs | `/address/{addr}/eventsByTopic0?topic0=...` | 11 functions |
| Holders | `/address/{addr}/holders`, `/nfts/{addr}/holders` | 2 functions |
| Prices | `/price?addresses=...&convert=USD` | 1 function |

All RWS calls flow through native `fetch()` in two action files:

- `src/app/collective-rewards/actions.ts` (5 functions)
- `src/app/user/Balances/actions.ts` (6 functions + 1 dead)
- `.github/scripts/nft_boost/actions.utils.ts` (1 standalone function)

---

## Phase 0: Spike — Validate Replacement Strategies

Before any migration, two unknowns must be resolved.

### 0a. RPC `getLogs` limits

- [ ] Test `publicClient.getLogs()` on Rootstock mainnet RPC with large block ranges (`fromBlock: 5_000_000` to `latest`)
- [ ] Determine if block-range pagination is needed
- [ ] Compare response time vs RWS

### 0b. Blockscout V2 API coverage

- [ ] Verify `/api/v2/tokens/{address}/holders` works for stRIF token holders
- [ ] Verify NFT holder endpoint exists (e.g. `/api/v2/tokens/{address}/holders` with token type filter)
- [ ] Check pagination format, rate limits, data completeness
- [ ] Check if `/api/v2/addresses/{address}/logs` can serve as fallback for event logs

**Output**: Decision on which strategy to use for event logs (`viem getLogs` vs Blockscout) and holders (Blockscout vs custom indexer).

---

- [ ] Single PR: **Yes**
- [ ] Coordination with TOK: **No**
- [ ] Complexity: **Low**
- [ ] Estimated time (AI): **2–3 hours**

---

## Phase 1: Dead Code Removal

Remove unused exports and endpoint templates — artifacts of older RWS integration.

| Item | Location | Reason |
|------|----------|--------|
| `fetchAddressTokensEndpoint` | `src/lib/endpoints.ts` | Replaced by `/user/api/tokens` multicall route |
| `fetchNFTsOwnedByAddressAndNftAddress` | `src/lib/endpoints.ts` | No consumers found |
| `getNftInfo` | `src/lib/endpoints.ts` | No consumers found |
| `parseNewAllocationEvent` | `src/app/collective-rewards/allocations/hooks/useNewAllocationEvent.ts` | Exported but never called |
| `fetchNewAllocationEventByAccountAddress` | `src/app/user/Balances/actions.ts` | Only consumer is dead `parseNewAllocationEvent` |
| `fetchNewAllocationEventEndpoint` | `src/lib/endpoints.ts` | Only consumer removed above |

---

- [ ] Single PR: **Yes**
- [ ] Coordination with TOK: **No**
- [ ] Complexity: **Low**
- [ ] Estimated time (AI): **1–2 hours**

---

## Phase 2: Event Logs Migration

Replace all `eventsByTopic0` RWS calls with direct `publicClient.getLogs()` (or Blockscout, depending on Phase 0 results).

### Shared utility

Create `src/lib/blockchain/getLogs.ts` — a thin wrapper around `publicClient.getLogs()` with optional block-range pagination (if RPC limits require it). All migrated functions will use this utility.

Downstream hooks (`useGetNotifyRewardLogs`, `useGetGaugesEvents`, etc.) already use `parseEventLogs` on raw logs and **require no changes** — only the data-fetching layer changes.

### 2a. Collective Rewards event logs

**File**: `src/app/collective-rewards/actions.ts`

| Function | Event | Contract |
|----------|-------|----------|
| `fetchGaugeNotifyRewardLogs` | `NotifyReward` | Gauge (per address) |
| `fetchBuilderRewardsClaimed` | `BuilderRewardsClaimed` | Gauge (per address) |
| `fetchBackerRewardsClaimed` | `BackerRewardsClaimed` | Gauge (per address) |
| `fetchRewardDistributionFinished` | `RewardDistributionFinished` | BackersManager |
| `fetchRewardDistributionRewards` | `RewardDistributionRewards` | BackersManager |

**Downstream hooks** (no changes needed):

- `useGetNotifyRewardLogs` → builder last-cycle rewards
- `useGetBuilderRewardsClaimedLogs` → builder all-time rewards/share
- `useGetGaugesEvents` → per-gauge reward events (NotifyReward, BackerRewardsClaimed, BuilderRewardsClaimed)
- `useGetRewardDistributionFinishedLogs` → cycle distribution bounds
- `useGetRewardsDistributionRewards` → cycle reward amounts

---

- [ ] Single PR: **Yes**
- [ ] Coordination with TOK: **No**
- [ ] Complexity: **Medium** (5 functions + shared utility + potential pagination)
- [ ] Estimated time (AI): **4–6 hours**

### 2b. Governance event logs

**File**: `src/app/user/Balances/actions.ts`

| Function | Event | Contract |
|----------|-------|----------|
| `fetchProposalCreated` | `ProposalCreated` | Governor |
| `fetchVoteCastEventByAccountAddress` | `VoteCast` | Governor |

**Note**: `fetchProposalCreated` is consumed by `/proposals/api` route (server-side in-memory cache). An alternative Blockscout-based implementation already exists at `src/app/proposals/actions/getProposalsFromBlockscout.ts`. Consider consolidating into a single source.

**Downstream hooks**:

- `useVoteCast` / `useGetVoteForSpecificProposal` → proposal voting UI
- `/proposals/api` route → cached proposal list

---

- [ ] Single PR: **Yes** (can merge with 2a if preferred)
- [ ] Coordination with TOK: **No**
- [ ] Complexity: **Medium** (2 functions + potential Blockscout consolidation)
- [ ] Estimated time (AI): **3–4 hours**

### 2c. GitHub Actions — NFT boost script

**File**: `.github/scripts/nft_boost/actions.utils.ts`

| Function | Event | Notes |
|----------|-------|-------|
| `getNftTransferEvents` | ERC-721 `Transfer` | Queries from block 5,000,000. Script already uses `publicClient` for all other calls. |

Replace with `publicClient.getLogs({ address, topics: [transferTopic], fromBlock: 5_000_000n })`.

---

- [ ] Single PR: **Yes**
- [ ] Coordination with TOK: **Yes** (NFT boost campaigns are coordinated with TOK team)
- [ ] Complexity: **Low**
- [ ] Estimated time (AI): **1–2 hours**

---

## Phase 3: Holders Migration

Token and NFT holder lists require an indexer — raw RPC cannot enumerate holders.

### Strategy (depends on Phase 0 spike)

**Preferred**: Blockscout V2 API

- `/api/v2/tokens/{address_hash}/holders` for stRIF token holders
- Same or similar endpoint for NFT holders (verify in spike)
- Pagination via `?page_token=...`

**Fallback**: Transfer-event-based indexer

- Next.js API route that scans Transfer events via `getLogs` and builds holder map
- Cache with `unstable_cache` or in-memory
- More complex, but no external dependency

### Functions to migrate

| Function | Current RWS Endpoint | Consumers |
|----------|---------------------|-----------|
| `fetchTokenHoldersOfAddress` | `/address/{addr}/holders` | `useFetchTokenHolders` → Treasury HoldersSection |
| `fetchNftHoldersOfAddress` | `/nfts/{addr}/holders` | `getCachedNftHolders` → Communities NFT page |
| | | `getCachedNftHoldersShepherds` → Delegation page (contributors with voting power) |

**Important**: NFT holders flow includes IPFS image URL mapping in `getAllNftHolders` (`src/app/communities/nft/server/fetchNftHolders.ts`). Verify Blockscout provides equivalent metadata or handle separately.

---

- [ ] Single PR: **Yes**
- [ ] Coordination with TOK: **No**
- [ ] Complexity: **High** (pagination format change, IPFS metadata handling, two consumer patterns with `unstable_cache`)
- [ ] Estimated time (AI): **6–8 hours**

---

## Phase 4: Prices — Separate Ticket

`fetchPrices` (`src/app/user/Balances/actions.ts`) calls `/price?addresses=...&convert=USD`. This is the only RWS endpoint providing off-chain data (market prices from external feeds).

### Consumers

- `useFetchPrices` → `useGetSpecificPrices` → BalancesContext, PricesContext, Treasury
- Staking CSV export

### Scope for this ticket

Abstract `fetchPrices` behind a provider interface so the implementation can be swapped without touching consumers. Full replacement deferred to a dedicated ticket.

### Options for future ticket

- External API (CoinGecko, DeFi Llama)
- Lightweight price microservice
- On-chain oracle (if available on Rootstock)

---

- [ ] Single PR: **Yes** (abstraction layer only)
- [ ] Coordination with TOK: **Yes** (pricing source is a product/tokenomics decision)
- [ ] Complexity: **Low** (abstraction) / **Medium** (full replacement — future ticket)
- [ ] Estimated time (AI): **2–3 hours** (abstraction only)

---

## Phase 5: Infrastructure Cleanup

After all consumers are migrated, remove RWS wiring entirely.

| Item | Location |
|------|----------|
| `RIF_WALLET_SERVICES_URL` constant | `src/lib/constants.ts` |
| `NEXT_PUBLIC_RIF_WALLET_SERVICES` env var | `.env.dev`, `.env.cr.qa`, `.env.dao.qa`, `.env.release-candidate-testnet`, `.env.mainnet`, `.env.release-candidate-mainnet`, `.env.fork`, `.env.testnet.local` |
| `fetchRws()` helper | `src/app/collective-rewards/actions.ts` |
| `fetchRws()` helper | `src/app/user/Balances/actions.ts` |
| Remaining endpoint templates | `src/lib/endpoints.ts` (remove file if empty after Phase 1 + 2) |
| CORS bypass config (`corsBypassProxyConfig`, `corsBypassRewrite`, `rifWalletServicesURL`) | `next.config.mjs` |
| `NEXT_PUBLIC_ENABLE_CORS_BYPASS` env var | `.env.*` files |
| `NEXT_PUBLIC_PROXY_DESTINATION` env var | `.env.*` files |

---

- [ ] Single PR: **Yes**
- [ ] Coordination with TOK: **No**
- [ ] Complexity: **Low**
- [ ] Estimated time (AI): **2–3 hours**

---

## Execution Order

```
Phase 0 (Spike)
    │
    ├──→ Phase 1 (Dead code)
    ├──→ Phase 2a (CR event logs)
    ├──→ Phase 2b (Governance logs)
    ├──→ Phase 2c (GH Actions)
    └──→ Phase 3 (Holders)
              │
              ▼
         Phase 5 (Cleanup)

Phase 4 (Prices) ···→ separate ticket, does not block Phase 5 if abstraction is in place
```

Phases 1, 2a, 2b, 2c, 3 can run in parallel after the spike. Phase 5 is the final cleanup after everything else lands.

---

## Summary

| Phase | Scope | Complexity | Time (AI) | Coord w/ TOK | Single PR |
|-------|-------|-----------|-----------|--------------|-----------|
| 0 | Spike: validate getLogs + Blockscout | Low | 2–3h | No | Yes |
| 1 | Dead code removal | Low | 1–2h | No | Yes |
| 2a | CR event logs (5 functions) | Medium | 4–6h | No | Yes |
| 2b | Governance event logs (2 functions) | Medium | 3–4h | No | Yes |
| 2c | GH Actions NFT boost (1 function) | Low | 1–2h | Yes | Yes |
| 3 | Holders migration (2 functions) | High | 6–8h | No | Yes |
| 4 | Prices abstraction | Low | 2–3h | Yes | Yes |
| 5 | Infrastructure cleanup | Low | 2–3h | No | Yes |
| **Total** | | | **21–31h** | | **8 PRs** |
