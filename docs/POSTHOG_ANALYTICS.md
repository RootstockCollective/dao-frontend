# PostHog Analytics

This document is the single source of truth for what we track with PostHog in the DAO frontend. It is meant to be read by **both engineers and product** — engineers when adding new measurements, product when interpreting dashboards or asking for new metrics.

> Living document. Update it in the same PR that adds, changes, or removes an event.

## Environment separation

We run the dApp against multiple chains: **local**, **testnet**, and **mainnet**. Mixing analytics across them would pollute every report.

Every event is automatically tagged with an `environment` property derived from `NEXT_PUBLIC_PROFILE`. Values you will see: `local`, `testnet`, `mainnet`, `dev`, `cr.qa`, `dao.qa`, `fork`, `release-candidate-testnet`, `release-candidate-mainnet`.

**For product / analysts:** every insight, funnel, or dashboard should include a filter on `environment` (or be duplicated per environment). When you build a new view, set the filter explicitly so you don't accidentally aggregate test data into production metrics.

Registered globally in `src/instrumentation-client.ts` via `posthog.register({ environment })`.

## Identity model

| Layer | Mechanism | Value |
|---|---|---|
| Anonymous browsing | PostHog auto-generated `distinct_id` (cookie) | random UUID |
| Wallet connected | Super property `wallet_address` on every event | lowercase 0x address |
| SIWE-authenticated | `posthog.identify(walletAddress)` lowercase 0x address  |

- `wallet_address` is registered as a **super property** as soon as the user connects a wallet (see `src/shared/walletConnection/PostHogWalletSync.tsx`). You can filter or break down by wallet on any insight without manually adding it to each capture.
- On `posthog.identify` we also set `wallet_address` as a **person property**, so the Persons view shows the wallet.
- On disconnect (`DisconnectWorkflowContainer`), `posthog.reset()` clears the distinct_id and super properties — the next session starts fresh.

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
| `stake_rif_confirmed` | RIF → stRIF transaction mined successfully on-chain | `amount` (string), `amount_decimal` (number), `token` (RIF), `token_price_usd`, `usd_value`, `token_to_receive` (stRIF contract) | `src/app/user/Stake/Steps/StepThree.tsx` |
| `stake_rif_failed` | Stake transaction reverted, errored, or was rejected by the user in the wallet | same as `_confirmed` + `failure_reason` (`user_rejected` \| `tx_failed`), `error_message`, `tx_hash` | `src/app/user/Stake/Steps/StepThree.tsx` |
| `unstake_rif_confirmed` | stRIF → RIF transaction mined successfully on-chain | `amount`, `amount_decimal`, `token` (stRIF), `token_price_usd`, `usd_value` | `src/app/user/Unstake/UnstakeModal.tsx` |
| `unstake_rif_failed` | Unstake transaction reverted, errored, or was rejected by the user | same as `_confirmed` + `failure_reason`, `error_message`, `tx_hash` | `src/app/user/Unstake/UnstakeModal.tsx` |

**Volume reporting:** use `amount_decimal` (numeric) with PostHog's `Property sum` math for per-token volume. Use `usd_value` to aggregate volume across tokens in a single chart.

**Success rate:** funnel `stake_rif_confirmed` vs `stake_rif_failed` (filter the failed event by `failure_reason = tx_failed` if you only want real failures, excluding wallet rejections).

### Governance

| Event | When it fires | Properties | Captured in |
|---|---|---|---|
| `proposal_page_viewed` | User loads the proposals list page | — | `src/app/proposals/page.tsx` |
| `proposal_submitted` | User submits a new proposal (tx broadcast) | `proposal_name`, `proposal_category`, `tx_hash` | `src/app/proposals/new/review/page.tsx` |
| `proposal_vote_cast` | User casts a vote (for / against / abstain) | `proposal_id`, `vote` | `src/app/proposals/[id]/components/VotingDetails.tsx` |
| `proposal_queued` | User queues a succeeded proposal for execution | `proposal_id` | `src/app/proposals/[id]/components/VotingDetails.tsx` |
| `proposal_executed` | User executes a queued proposal | `proposal_id` | `src/app/proposals/[id]/components/VotingDetails.tsx` |

### Rewards

| Event | When it fires | Properties | Captured in |
|---|---|---|---|
| `rewards_claimed` | User clicks "Claim now" for available rewards | `reward_type` (backer \| builder), `total_fiat_amount` | `src/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModalView.tsx` |

### Backing

| Event | When it fires | Properties | Captured in |
|---|---|---|---|
| `backing_distributed_equally` | User clicks "Distribute equally" across selected builders | `allocations_count` | `src/app/backing/BackingPage.tsx` |
| `backing_allocations_saved` | User saves updated stRIF allocations on-chain | — | `src/app/shared/components/BuilderCard/BuilderCardControl.tsx` |

### Auto-captured events (no code)

PostHog SDK also captures these automatically — useful for funnels and engagement without any extra instrumentation:

- `$pageview` — every route navigation.
- `$autocapture` — clicks, form submits, etc. (enabled by default).
- `$exception` — uncaught JS errors and promise rejections (`capture_exceptions: true` in init).

All carry `environment` and `wallet_address` (when a wallet is connected).

---

## Existing dashboards & insights

Created during the initial integration:

- [Analytics basics dashboard](https://us.posthog.com/project/431518/dashboard/1604423)
- [User sign-ins over time](https://us.posthog.com/project/431518/insights/urqkPauY) — daily unique users signing in
- [Governance actions over time](https://us.posthog.com/project/431518/insights/wedzHhgO) — proposals submitted, votes cast, executions
- [Staking activity](https://us.posthog.com/project/431518/insights/4oY9W1aI) — RIF stake vs unstake volume
- [Rewards & backing activity](https://us.posthog.com/project/431518/insights/JhZ6CHgH)

> Remember to apply the `environment` filter when reviewing any of these — defaults can vary.

---

## For developers — adding a new measurement

1. **Decide the event name.** Use `snake_case`, past tense for completed actions (`stake_rif_confirmed`), present participle / past tense for failures (`stake_rif_failed`). Group by feature prefix (`proposal_*`, `backing_*`).
2. **Pick the right call site.** For transactions, capture inside `executeTxFlow`'s `onSuccess` (confirmed) and `onError` (failed) — this guarantees the event reflects real on-chain outcome, not just an intent.
3. **Include domain-specific properties.** For value-moving events, always include: `amount` (string, raw), `amount_decimal` (number), `token` (symbol), and where possible `usd_value` — this is what enables volume reporting.
4. **Do not re-add identity properties.** `environment` and `wallet_address` come from super properties automatically.
5. **For server-side captures**, use `getPostHogClient()` from `src/lib/posthog-server.ts`. It already injects `environment` into every captured event. Make sure to call `posthog.shutdown()` (or rely on `flushAt: 1`) before the response returns, otherwise the event may not flush.
6. **Update this document** — add a row to the relevant section above. The PR is not complete without it.

### Minimum capture template

```ts
posthog.capture('feature_action_outcome', {
  // For transactions:
  amount,
  amount_decimal: Number(amount) || 0,
  token: tokenSymbol,
  token_price_usd: Number(price) || 0,
  usd_value: Number(Big(amount || 0).mul(price || 0).toString()) || 0,
  // For failures, also add:
  failure_reason: err.name === 'Rejected TX' ? 'user_rejected' : 'tx_failed',
  error_message: err.message,
  tx_hash: txHash,
})
```

### Setup files (engineering reference)

- `src/instrumentation-client.ts` — `posthog.init` + `environment` super property
- `src/lib/posthog-server.ts` — server-side client with `environment` injection
- `src/shared/walletConnection/PostHogWalletSync.tsx` — `wallet_address` super property sync
- `src/app/api/auth/login/route.ts` — `identify()` and server-side `user_signed_in`
- `next.config.mjs` — `/ingest` reverse proxy (avoids ad-blockers)

---

## Changelog

Track significant additions, removals, and renames here so it's clear what changed and when.

- **2026-05-21** — Documented the existing event catalog. Added `environment` super property (multi-chain separation), `wallet_address` super property (auto-sync with wagmi), `amount_decimal` / `token` / `token_price_usd` / `usd_value` on stake/unstake captures, and new `stake_rif_failed` / `unstake_rif_failed` events for tracking transaction errors.
- **2026-05-20** — Initial PostHog integration. 16 events instrumented across auth, vault, staking, governance, rewards, and backing.
