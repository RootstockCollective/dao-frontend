# BTC Vault Hooks — Switchable Mock/Contract Pattern

## Why this structure?

Each hook lives in its own folder with three files:

```
useVaultMetrics/
  index.ts                      ← switcher (re-exports mock or contract)
  useVaultMetrics.mock.ts       ← uses MockBtcVaultAdapter + React Query
  useVaultMetrics.contract.ts   ← will use useReadContract from wagmi
```

**The problem we solved:** The mock adapter is a class, but the contract implementation needs React hooks (`useReadContract`, `useWriteContract`) — which can't be called inside class methods. Instead of forcing one pattern, each hook has two implementations and a build-time switcher picks the right one.

**Why not conditional hooks?** React's rules of hooks forbid calling hooks conditionally. The switcher avoids this because the env var is replaced at build time — only one implementation is ever bundled.

## How switching works

The `index.ts` in each hook folder does:

```ts
import { useVaultMetricsMock } from './useVaultMetrics.mock'
import { useVaultMetricsContract } from './useVaultMetrics.contract'

export const useVaultMetrics =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract'
    ? useVaultMetricsContract
    : useVaultMetricsMock
```

`NEXT_PUBLIC_*` vars are inlined at build time by Next.js. The bundler sees a literal string comparison, tree-shakes the unused branch, and only the active implementation ends up in the bundle.

## How to switch

Set the env var in your `.env` (or `.env.local`) file:

```bash
# Use mock data (default)
NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE=mock

# Use real contracts
NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE=contract
```

Then rebuild (`npm run build` or restart `npm run dev`). No code changes needed.

## Current state

- **Mock implementations** (`*.mock.ts`): fully functional, use `MockBtcVaultAdapter` via context + React Query
- **Contract implementations** (`*.contract.ts`): stubs that throw "not implemented" errors with `enabled: false` queries — ready to be filled in when contracts are deployed

## Shared layer

Both mock and contract versions reuse the same mappers and formatters:

- `services/ui/mappers.ts` — converts raw data → display types
- `services/ui/formatters.ts` — pure formatting functions (Wei → RBTC, timestamps, etc.)
- `services/ui/types.ts` — display type definitions

This means switching adapters doesn't duplicate any formatting or mapping logic.
