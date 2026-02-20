# Local Development Setup Guide

This guide covers the complete local development environment setup for the DAO Frontend, including the Envio indexer for proposals data.

## Overview

The frontend uses several data sources that may require local setup:

| Service                               | Purpose                         | Required for               |
| ------------------------------------- | ------------------------------- | -------------------------- |
| [Envio Indexer](#envio-indexer-setup) | Proposals data (primary source) | Viewing/creating proposals |
| [Anvil Fork](./FORK_SETUP.md)         | Local mainnet fork              | Testing swap functionality |

## Envio Indexer Setup

The frontend uses Envio as the **primary data source for proposals**. For local development, you need to run the Envio indexer locally.

### Prerequisites

- Docker and Docker Compose installed
- Access to the [dao-envio-indexer](https://github.com/RootstockCollective/dao-envio-indexer) repository

### Quick Start

1. **Clone the Envio indexer repository**:

   ```bash
   git clone https://github.com/RootstockCollective/dao-envio-indexer.git
   cd dao-envio-indexer
   ```

2. **Start the indexer**:

   ```bash
   # Follow the instructions in the dao-envio-indexer README
   # Typically involves running:
   pnpm install
   pnpm dev
   ```

3. **Verify the indexer is running**:

   The GraphQL endpoint should be available at:

   ```
   http://localhost:8080/v1/graphql
   ```

   You can test it with:

   ```bash
   curl -X POST http://localhost:8080/v1/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "{ Proposal(limit: 1) { proposalId } }"}'
   ```

### Environment Configuration

The `ENVIO_GRAPHQL_URL` environment variable is already configured in the local development environment file:

- `.env.fork`: `ENVIO_GRAPHQL_URL=http://localhost:8080/v1/graphql`

### Fallback Behavior

If Envio is unavailable, the frontend automatically falls back to other data sources in this order:

1. **Envio** (primary) - Local indexer at `localhost:8080`
2. **State Sync DB** - Backend database
3. **The Graph** - Decentralized indexer
4. **Blockscout** - Block explorer API

This means you can still run the frontend without Envio, but proposals data will come from slower/less reliable sources.

### Troubleshooting

**"Envio: ENVIO_GRAPHQL_URL environment variable not configured"**

- Ensure you're using the correct environment profile: `PROFILE=dev npm run dev`

**"Envio: HTTP 4xx/5xx error"**

- Verify the indexer is running: `curl http://localhost:8080/v1/graphql`
- Check indexer logs for errors

**"Envio: Insufficient proposals"**

- The indexer may still be syncing. Wait for it to index more blocks.
- Check indexer sync status in its logs

## Fork Environment

For testing swap functionality on a local Rootstock Mainnet fork, see the [Fork Setup Guide](./FORK_SETUP.md).

## Complete Local Setup

For a complete local development environment with all services:

```bash
# Terminal 1: Start Envio indexer
cd dao-envio-indexer
pnpm dev


# Terminal 2: Start Anvil fork
cd dao-frontend
npm run fork:anvil

# Terminal 3: Start frontend
PROFILE=fork npm run dev
```

## Quick Reference

### Service Endpoints (Local)

| Service       | URL                              |
| ------------- | -------------------------------- |
| Frontend      | http://localhost:3000            |
| Envio GraphQL | http://localhost:8080/v1/graphql |
| Anvil RPC     | http://127.0.0.1:8545            |

### Useful Commands

```bash
# Start frontend with fork profile
PROFILE=fork npm run dev

# Test Envio endpoint
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ Proposal(limit: 5) { proposalId description } }"}'

# Check if Anvil is running
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```
