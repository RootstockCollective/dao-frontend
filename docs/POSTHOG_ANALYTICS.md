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
| `stake_allowance_approved` | RIF allowance approval transaction mined successfully (step 2 of staking flow, prerequisite for the actual stake) | `amount` (string), `amount_decimal` (number), `token` (RIF), `token_price_usd`, `usd_value`, `tx_hash` | `src/app/user/Stake/Steps/StepTwo.tsx` |
| `stake_allowance_failed` | Allowance approval transaction reverted, errored, or was rejected by the user in the wallet | same as `_approved` + `failure_reason` (`user_rejected` \| `tx_failed`), `error_message` | `src/app/user/Stake/Steps/StepTwo.tsx` |
| `stake_rif_confirmed` | RIF → stRIF transaction mined successfully on-chain | `amount` (string), `amount_decimal` (number), `token` (RIF), `token_price_usd`, `usd_value`, `token_to_receive` (stRIF contract) | `src/app/user/Stake/Steps/StepThree.tsx` |
| `stake_rif_failed` | Stake transaction reverted, errored, or was rejected by the user in the wallet | same as `_confirmed` + `failure_reason` (`user_rejected` \| `tx_failed`), `error_message`, `tx_hash` | `src/app/user/Stake/Steps/StepThree.tsx` |
| `unstake_rif_confirmed` | stRIF → RIF transaction mined successfully on-chain | `amount`, `amount_decimal`, `token` (stRIF), `token_price_usd`, `usd_value` | `src/app/user/Unstake/UnstakeModal.tsx` |
| `unstake_rif_failed` | Unstake transaction reverted, errored, or was rejected by the user | same as `_confirmed` + `failure_reason`, `error_message`, `tx_hash` | `src/app/user/Unstake/UnstakeModal.tsx` |

**Volume reporting:** use `amount_decimal` (numeric) with PostHog's `Property sum` math for per-token volume. Use `usd_value` to aggregate volume across tokens in a single chart.

**Success rate:** funnel `stake_rif_confirmed` vs `stake_rif_failed` (filter the failed event by `failure_reason = tx_failed` if you only want real failures, excluding wallet rejections).

**Allowance → stake funnel:** for first-time stakers, the on-chain flow is `stake_allowance_approved` → `stake_rif_confirmed`. Build a funnel on these two events to measure drop-off between approving the allowance and actually staking — a common failure mode is users who approve but then bounce before signing the stake.

### Governance

| Event | When it fires | Properties | Captured in |
|---|---|---|---|
| `proposal_page_viewed` | User loads the proposals list page | — | `src/app/proposals/page.tsx` |
| `proposal_submitted` | User submits a new proposal (tx broadcast) | `proposal_name`, `proposal_category`, `tx_hash` | `src/app/proposals/new/review/page.tsx` |
| `proposal_vote_cast` | Vote transaction (for / against / abstain) mined successfully on-chain | `proposal_id`, `vote`, `tx_hash` | `src/app/proposals/[id]/components/VotingDetails.tsx` |
| `proposal_vote_cast_failed` | Vote transaction reverted or was rejected by the user in the wallet | `proposal_id`, `vote`, `tx_hash`, `failure_reason` (`user_rejected` \| `tx_failed`), `error_message` | `src/app/proposals/[id]/components/VotingDetails.tsx` |
| `proposal_queued` | User queues a succeeded proposal for execution | `proposal_id` | `src/app/proposals/[id]/components/VotingDetails.tsx` |
| `proposal_executed` | User executes a queued proposal | `proposal_id` | `src/app/proposals/[id]/components/VotingDetails.tsx` |
| `voting_power_delegated` | **Intent** — user clicks "Delegate" in the delegation modal on `/delegate` | `delegatee_address`, `delegatee_rns` (RNS name if known, else empty string), `voting_power_str`, `voting_power_decimal`, `is_self_delegation` (true if delegating to own wallet) | `src/app/delegate/sections/DelegateContentSection/ConnectedSection.tsx` |
| `voting_power_delegate_confirmed` | Delegation tx mined on-chain | same as `voting_power_delegated` + `tx_hash` | `src/app/delegate/sections/DelegateContentSection/ConnectedSection.tsx` |
| `voting_power_delegate_failed` | Delegation tx reverted or was rejected by the user in the wallet | same as `voting_power_delegated` + `failure_reason` (`user_rejected` \| `tx_failed`), `error_message`, `tx_hash` | `src/app/delegate/sections/DelegateContentSection/ConnectedSection.tsx` |
| `voting_power_reclaimed` | **Intent** — user clicks "Reclaim" in the reclaim modal on `/delegate` (i.e. delegating back to themselves) | `delegatee_address` (= the user's own address), `previous_delegatee_address`, `previous_delegatee_rns`, `voting_power_str`, `voting_power_decimal` | `src/app/delegate/sections/DelegateContentSection/ConnectedSection.tsx` |
| `voting_power_reclaim_confirmed` | Reclaim tx mined on-chain | same as `voting_power_reclaimed` + `tx_hash` | `src/app/delegate/sections/DelegateContentSection/ConnectedSection.tsx` |
| `voting_power_reclaim_failed` | Reclaim tx reverted or was rejected by the user in the wallet | same as `voting_power_reclaimed` + `failure_reason`, `error_message`, `tx_hash` | `src/app/delegate/sections/DelegateContentSection/ConnectedSection.tsx` |

**Delegation vs reclaim:** both call the same underlying contract function (`delegate(address)`), but the UI distinguishes them: delegate = giving voting power to someone else, reclaim = taking it back to yourself. Tracking them as separate events makes the dashboards more readable and enables UX comparisons (e.g., does reclaim see more wallet-rejections than delegate?).

**Delegation churn:** count `voting_power_delegate_confirmed` per unique wallet over time, breakdown by `delegatee_address`. Identifies popular delegates and switching behavior. Pair with `voting_power_reclaim_confirmed` to measure how often users re-take control of their vote.

### Rewards

The claim flow emits three lifecycle events. The split between `recipient_type` (backer vs builder, two distinct contract calls) and `reward_type` (which token bucket the user picked: all / RIF / RBTC / USDRIF) is intentional — they're orthogonal dimensions.

| Event | When it fires | Properties | Captured in |
|---|---|---|---|
| `rewards_claimed` | **Intent** — user clicks "Claim now" (before the wallet popup). Fires only if rewards are claimable. | `recipient_type` (`backer` \| `builder`), `reward_type` (`all` \| `rif` \| `rbtc` \| `usdrif`), `claimed_fiat_total` (USD of what is actually being claimed), `claimed_rif_amount` / `claimed_rif_fiat`, `claimed_rbtc_amount` / `claimed_rbtc_fiat`, `claimed_usdrif_amount` / `claimed_usdrif_fiat` (token-specific amounts are 0 when not part of the selection), `total_fiat_amount` (total USD available across all tokens — back-compat) | `src/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModal.tsx` |
| `rewards_claim_confirmed` | **On-chain success** — claim transaction was mined successfully | same as `rewards_claimed` + `tx_hash` | `src/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModal.tsx` |
| `rewards_claim_failed` | Claim transaction reverted, errored, or was rejected by the user in the wallet | same as `rewards_claimed` + `failure_reason` (`user_rejected` \| `tx_failed`), `error_message` | `src/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModal.tsx` |

**Volume reporting:** sum `claimed_rif_amount` / `claimed_rbtc_amount` / `claimed_usdrif_amount` on `rewards_claim_confirmed` for actual on-chain claimed volume per token. Sum `claimed_fiat_total` for total USD claimed. Use `rewards_claimed` only for intent / drop-off measurement, not for volume.

**Backer vs builder behavior:** breakdown any of the three events by `recipient_type` to compare backer claim patterns vs builder claim patterns. They're separate contract calls (`claimBackerRewards` vs `claimBuilderReward`) and product may want to track them independently.

**Reward type preference:** breakdown by `reward_type` on `rewards_claim_confirmed` to see whether users prefer claiming everything at once or specific tokens.

**Claim success rate:** funnel `rewards_claimed` → `rewards_claim_confirmed`. Drop-off = wallet rejections + on-chain failures. Filter `rewards_claim_failed` by `failure_reason = tx_failed` to isolate real technical failures.

### Backing

The backing flow emits **three levels of events**: intent (click), on-chain confirmation, and on-chain failure. Plus a per-builder event that fires only on confirmation, designed for Builder Program analysis.

| Event | When it fires | Properties | Captured in |
|---|---|---|---|
| `backing_distributed_equally` | User clicks "Distribute equally" across selected builders | `allocations_count` | `src/app/backing/BackingPage.tsx` |
| `backing_allocations_saved` | **Intent** — user clicks "Save new backing amounts" (before the wallet popup) | `token` (stRIF), `builders_count`, `total_allocated_str` / `total_allocated_decimal` (sum across all builders after the proposed save), `change_summary` (`{ added, increased, decreased, removed }`), `changes` (array of per-builder diffs — see schema below) | `src/app/collective-rewards/allocations/hooks/useAllocateVotes.ts` |
| `backing_allocations_confirmed` | **On-chain success** — allocation transaction was mined successfully | same as `_saved` + `tx_hash` | `src/app/collective-rewards/allocations/hooks/useAllocateVotes.ts` |
| `backing_allocations_failed` | Allocation transaction reverted, errored, or was rejected by the user in the wallet | same as `_saved` + `failure_reason` (`user_rejected` \| `tx_failed`), `error_message`, `tx_hash` | `src/app/collective-rewards/allocations/hooks/useAllocateVotes.ts` |
| `backing_allocation_changed` | Fires once per builder whose allocation changed, **only after on-chain confirmation**. If the user changes 5 builders in one save, 5 of these events are emitted alongside `backing_allocations_confirmed`. | `token` (stRIF), `builder_address`, `previous_amount_str`, `previous_amount_decimal`, `new_amount_str`, `new_amount_decimal`, `delta_decimal` (signed: positive = increase), `change_type` (`added` \| `increased` \| `decreased` \| `removed`), `tx_hash` | `src/app/collective-rewards/allocations/hooks/useAllocateVotes.ts` |

**`changes` array schema** (inside `backing_allocations_saved` / `_confirmed` / `_failed`): each item has `builder_address`, `previous_amount_str`, `previous_amount_decimal`, `new_amount_str`, `new_amount_decimal`, `delta_decimal`, `change_type`. Same shape as a per-builder event.

**Intent vs confirmed:** `backing_allocations_saved` always fires when the user clicks save — even if they reject the tx in the wallet or it reverts. Use this to measure user *intent*. Use `backing_allocations_confirmed` for actual on-chain volume. The drop-off between the two = wallet abandonment + tx failure rate.

**Allocation per builder over time (Builder Program):** use `backing_allocation_changed`, math = `Property sum` on `new_amount_decimal`, breakdown by `builder_address`. To track net inflow/outflow, sum `delta_decimal` instead. Filter by `change_type = added` to count first-time backers per builder. This event only fires on confirmed saves, so the data reflects on-chain reality.

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

- **2026-05-22** — Moved `proposal_vote_cast` capture into `onSuccess` of `executeTxFlow` so it now reflects on-chain confirmation (was intent-time before). Added `proposal_vote_cast_failed` on transaction error / wallet rejection.
- **2026-05-22** — Added delegation lifecycle events on `/delegate`: `voting_power_delegated` / `_delegate_confirmed` / `_delegate_failed` for delegating to another wallet; `voting_power_reclaimed` / `_reclaim_confirmed` / `_reclaim_failed` for taking voting power back to self. Both flows use the same underlying contract call but are tracked as separate events for clarity.
- **2026-05-22** — Enriched and split the `rewards_claimed` flow into 3 lifecycle events: `rewards_claimed` (intent — now with per-token amounts and `recipient_type` backer/builder), `rewards_claim_confirmed` (on-chain success), `rewards_claim_failed` (revert / wallet rejection). Capture moved from `ClaimRewardsModalView` to the wrapper components where the recipient type and tx lifecycle live. Fixed the old doc entry where `reward_type` was wrongly described as `backer | builder` — it's actually the token selection (`all | rif | rbtc | usdrif`), and `recipient_type` is the new separate dimension.
- **2026-05-22** — Refactored backing analytics into `useAllocateVotes` hook (single source of truth, decoupled from UI). Split into 3 lifecycle events: `backing_allocations_saved` (intent), `backing_allocations_confirmed` (on-chain success), `backing_allocations_failed` (revert / wallet rejection). Per-builder `backing_allocation_changed` now fires only on confirmation, so its data reflects on-chain reality.
- **2026-05-21** — Enriched `backing_allocations_saved` with per-save summary (builders count, total allocated, change breakdown, full diff array). Added `backing_allocation_changed` as one event per builder per save — unlocks per-builder allocation analysis for the Builder Program.
- **2026-05-21** — Added `stake_allowance_approved` and `stake_allowance_failed` to track the RIF allowance approval step that precedes staking. Enables the allowance → stake conversion funnel.
- **2026-05-21** — Documented the existing event catalog. Added `environment` super property (multi-chain separation), `wallet_address` super property (auto-sync with wagmi), `amount_decimal` / `token` / `token_price_usd` / `usd_value` on stake/unstake captures, and new `stake_rif_failed` / `unstake_rif_failed` events for tracking transaction errors.
- **2026-05-20** — Initial PostHog integration. 16 events instrumented across auth, vault, staking, governance, rewards, and backing.
