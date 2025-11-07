### Is the read pattern consistent across features?

No. Each feature uses a different pattern:

- **Proposals**: strict fallback chain — 1) State-sync DB, 2) The Graph (Governance), 3) Blockscout. Response header `X-Source` on `/api/proposals/v1` indicates which source was used.
- **Rewards** (builders, backers, cycles, allocations, metrics/ABI): **no fallback chain**. Source is **either** state-sync DB **or** The Graph, depending on feature flag (`NEXT_PUBLIC_ENABLE_FEATURE_USE_STATE_SYNC`) and state-sync health.
- **Balances**: on-chain (Wagmi/Viem) + RWS for token list. No state-sync/Graph fallback.
