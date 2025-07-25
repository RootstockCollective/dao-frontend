import { BaseColumnId, Column } from '@/shared/context'
import { HtmlHTMLAttributes } from 'react'
import { TableColumnDropdownLabels } from './TableColumnDropdown/TableColumnDropdown'
import { builderInactiveStates } from '@/app/collective-rewards/utils'

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

export const PAGE_SIZE = 20

export const LABELS: TableColumnDropdownLabels<Exclude<ColumnId, 'builder' | 'actions'>> = {
  backer_rewards: {
    label: 'Backer Rewards %',
  },
  rewards_past_cycle: {
    label: 'Rewards',
    sublabel: 'past cycle',
  },
  rewards_upcoming: {
    label: 'Rewards',
    sublabel: 'upcoming cycle',
  },
  backing: {
    label: 'Backing',
  },
  allocations: {
    label: 'Backing share',
  },
}

export type ColumnTransforms<CID extends BaseColumnId = BaseColumnId> = Record<
  CID,
  HtmlHTMLAttributes<HTMLTableCellElement>['className']
> // TODO: @refactor move to app/components/Table/types.ts (and rename to ColumnTransforms)

export const COLUMN_TRANSFORMS: ColumnTransforms<ColumnId> = {
  builder: 'flex-[1_1_12rem] min-w-[12rem]',
  backing: 'flex-[1_1_6rem] min-w-[6rem] justify-center',
  backer_rewards: 'flex-[1_1_5rem] min-w-[5rem] justify-center',
  rewards_past_cycle: 'flex-[1_1_4rem] min-w-[4rem] justify-center',
  rewards_upcoming: 'flex-[1_1_6rem] min-w-[6rem] justify-center',
  allocations: 'flex-[1_1_6rem] min-w-[6rem] justify-center',
  actions: 'flex-[1_1_6rem] min-w-[6rem] justify-center',
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
    id: 'allocations',
    hidden: false,
    sortable: true,
  },
  {
    id: 'actions',
    hidden: true,
    sortable: false,
  },
]

export const builderStates = ['inProgress', 'active', ...builderInactiveStates] as const
export type BuilderState = (typeof builderStates)[number]
