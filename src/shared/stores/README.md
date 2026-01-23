# Zustand Stores

This directory contains Zustand stores for client-side state management.

## When to Use Zustand vs React Query

| Use Case | Solution |
|----------|----------|
| UI state (modals, forms, wizards) | **Zustand** |
| Transaction flow state | **Zustand** |
| Server/blockchain data | **React Query / wagmi hooks** |
| Compound component state | **React Context** |

## Store Conventions

### 1. One Store Per Feature Domain

Each feature gets its own store file:

```
stores/
├── swap/
│   ├── useSwapStore.ts
│   ├── types.ts
│   └── index.ts
├── allocations/
│   └── useAllocationsStore.ts
└── index.ts
```

### 2. Naming

- Store hook: `use[Feature]Store`
- Store file: `use[Feature]Store.ts`
- Types file: `types.ts` in same directory

### 3. Store Structure

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface FeatureState {
  // State
  value: string
  isLoading: boolean
  
  // Actions
  setValue: (value: string) => void
  reset: () => void
}

const initialState = {
  value: '',
  isLoading: false,
}

export const useFeatureStore = create<FeatureState>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setValue: (value) => set({ value }, false, 'setValue'),
      
      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'FeatureStore' }
  )
)
```

### 4. Action Naming

Group related state changes into semantic actions instead of individual setters:

```typescript
// Good: Semantic actions
startTransaction: () => set({ isLoading: true, error: null })
completeTransaction: (hash) => set({ isLoading: false, txHash: hash })
failTransaction: (error) => set({ isLoading: false, error })

// Avoid: Individual setters for each field
setIsLoading: (v) => set({ isLoading: v })
setError: (e) => set({ error: e })
setTxHash: (h) => set({ txHash: h })
```

### 5. Reset Action

Every store must have a `reset()` action for cleanup:

```typescript
reset: () => set(initialState, false, 'reset')
```

### 6. Devtools

Enable devtools in development for debugging:

```typescript
import { devtools } from 'zustand/middleware'

create<State>()(
  devtools(
    (set) => ({ ... }),
    { name: 'StoreName' }
  )
)
```

### 7. Persistence (when needed)

For state that should persist across sessions:

```typescript
import { persist, createJSONStorage } from 'zustand/middleware'

create<State>()(
  devtools(
    persist(
      (set) => ({ ... }),
      {
        name: 'storage-key',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ 
          // Only persist specific fields
          persistedField: state.persistedField 
        }),
      }
    ),
    { name: 'StoreName' }
  )
)
```

### 8. Selectors

Use selectors for computed values and to prevent unnecessary re-renders:

```typescript
// In component
const isValid = useFeatureStore((state) => state.value.length > 0)

// Or create reusable selectors
export const selectIsValid = (state: FeatureState) => state.value.length > 0
const isValid = useFeatureStore(selectIsValid)
```

### 9. Testing

Stores can be tested by accessing state directly:

```typescript
import { useFeatureStore } from './useFeatureStore'

beforeEach(() => {
  useFeatureStore.getState().reset()
})

test('setValue updates value', () => {
  useFeatureStore.getState().setValue('test')
  expect(useFeatureStore.getState().value).toBe('test')
})
```

## Do NOT Use Zustand For

1. **Server state** - Use React Query / wagmi hooks instead
2. **Compound components** - Use React Context (e.g., Table, Expandable)
3. **Third-party library state** - Keep their providers as-is
