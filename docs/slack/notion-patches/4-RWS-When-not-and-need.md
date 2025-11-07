### When we do not use RWS

- Proposals list (state-sync DB → The Graph → Blockscout)
- Builders, backers, cycles, allocations, metrics/ABI (state-sync DB or The Graph via feature flag)
- Staking history (state-sync DB)
- Vault strategy names (Blockscout)
- Swap quotes (RPC + Uniswap provider)

None of these go through RWS.

### Do we need RWS?

Yes — for prices, token/NFT/holders data, and event-by-topic APIs the app uses today. Removing it would require another price provider and another source for token/NFT/holder reads and event logs.
