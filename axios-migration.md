# Axios to Fetch Migration Plan

## Overview

Remove the `axios` dependency and replace all usages with the native `fetch` API.

---

## Phase 1 — Replace axios with fetchClient wrapper

- [x] **1. Migrate core `axiosInstance` in `src/lib/utils/utils.ts`**
- [x] **2. Migrate `axiosInstance` in `src/app/providers/NFT/BoosterContext.tsx`**
- [x] **3. Migrate `AxiosResponse` type usage in `src/shared/utils.ts`**
- [x] **4. Migrate `axiosInstance` usage in `src/shared/hooks/useCommunity.ts`**
- [x] **5. Migrate `axiosInstance` usage in `src/app/user/Balances/hooks/useGetAddressTokens.ts`**
- [x] **6. Migrate `axiosInstance` usage in `src/app/user/Balances/actions.ts`**
- [x] **7. Migrate `axiosInstance` usage in `src/app/providers/NFT/boost.utils.ts`**
- [x] **8. Migrate `axiosInstance` usage in `src/app/collective-rewards/actions.ts`**
- [x] **9. Migrate direct `axios.get()` in `.github/scripts/nft_boost/actions.utils.ts`**
- [x] **10. Remove `axios` dependency from `package.json` and `package-lock.json`**

---

## Phase 2 — Remove fetchClient wrapper, use plain `fetch` directly

The `fetchClient` wrapper (`src/lib/utils/utils.ts:63-92`) adds two things:

1. **Base URL** — prepends `RIF_WALLET_SERVICES_URL` to relative paths
2. **chainId injection** — appends `chainId` if not already in the URL

**Problem:** Every endpoint in `src/lib/endpoints.ts` already embeds `chainId` in the URL string (via `CHAIN_ID_PARAM`), making the wrapper's chainId injection redundant. The local Next.js API calls (`baseURL: '/'`) don't need the wrapper at all.

### Category A — Local Next.js API routes

These call internal Next.js route handlers. They don't need `fetchClient` — plain `fetch` with `.json()` is sufficient.

**Goal:** Replace `fetchClient.get<T>(path, { baseURL: '/' }).then(({ data }) => data)` with `fetch(path).then(res => res.json()) as Promise<T>`.

- [x] **A1.** `src/shared/hooks/useCommunity.ts` — lines 65–67
  - Current: `fetchClient.get<NftDataFromAddressesReturnType>('/user/api/communities', { baseURL: '/' }).then(({ data }) => data)`
  - Target: `fetch('/user/api/communities').then(res => res.json() as Promise<NftDataFromAddressesReturnType>)`
  - Also: remove `fetchClient` from the import on line 11

- [x] **A2.** `src/app/user/Balances/hooks/useGetAddressTokens.ts` — line 68
  - Current: `fetchClient.get<TokenInfoReturnType>('/user/api/tokens', { baseURL: '/' }).then(({ data }) => data)`
  - Target: `fetch('/user/api/tokens').then(res => res.json() as Promise<TokenInfoReturnType>)`
  - Also: remove `fetchClient` import on line 7

- [ ] **A3.** `src/app/user/Balances/actions.ts` — line 70
  - Current: `fetchClient.get<any>('/proposals/api', { baseURL: '/' })`
  - Target: `fetch('/proposals/api').then(res => res.json()).then(data => ({ data }))`
  - Note: callers destructure `{ data }` from the return value (`handleCachedGetRequest` in `src/app/proposals/api/route.ts:14`), so the `{ data }` wrapper must be preserved or the caller updated too

### Category B — RIF Wallet Services (Blockscout) endpoints

These use `fetchClient` only for its base URL (`RIF_WALLET_SERVICES_URL`). The `chainId` is already in every endpoint URL defined in `src/lib/endpoints.ts`.

**Goal:** Build the full URL inline as `` `${RIF_WALLET_SERVICES_URL}${endpointPath}` `` and call `fetch()` directly. Return parsed JSON wrapped in `{ data }` (to match current caller expectations), or update callers to consume the response directly.

- [ ] **B1.** `src/app/user/Balances/actions.ts` — lines 22–32 (`fetchPrices`)
  - Current: `fetchClient.get<GetPricesResult>(fetchPricesEndpoint...)`
  - Target: `fetch(\`${RIF_WALLET_SERVICES_URL}${fetchPricesEndpoint...}\`).then(res => res.json())`
  - Note: `.then(({ data: prices }) => ...)` on line 33 destructures `data` — must update to receive JSON directly

- [ ] **B2.** `src/app/user/Balances/actions.ts` — lines 47–51 (`fetchProposalCreated`)
  - Current: `fetchClient.get<BackendEventByTopic0ResponseValue[]>(fetchProposalsCreatedByGovernorAddress...)`
  - Target: plain `fetch` with full URL
  - Note: return value is consumed by `handleCachedGetRequest` in `src/app/proposals/api/route.ts:14` and `src/shared/utils.ts:66` which destructures `{ data }` — the `FetchResponse` wrapper or caller must be updated

- [ ] **B3.** `src/app/user/Balances/actions.ts` — lines 56–60 (`fetchVoteCastEventByAccountAddress`)
  - Current: `fetchClient.get<BackendEventByTopic0ResponseValue[]>(fetchVoteCastEventEndpoint...)`
  - Target: plain `fetch` with full URL

- [ ] **B4.** `src/app/user/Balances/actions.ts` — lines 63–67 (`fetchNewAllocationEventByAccountAddress`)
  - Current: `fetchClient.get<BackendEventByTopic0ResponseValue[]>(fetchNewAllocationEventEndpoint...)`
  - Target: plain `fetch` with full URL

- [ ] **B5.** `src/app/user/Balances/actions.ts` — lines 73–75 (`fetchNftHoldersOfAddress`)
  - Current: `fetchClient.get<ServerResponseV2<NftHolderItem>>(getNftHolders..., { params: { nextPageParams: nextParams } })`
  - Target: plain `fetch` with full URL + manually serialize `nextPageParams` query string
  - Note: this is one of two call sites that use `params` — need `URLSearchParams` or manual serialization

- [ ] **B6.** `src/app/user/Balances/actions.ts` — lines 84–86 (`fetchTokenHoldersOfAddress`)
  - Current: `fetchClient.get<ServerResponseV2<TokenHoldersResponse>>(getTokenHoldersOfAddress..., { params: { nextPageParams: nextParams } })`
  - Target: plain `fetch` with full URL + manually serialize `nextPageParams` query string
  - Note: same `params` consideration as B5

- [ ] **B7.** `src/app/collective-rewards/actions.ts` — lines 14–18 (`fetchGaugeNotifyRewardLogs`)
  - Current: `fetchClient.get<any>(fetchGaugeNotifyRewardLogsByAddress...)`
  - Target: plain `fetch` with full URL

- [ ] **B8.** `src/app/collective-rewards/actions.ts` — lines 22–26 (`fetchBuilderRewardsClaimed`)
  - Current: `fetchClient.get<any>(fetchBuilderRewardsClaimedLogsByAddress...)`
  - Target: plain `fetch` with full URL

- [ ] **B9.** `src/app/collective-rewards/actions.ts` — lines 30–34 (`fetchBackerRewardsClaimed`)
  - Current: `fetchClient.get<any>(fetchBackerRewardsClaimedLogsByAddress...)`
  - Target: plain `fetch` with full URL

- [ ] **B10.** `src/app/collective-rewards/actions.ts` — lines 38–42 (`fetchRewardDistributionFinished`)
  - Current: `fetchClient.get<any>(fetchRewardDistributionFinishedLogsByAddress...)`
  - Target: plain `fetch` with full URL

- [ ] **B11.** `src/app/collective-rewards/actions.ts` — lines 46–50 (`fetchRewardDistributionRewards`)
  - Current: `fetchClient.get<any>(fetchRewardDistributionRewardsLogsByAddress...)`
  - Target: plain `fetch` with full URL

### Category C — Remove fetchClient and supporting code

Once all callers in Categories A and B are migrated, these can be deleted.

- [ ] **C1.** `src/lib/utils/utils.ts` — lines 40–92
  - Remove: `FetchGetConfig` interface, `FetchResponse` interface, `serializeParams` function, `fetchClient` object
  - Also: remove `CHAIN_ID, RIF_WALLET_SERVICES_URL` from the import on line 7 (if no longer used)

- [ ] **C2.** `src/shared/utils.ts` — line 3
  - Remove: `import type { FetchResponse } from '@/lib/utils'`
  - Update: `handleCachedGetRequest` and `fetchFunction` signatures (lines 32, 57) — replace `Promise<FetchResponse<unknown>>` with the actual return type of the callback (e.g. `Promise<{ data: unknown }>` or `Promise<Response>`)
  - Downstream: `src/app/proposals/api/route.ts:14` passes `fetchProposalCreated` as the callback — its return type must match

### Category D — Simplify endpoints to include full URL

Optional follow-up: move `RIF_WALLET_SERVICES_URL` prefix into `src/lib/endpoints.ts` so each endpoint exports a complete URL rather than a relative path. This eliminates base URL logic at every call site.

- [ ] **D1.** `src/lib/endpoints.ts` — all endpoint constants
  - Current: `/address/{{address}}/eventsByTopic0?topic0=...&chainId=...`
  - Target: `${RIF_WALLET_SERVICES_URL}/address/{{address}}/eventsByTopic0?topic0=...&chainId=...`
