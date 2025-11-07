### Subgraph queries per environment

**CR subgraph:** `THE_GRAPH_URL` + `THE_GRAPH_API_KEY` + `THE_GRAPH_ID`
**DAO (Governance) subgraph:** `DAO_GRAPH_URL` + `DAO_GRAPH_API_KEY` + `DAO_GRAPH_ID`

Same query shape for all environments; the base URL and API key change per profile (dev / testnet / mainnet). To query a specific environment, use that environment's values for the env vars above.

**Where to find example queries:**

- Proposals: `src/app/proposals/actions/proposalsAction.ts`
- Contributors: `src/app/delegate/actions/delegateAction.ts`
- CR entities: in the `rootstock-collective-subgraphs` repo
- Governance entities: in the `rootstock-collective-governance-subgraph` repo
