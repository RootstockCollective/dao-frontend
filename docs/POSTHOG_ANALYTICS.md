# PostHog Analytics

This document is the single source of truth for what we track with PostHog in the DAO frontend. It is meant to be read by **both engineers and product** — engineers when adding new measurements, product when interpreting dashboards or asking for new metrics.

> Living document. Update it in the same PR that adds, changes, or removes an event.

## Environment separation

We run the dApp against multiple chains: **local**, **testnet**, and **mainnet**. Mixing analytics across them would pollute every report.

Every event is automatically tagged with an `environment` property derived from `NEXT_PUBLIC_PROFILE`. Values you will see: `local`, `testnet`, `mainnet`, `dev`, `cr.qa`, `dao.qa`, `fork`, `release-candidate-testnet`, `release-candidate-mainnet`.

**For product / analysts:** every insight, funnel, or dashboard should include a filter on `environment` (or be duplicated per environment). When you build a new view, set the filter explicitly so you don't accidentally aggregate test data into production metrics.

Registered globally in `src/instrumentation-client.ts` via `posthog.register({ environment })`.

## Identity model

A user moves through three states: **anonymous → connected → verified**. We model this with two complementary mechanisms — a per-event super property (`auth_status`) for the state *at the time of an event*, and a person property (`is_verified`) for whether the wallet *ever* verified.

| State | Trigger | distinct_id | `auth_status` (super property) | Person properties |
|---|---|---|---|---|
| Anonymous browsing | First visit | PostHog auto-generated random UUID (cookie) | `anonymous` | — |
| Wallet connected | User connects a wallet | `posthog.identify(walletAddress)` → lowercase 0x address | `connected` | `wallet_address`, `first_seen` (set-once) |
| SIWE-verified | User completes the SIWE signature | unchanged (already the wallet) | `verified` | `is_verified: true`, `first_verified_at` (set-once) |

- **On connect** (`src/shared/walletConnection/PostHogWalletSync.tsx`) we call `posthog.identify(walletAddress)`. This pins the `distinct_id` to the wallet and merges the prior anonymous browsing history into that Person, so even pre-connection events are attributed to the wallet. `wallet_address` is also registered as a **super property** for easy filtering/breakdown on any insight.
- **Why identify on connect, not on SIWE:** the signature is only required for minor actions, so most meaningful usage happens with the wallet merely connected. Identifying on connect ensures those users still get a Person profile instead of staying anonymous.
- **On SIWE verification** (`src/shared/hooks/useSignIn.ts`) the wallet is already the distinct_id, so we do **not** re-identify. We only set the person property `is_verified` (with `first_verified_at` set-once) and flip the `auth_status` super property to `verified`.
- **`auth_status` vs `is_verified`:** use the `auth_status` super property to break events down by the user's state *when the event fired* (e.g. failures before vs after signing). Use the `is_verified` person property to build cohorts of wallets that ever verified vs. wallets that only ever connect.
- On disconnect (`DisconnectWorkflowContainer`), `posthog.reset()` clears the distinct_id and super properties (including `auth_status`) and generates a fresh anonymous distinct_id — the next session starts clean. The `is_verified` person property persists on the profile across sessions.

## Event catalog

All amounts are in human-readable token units (not wei). Token symbols are uppercase (`RIF`, `stRIF`, `USDRIF`).

### Authentication

| Event | When it fires | Properties | Captured in |
|---|---|---|---|
| `user_signed_in` | User completes SIWE flow and a JWT is issued (server-side) | `wallet_address`, `$anon_distinct_id` (when client sent one) | `src/app/api/auth/login/route.ts` |
| `wallet_disconnected` | User clicks disconnect and signs out | `wallet_address` | `src/shared/walletConnection/connection/DisconnectWorkflowContainer.tsx` |

### Staking

| Event | When it fires | Properties | Captured in |
|---|---|---|---|
| `stake_allowance_failed` | RIF allowance approval transaction reverted, errored, or was rejected by the user in the wallet | `amount_decimal`, `token` (RIF), `failure_reason` (`user_rejected` \| `tx_failed`), `error_message`, `tx_hash` | `src/app/user/Stake/Steps/StepTwo.tsx` |
| `stake_rif_failed` | Stake transaction reverted, errored, or was rejected by the user in the wallet | `amount_decimal`, `token` (RIF), `failure_reason` (`user_rejected` \| `tx_failed`), `error_message`, `tx_hash` | `src/app/user/Stake/Steps/StepThree.tsx` |
| `unstake_rif_failed` | Unstake transaction reverted, errored, or was rejected by the user | `amount_decimal`, `token` (stRIF), `failure_reason` (`user_rejected` \| `tx_failed`), `error_message`, `tx_hash` | `src/app/user/Unstake/UnstakeModal.tsx` |

### Governance

| Event | When it fires | Properties | Captured in |
|---|---|---|---|
| `proposal_vote_cast_failed` | Vote transaction reverted or was rejected by the user in the wallet | `proposal_id`, `vote`, `tx_hash`, `failure_reason` (`user_rejected` \| `tx_failed`), `error_message` | `src/app/proposals/[id]/components/VotingDetails.tsx` |
| `voting_power_delegate_failed` | Delegation tx reverted or was rejected by the user in the wallet | `delegatee_address`, `failure_reason` (`user_rejected` \| `tx_failed`), `error_message`, `tx_hash` | `src/app/delegate/sections/DelegateContentSection/ConnectedSection.tsx` |
| `voting_power_reclaim_failed` | Reclaim tx reverted or was rejected by the user in the wallet | `previous_delegatee_address`, `failure_reason`, `error_message`, `tx_hash` | `src/app/delegate/sections/DelegateContentSection/ConnectedSection.tsx` |

### Rewards

Successful claims are tracked on-chain by a separate tool. PostHog only keeps the failure event for surfacing wallet rejections and tx reverts in the dApp.

| Event | When it fires | Properties | Captured in |
|---|---|---|---|
| `rewards_claim_failed` | Claim transaction reverted, errored, or was rejected by the user in the wallet | `recipient_type` (`backer` \| `builder`), `reward_type` (`all` \| `rif` \| `rbtc` \| `usdrif`), `failure_reason` (`user_rejected` \| `tx_failed`), `error_message`, `tx_hash` (when a tx was broadcast) | `src/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModal.tsx` |

**Diagnosing failures:** filter by `failure_reason = tx_failed` to isolate real technical failures (excluding wallet rejections). Breakdown by `recipient_type` to compare backer vs builder failure patterns.

### Backing

Successful allocations are tracked on-chain by a separate tool. PostHog only keeps the failure event for surfacing wallet rejections and tx reverts in the dApp.

| Event | When it fires | Properties | Captured in |
|---|---|---|---|
| `backing_allocations_failed` | Allocation transaction reverted, errored, or was rejected by the user in the wallet | `token` (stRIF), `failure_reason` (`user_rejected` \| `tx_failed`), `error_message`, `tx_hash` | `src/app/collective-rewards/allocations/hooks/useAllocateVotes.ts` |

### Auto-captured events (no code)

PostHog SDK also captures these automatically — useful for funnels and engagement without any extra instrumentation:

- `$pageview` — every route navigation.
- `$autocapture` — clicks, form submits, etc. (enabled by default).
- `$exception` — uncaught JS errors and promise rejections (`capture_exceptions: true` in init).

All carry `environment` and `wallet_address` (when a wallet is connected).

---

## For developers — adding a new measurement

1. **Decide the event name.** Use `snake_case`, past tense for completed actions (`stake_rif_confirmed`), present participle / past tense for failures (`stake_rif_failed`). Group by feature prefix (`proposal_*`, `backing_*`).
2. **Pick the right call site.** For transactions, capture inside `executeTxFlow`'s `onSuccess` (confirmed) and `onError` (failed) — this guarantees the event reflects real on-chain outcome, not just an intent.
3. **Include domain-specific properties.** We currently only track failures, so the common shape is `failure_reason`, `error_message`, and `tx_hash` (when a tx was broadcast). Add whatever domain context is readily available at the call site — e.g. `token` and `amount_decimal` for staking, `proposal_id` / `vote` for voting, `recipient_type` / `reward_type` for rewards. We do **not** compute `usd_value` on failure events.
4. **Do not re-add identity properties.** `environment` and `wallet_address` come from super properties automatically.
5. **For server-side captures**, use `getPostHogClient()` from `src/lib/posthog-server.ts`. It already injects `environment` into every captured event. The client is a long-lived singleton with `flushAt: 1`, so `capture()` sends in the background immediately — do **not** call `posthog.shutdown()` per request (it tears down shared state and races across concurrent requests). A single `shutdown()` on `SIGTERM`/`SIGINT` drains the queue on container shutdown (`src/instrumentation.ts`).
6. **Update this document** — add a row to the relevant section above. The PR is not complete without it.

### Minimum capture template

Failure event captured from `executeTxFlow`'s `onError` (or a wagmi error effect):

```ts
import { txFailureProps } from '@/components/ErrorPage/commonErrors'

posthog.capture('feature_action_failed', {
  // Domain context (best-effort, whatever is available at the call site):
  token: tokenSymbol,
  amount_decimal: Number(amount) || 0,
  // Shared failure props: failure_reason ('user_rejected' | 'tx_failed') + truncated error_message:
  ...txFailureProps(error),
  tx_hash: txHash, // omit when no tx was broadcast (e.g. wallet rejection)
})
```

> Always use `txFailureProps(error)` for the failure classification + message. It works for both the synthetic error from `executeTxFlow` and raw wagmi errors, and keeps `error_message` truncated (full detail/stacktrace lives in Sentry).

### Setup files (engineering reference)

- `src/instrumentation-client.ts` — `posthog.init` + `environment` super property
- `src/lib/posthog-server.ts` — server-side client with `environment` injection
- `src/shared/walletConnection/PostHogWalletSync.tsx` — `wallet_address` super property sync
- `src/app/api/auth/login/route.ts` — `identify()` and server-side `user_signed_in`
- `next.config.mjs` — `/ingest` reverse proxy (avoids ad-blockers)