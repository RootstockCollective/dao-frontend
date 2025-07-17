import { Column } from '@/shared/context'
import { HtmlHTMLAttributes } from 'react'

export const COLUMN_IDS = [
  'builder',
  'backer_rewards',
  'unclaimed',
  'estimated',
  'total',
  'backing',
  'actions',
] as const
export type ColumnId = (typeof COLUMN_IDS)[number]
export const isColumnId = (id: string): id is ColumnId => COLUMN_IDS.includes(id as ColumnId)

export const PAGE_SIZE = 3

export const LABELS = {
  backer_rewards: {
    label: 'Backer Rewards %',
  },
  unclaimed: {
    label: 'Unclaimed',
  },
  estimated: {
    label: 'Estimated',
    sublabel: 'this cycle',
  },
  backing: {
    label: 'Backing',
  },
  total: {
    label: 'Total',
  },
}

export const COLUMN_TRANSFORMS: Record<ColumnId, HtmlHTMLAttributes<HTMLTableCellElement>['className']> = {
  builder: 'flex-[1_1_12rem] min-w-[12rem]',
  backer_rewards: 'flex-[1_1_5rem] min-w-[5rem] justify-center',
  unclaimed: 'flex-[1_1_4rem] min-w-[4rem] justify-center',
  estimated: 'flex-[1_1_6rem] min-w-[6rem] justify-center',
  total: 'flex-[1_1_6rem] min-w-[6rem] justify-center',
  backing: 'flex-[1_1_6rem] min-w-[6rem] justify-center',
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
    id: 'unclaimed',
    hidden: false,
    sortable: true,
  },
  {
    id: 'estimated',
    hidden: false,
    sortable: true,
  },
  {
    id: 'total',
    hidden: true,
    sortable: true,
  },
  {
    id: 'backing',
    hidden: false,
    sortable: true,
  },
  {
    id: 'actions',
    hidden: true,
    sortable: false,
  },
]
