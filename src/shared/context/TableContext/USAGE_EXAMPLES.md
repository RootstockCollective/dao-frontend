# Typed Table System Usage Examples

This document demonstrates how to use the simplified typed table system with direct hook usage and proper type safety.

## Basic Setup

### 1. Define Your Column IDs and Cell Data Types

```typescript
// Define your column IDs as a union type
type MyColumnId = 'name' | 'age' | 'email' | 'status' | 'actions'

// Define the cell data structure for each column
type MyCellDataMap = {
  name: { 
    value: string
    sortKey: string
    displayName: string
  }
  age: { 
    value: number
    formatted: string
    category: 'young' | 'adult' | 'senior'
  }
  email: { 
    value: string
    isValid: boolean
    domain: string
  }
  status: {
    value: 'active' | 'inactive' | 'pending'
    color: string
    label: string
  }
  actions: { 
    buttons: Array<{
      label: string
      onClick: () => void
      disabled?: boolean
    }>
  }
}
```

### 2. Create Your Typed Table Configuration

```typescript
import { TypedTable } from '@/shared/context'

// Create a typed table interface
export type MyTable = TypedTable<MyColumnId, MyCellDataMap>

// Now you have access to strongly typed:
// - MyTable['State'] for TableState
// - MyTable['Action'] for TableAction  
// - MyTable['Row'] for Row
// - MyTable['RowData'] for RowData
// - MyTable['Column'] for Column
```

### 3. Use Hooks and Providers Directly

```typescript
import { useTableContext, useTableActionsContext, withTableContext } from '@/shared/context'

// Use hooks directly with type parameters in your components
const MyTableComponent = () => {
  const { rows, columns, selectedRows } = useTableContext<MyColumnId, MyCellDataMap>()
  const dispatch = useTableActionsContext<MyColumnId, MyCellDataMap>()
  
  // ... rest of component
}

// Wrap your component with the table context provider
export default withTableContext<MyColumnId, MyCellDataMap>(MyTableComponent)
```

### 4. Create Row Data with Type Safety

```typescript
import { RowData } from '@/shared/context'

const createUserRow = (user: User): MyTable['Row'] => ({
  id: user.id,
  data: {
    name: { 
      value: user.name,
      sortKey: user.name.toLowerCase(),
      displayName: user.displayName || user.name
    },
    age: { 
      value: user.age,
      formatted: `${user.age} years old`,
      category: user.age < 18 ? 'young' : user.age < 65 ? 'adult' : 'senior'
    },
    email: { 
      value: user.email,
      isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email),
      domain: user.email.split('@')[1]
    },
    status: {
      value: user.status,
      color: user.status === 'active' ? 'green' : 'red',
      label: user.status.toUpperCase()
    },
    actions: { 
      buttons: [
        { label: 'Edit', onClick: () => editUser(user.id) },
        { label: 'Delete', onClick: () => deleteUser(user.id), disabled: user.status === 'active' }
      ]
    }
  } as RowData<MyColumnId, MyCellDataMap>
})
```

### 5. Wrap Your Table Component

```typescript
// Export your table component with typed context
export default withTableContext<MyColumnId, MyCellDataMap>(MyTableComponent)

// Or use it directly in your component tree:
const MyApp = () => (
  <div>
    <MyTableComponent />
  </div>
)

export default withTableContext<MyColumnId, MyCellDataMap>(MyApp)
```

## Benefits of the Typed Table System

### Type Safety

- **Column ID Validation**: Only valid column IDs are accepted
- **Cell Data Type Safety**: Each column's data structure is enforced
- **Action Type Safety**: Table actions are strongly typed based on your configuration

### Developer Experience

- **IntelliSense Support**: Full autocomplete for column IDs and cell data
- **Compile-time Error Checking**: Catch type mismatches before runtime
- **Refactoring Safety**: Renaming columns or changing data structures is safe

### Example Usage in Components

```typescript
// In your table component
const MyTableComponent = () => {
  const { rows, columns, selectedRows } = useTableContext<MyColumnId, MyCellDataMap>()
  const dispatch = useTableActionsContext<MyColumnId, MyCellDataMap>()

  // All of these are fully typed!
  const handleSort = (columnId: MyColumnId) => {
    dispatch({
      type: 'SORT_BY_COLUMN',
      payload: { columnId, direction: 'asc' }
    })
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.id} onClick={() => handleSort(column.id)}>
              {/* TypeScript knows the exact column IDs available */}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id}>
            {/* TypeScript knows the exact structure of row.data */}
            <td>{row.data.name.displayName}</td>
            <td>{row.data.age.formatted}</td>
            <td>{row.data.email.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## Quick Reference

### Essential Imports

```typescript
import { 
  useTableContext, 
  useTableActionsContext, 
  withTableContext,
  TypedTable,
  RowData 
} from '@/shared/context'
```

### Basic Pattern

```typescript
// 1. Define types
type ColumnId = 'name' | 'email' | 'actions'
type CellDataMap = { /* ... */ }
type MyTable = TypedTable<ColumnId, CellDataMap>

// 2. Use in component
const MyComponent = () => {
  const state = useTableContext<ColumnId, CellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, CellDataMap>()
  // ... component logic
}

// 3. Wrap with provider
export default withTableContext<ColumnId, CellDataMap>(MyComponent)
```
