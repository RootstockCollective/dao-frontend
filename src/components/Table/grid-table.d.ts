// Please don't ask me why the file is not in camel case. It turns out, TS accepts only kebab in d.ts
import '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    width?: string
  }
}
