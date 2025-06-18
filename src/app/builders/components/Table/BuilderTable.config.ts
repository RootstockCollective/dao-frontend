import { Column } from '@/shared/context'
import { HtmlHTMLAttributes } from 'react'

export const COLUMN_IDS = [
  'builder',
  'backing',
  'backer_rewards',
  'rewards_past_cycle',
  'rewards_upcoming',
  'backing_share',
  'actions',
] as const
export type ColumnId = (typeof COLUMN_IDS)[number]
export const isColumnId = (id: string): id is ColumnId => COLUMN_IDS.includes(id as ColumnId)

export const PAGE_SIZE = 3

/**
 * Column widths using flexbox properties for dynamic and aligned columns.
 *
 * Approach:
 * - Use flex-grow, flex-shrink, and flex-basis for responsive behavior
 * - Smaller min-width values to ensure all columns fit
 * - Flexible flex-basis values that adapt to container width
 * - Builder column gets priority space with higher grow factor
 * - Numeric columns have consistent, compact widths
 */
export const COLUMN_WIDTHS: Record<ColumnId, HtmlHTMLAttributes<HTMLTableCellElement>['className']> = {
  builder: 'flex-[3_1_200px] min-w-[200px]', // Priority column, 3x grow factor, more flexible
  backing: 'flex-[1_1_100px] min-w-[100px]', // Compact width for backing values
  backer_rewards: 'flex-[1_1_80px] min-w-[80px]', // Compact width for percentages
  rewards_past_cycle: 'flex-[1_1_110px] min-w-[110px]', // Compact width for reward values
  rewards_upcoming: 'flex-[1_1_110px] min-w-[110px]', // Compact width for reward values
  backing_share: 'flex-[1_1_100px] min-w-[100px]', // Compact width for allocation percentages
  actions: 'flex-[1_1_100px] min-w-[100px]', // Actions column, compact width
}

export const DEFAULT_HEADERS: Column<ColumnId>[] = [
  {
    id: 'builder',
    hidden: false,
    sortable: true,
  },
  {
    id: 'backer_rewards',
    hidden: false,
    sortable: true,
  },
  {
    id: 'rewards_past_cycle',
    hidden: false,
    sortable: true,
  },
  {
    id: 'rewards_upcoming',
    hidden: false,
    sortable: true,
  },
  {
    id: 'backing',
    hidden: true,
    sortable: true,
  },
  {
    id: 'backing_share',
    hidden: false,
    sortable: true,
  },
  {
    id: 'actions',
    hidden: true,
    sortable: false,
  },
]
