import '@tanstack/react-table'

/* 
`@tanstack/react-table` TypeScript module augmentation: extending ColumnMeta interface by adding an optional `renderAbove` boolean flag—so we can mark specific columns for special “stacked” rendering above the main row.
e.g:
  accessor('name', {
    meta: {
      renderAbove: true,
    },
  }),
*/

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    renderAbove?: boolean
  }
}
