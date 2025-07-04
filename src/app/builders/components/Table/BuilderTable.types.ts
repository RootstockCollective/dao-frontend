export const COLUMN_IDS = [
  'builder',
  'backing',
  'backer_rewards',
  'rewards_past_cycle',
  'rewards_upcoming',
  'allocations',
  'actions',
] as const
export type ColumnId = (typeof COLUMN_IDS)[number]
export const isColumnId = (id: string): id is ColumnId => COLUMN_IDS.includes(id as ColumnId)
