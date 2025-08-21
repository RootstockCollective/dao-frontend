export type CastType = 'NUMERIC'

export interface SortConfig {
  allowedColumns: string[]
  castedSortFieldsMap: Record<string, CastType>
}
