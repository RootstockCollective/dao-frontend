### Caching (dApp, backend, indexers)

**Next.js API (server-side)**

- Proposals (`/api/proposals/v1`), Blockscout proposal fetch — 60 s
- ABI / metrics context (`/api/metrics/abi/context`) — 20 s
- Swap quote (`/api/swap/quote`) — 30 s
- Staking history, vault history, contributors, NFT holders — 60 s
- Vault strategy name (from Blockscout) — 1 h
- Discourse topic (`/api/discourse/topic`) — 5 min
- User tokens (`/user/api/tokens`) — 180 s

**Client (UI)**

- Proposals — refetch on block interval
- Prices — ~5 s
- ABI / rewards — refetch interval when state-sync healthy

**Third-party indexers**

- We cache our calls to The Graph and Blockscout; their internal cache is external.
- Envio is not used in dao-frontend.
