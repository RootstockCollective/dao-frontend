# NAV History & Ongoing Tabs — Developer Orientation

## Folders to Create

Inside `src/app/fund-manager/sections/`:

```
sections/
├── nav-history/
│   ├── NavHistorySection.tsx   ← section component
│   ├── components/             ← UI components
│   └── hooks/                  ← data-fetching hooks
└── ongoing/
    ├── OngoingSection.tsx      ← section component
    ├── components/             ← UI components
    └── hooks/                  ← data-fetching hooks
```

## Naming Conventions

- **Section file**: `{Name}Section.tsx` (e.g., `NavHistorySection.tsx`)
- **Components folder**: `components/` — presentational, UI-only
- **Hooks folder**: `hooks/` — data-fetching and business logic

## Reference Patterns

### `transactions/` — simple structure
```
transactions/
├── components/
│   ├── DepositWindowRequestsTable.tsx
│   └── DesktopDepositWindowRequests.tsx
├── hooks/
│   └── useGetBtcVaultEntitiesHistory.ts
├── config.ts
├── utils.ts
```

### `metrics/` — rich structure with flows
```
metrics/
├── RbtcVaultMetricsSection.tsx
├── components/
│   ├── RbtcVaultMetricsRow.tsx
│   └── RbtcVaultMetricCard.tsx
├── hooks/
│   ├── useRbtcVaultMetrics.ts
│   ├── useRbtcVault.ts
│   └── ...
└── flows/         ← complex multi-step flows
    ├── deposit/
    ├── transfer/
    ├── nav/
    └── buffer/
```

## Barrel Exports (index.ts)

Create `index.ts` files in each subfolder to enable clean, single-path imports:

```
nav-history/
├── NavHistorySection.tsx
├── components/
│   └── index.ts          ← exports all components
└── hooks/
    └── index.ts          ← exports all hooks
```

**Example `components/index.ts`:**
```ts
export { NavHistoryTable } from './NavHistoryTable'
export { NavHistoryRow } from './NavHistoryRow'
```

**Example `hooks/index.ts`:**
```ts
export { useNavHistory } from './useNavHistory'
export { useNavHistoryFilters } from './useNavHistoryFilters'
```

This pattern keeps imports concise in `TabsSection.tsx`:
```ts
import { NavHistorySection } from './nav-history'
import { OngoingSection } from './ongoing'
```

## Steps to Implement

1. Create `nav-history/` and `ongoing/` folders with `components/`, `hooks/`, and section files
2. Add exports to `sections/index.ts`
3. Import sections in `TabsSection.tsx` and replace placeholders:
   - `activeTab === 'NAV History'` → `<NavHistorySection />`
   - `activeTab === 'Ongoing'` → `<OngoingSection />`
4. Follow existing conventions: `interface` for objects, `type` for unions, `'use client'` only where needed
5. **Done?** Delete this file — the implemented code is now the reference
