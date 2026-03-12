# Envio Indexer Integration (DAO-1875)

This document describes the integration of the [Envio](https://envio.dev/) indexer as the **primary data source for proposals** in the DAO frontend.

## Background

Before this change, the frontend fetched proposals using a fallback chain of three sources:

1. **State Sync DB** (backend database)
2. **The Graph** (decentralized indexer)
3. **Blockscout** (block explorer API)

Each source had trade-offs: The Graph requires a paid API key and can be slow; Blockscout is a last-resort fallback with limited data; the DB depends on the backend sync process.

**Why Envio?** Envio provides a self-hosted, fast indexer with a GraphQL API that gives us full control over indexed data. It supports HyperSync for up to 2000x faster syncing on supported chains and doesn't require third-party API keys for the indexer itself.

## What Changed

### New Proposals Fetcher (`getProposalsFromEnvio.ts`)

A new server-side fetcher was added at `src/app/proposals/actions/getProposalsFromEnvio.ts`. Key design decisions:

- **Zod schema validation** — Runtime type safety for the Envio GraphQL response. If the indexer schema changes unexpectedly, the fetcher throws a clear validation error instead of silently producing bad data.
- **Adapter pattern** — The Envio DTO is transformed into the internal `ProposalApiResponse` format via `buildProposal()`, keeping the domain model decoupled from the data source.
- **Minimum proposals threshold** — The fetcher rejects responses with fewer than 10 proposals. This acts as a health check: if the indexer is still syncing or has stale data, the frontend falls back to the next source.
- **60-second revalidation** — Uses Next.js `fetch` with `next: { revalidate: 60 }` for server-side caching.

### Updated Fallback Chain

The proposals API route (`src/app/api/proposals/v1/route.ts`) now uses a four-source fallback:

| Priority | Source     | X-Source Header | Description                      |
| -------- | ---------- | --------------- | -------------------------------- |
| 1        | Envio      | `source-0`      | Primary — self-hosted indexer    |
| 2        | State Sync | `source-1`      | Backend database                 |
| 3        | The Graph  | `source-2`      | Decentralized indexer            |
| 4        | Blockscout | `source-3`      | Block explorer API (last resort) |

The `X-Source` response header indicates which source served the data. To verify Envio is being used, check for `X-Source: source-0` in the response headers.

### Environment Configuration

The `ENVIO_GRAPHQL_URL` variable was added to environment files. This is a **server-side only** variable (no `NEXT_PUBLIC_` prefix) — it is never exposed to the browser.

## Deployments

The Envio indexer runs as a hosted service. Each environment has its own indexer deployment, pointing to a different Governor contract and chain configuration. The indexer uses **RPC mode** (not HyperSync) since HyperSync is not yet available for Rootstock Testnet.

### Dev Environment

| Property            | Value                                                     |
| ------------------- | --------------------------------------------------------- |
| Environment file    | `.env.dev`                                                |
| Governor contract   | `0xB1A39B8f57A55d1429324EEb1564122806eb297F` (dev params) |
| Chain               | Rootstock Testnet (chain ID 31)                           |
| Envio GraphQL URL   | `https://indexer.dev.hyperindex.xyz/7cc58d6/v1/graphql`   |
| Frontend deployment | `https://dev.app.rootstockcollective.xyz`                 |

### Release Candidate Testnet

| Property            | Value                                                           |
| ------------------- | --------------------------------------------------------------- |
| Environment file    | `.env.release-candidate-testnet`                                |
| Governor contract   | `0xb77ab0075e9805efa82040bed73368d988a2d9c2` (testnet params)   |
| Chain               | Rootstock Testnet (chain ID 31)                                 |
| Envio GraphQL URL   | `https://indexer.dev.hyperindex.xyz/c543c9a/v1/graphql`         |
| Frontend deployment | `https://release-candidate-testnet.app.rootstockcollective.xyz` |

### Mainnet

Mainnet (`env.mainnet`) does **not** have `ENVIO_GRAPHQL_URL` configured yet. When Envio is deployed for mainnet, add the variable and the fallback chain will automatically pick it up as the primary source.

> **Important**: Each environment uses a different Envio deployment ID (the hash in the URL path) because each indexes a different Governor contract address. When redeploying the indexer, update the corresponding deployment ID in the environment file.

## Envio Indexer Repository

The indexer itself lives in a separate repository:

**https://github.com/RootstockCollective/dao-envio-indexer**

Refer to that repository's README for:

- Indexer setup and local development
- Environment configuration (chain ID, start block, Governor address, RPC URL)
- GraphQL schema and example queries
- HyperSync vs RPC data source configuration
- Deploying to Envio's hosted service
- Adding new events or contracts to the indexer

## Verifying the Integration

Quick verification that Envio is working:

```bash
# Start the frontend
PROFILE=dev npm run dev

# In another terminal, check which source is being used
curl -s -D - http://localhost:3000/api/proposals/v1 -o /dev/null 2>&1 | grep X-Source
# Expected: X-Source: source-0
```

## Architecture Overview

```
Browser
  │
  ▼
/api/proposals/v1  (Next.js API route)
  │
  ├─ 1. getProposalsFromEnvio()    ◄── Envio GraphQL (ENVIO_GRAPHQL_URL)
  │     └─ Zod validation
  │     └─ Adapter: DTO → ProposalApiResponse
  │
  ├─ 2. getProposalsFromDB()       ◄── State Sync backend DB
  │
  ├─ 3. getProposalsFromTheGraph() ◄── The Graph subgraph
  │
  └─ 4. getProposalsFromBlockscout() ◄── Blockscout API
        │
        ▼
  Response with X-Source header
```

Each fetcher is tried in order. The first one that returns a non-empty result wins. If all fail, the API returns a 500 error.

## Troubleshooting

**`X-Source: source-1` (or higher) instead of `source-0`**

Envio is not being used as primary. Check:

- `ENVIO_GRAPHQL_URL` is set in your environment file
- The Envio indexer deployment is running and accessible
- The indexer has synced enough proposals (minimum 10 required)
- Check server logs for specific Envio error messages

**`Envio: ENVIO_GRAPHQL_URL environment variable not configured`**

The environment variable is missing. Ensure you're using an environment file that includes it (`.env.dev`, `.env.release-candidate-testnet`, or `.env.fork`).

**`Envio: Invalid response structure`**

The indexer returned data that doesn't match the expected Zod schema. This usually means the indexer's GraphQL schema has changed. Compare the schema in `getProposalsFromEnvio.ts` with the indexer's `schema.graphql`.

**`Envio: Insufficient proposals`**

The indexer returned fewer than 10 proposals. This typically means the indexer is still syncing. Check the indexer's sync progress or lower the `ENVIO_START_BLOCK` in the indexer configuration.

---

## Envio Sync-Check (Indexer Lag Alerts)

**Endpoint:** `GET /api/envio-sync-check` — compares Envio's last synced block to the Rootstock chain tip and posts to Slack when the indexer falls behind.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ENVIO_GRAPHQL_URL` | Yes | Envio GraphQL endpoint. |
| `ENVIO_SYNC_CHECK_RPC_URL` | Yes | Rootstock RPC node for chain tip (`eth_blockNumber`). **Not** the Envio URL. |
| `ENVIO_SYNC_CHECK_SYNC_PROGRESS_ID` | No | SyncProgress entity id. Default `chain-31`. Leave empty for mainnet. |
| `ENVIO_SYNC_CHECK_SLACK_WEBHOOK_URL` | No | Slack Incoming Webhook URL. |
| `ENVIO_SYNC_CHECK_LAG_THRESHOLD_BLOCKS` | No | Alert threshold in blocks. Default 500. |
| `ENVIO_SYNC_CHECK_SECRET` | No | Bearer token for auth. |

### Scheduling

The route runs once per request. Wire it to a scheduler (Vercel Cron, external cron, GitHub Actions) to poll every N minutes.

### Manual QA procedure

**Goal:** Verify end-to-end that the sync-check reaches Envio, reaches Rootstock RPC, and delivers a Slack notification.

**1. Set up Slack webhook (one-time):**

If `ENVIO_SYNC_CHECK_SLACK_WEBHOOK_URL` is already configured, skip to step 2. Otherwise create a webhook once — see [Slack webhook setup](#slack-webhook-setup) below.

**2. Configure `.env.dev`:**

```bash
ENVIO_SYNC_CHECK_RPC_URL=https://public-node.testnet.rsk.co
ENVIO_SYNC_CHECK_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ENVIO_SYNC_CHECK_LAG_THRESHOLD_BLOCKS=0
```

Threshold `0` forces the alert to fire (any lag > 0 triggers it).

**3. Restart dev server and run:**

```bash
PROFILE=dev npm run dev

curl -s http://localhost:3000/api/envio-sync-check | jq
# Expected: { "success": true, "lastBlock": ..., "chainTip": ..., "lag": ..., "threshold": 0, "alerted": true }
# lastBlock > 0 = Envio reachable. chainTip > 0 = RPC reachable. alerted = true = Slack sent.
# Check Slack channel for the lag alert.
```

**4. Clean up:** Remove `ENVIO_SYNC_CHECK_LAG_THRESHOLD_BLOCKS=0` from `.env.dev` (defaults back to 500).

### Slack webhook setup

One-time setup. The resulting URL is reused across all environments and QA runs.

1. Open [api.slack.com/apps](https://api.slack.com/apps) (sign in to your company workspace).
2. **Create New App** → **From scratch** → name it (e.g. `Envio Indexer Alerts`) → pick your workspace → **Create App**.
3. In the left sidebar click **Incoming Webhooks** → toggle **Activate Incoming Webhooks** to **On**.
4. Click **Add New Webhook to Workspace** → select the channel (e.g. `#envio-indexer-alerts`) → **Allow**.
5. Copy the **Webhook URL** — it looks like `https://hooks.slack.com/services/T.../B.../xxxx`.
6. Paste it into `.env.dev` (and any other environment that needs alerts):

```bash
ENVIO_SYNC_CHECK_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxxx
```

That's it. The URL does not expire and works for all future requests.
