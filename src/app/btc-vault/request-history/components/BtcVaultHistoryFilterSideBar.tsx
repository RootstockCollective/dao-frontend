'use client'

import { useMemo } from 'react'

import { FilterSideBar } from '@/components/FilterSideBar'
import type { ActiveFilter, FilterGroup } from '@/components/FilterSideBar/types'
import { TokenImage } from '@/components/TokenImage'
import { RBTC } from '@/lib/constants'

import type { HistoryRowStatusLabel } from '../../services/ui/types'

/**
 * Filter options for the status filter, using display labels that match the row badges exactly.
 * Both `label` and `value` use the same `HistoryRowStatusLabel` string so the client-side
 * filter in `useRequestHistory` can match against `row.displayStatusLabel` directly.
 */
const FILTER_STATUS_OPTIONS: HistoryRowStatusLabel[] = [
  'Pending',
  'Approved',
  'Ready to claim',
  'Ready to withdraw',
  'Successful',
  'Withdrawn',
  'Cancelled',
]

interface Props {
  isOpen: boolean
  onClose: () => void
  activeFilters: ActiveFilter[]
  onApply: (filters: ActiveFilter[]) => void
}

/**
 * Filter sidebar for BTC Vault transaction history.
 * Provides three filter groups: Type, Claim Token, and Status.
 */
export function BtcVaultHistoryFilterSideBar({ isOpen, onClose, activeFilters, onApply }: Props) {
  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        id: 'type',
        title: 'FILTER BY TYPE',
        allLabel: 'All types',
        allTestId: 'all-types',
        isMultiSelect: false,
        options: [
          { label: 'Deposit', value: 'deposit' },
          { label: 'Withdraw', value: 'withdrawal' },
        ],
      },
      {
        id: 'claimToken',
        title: 'FILTER BY CLAIM TOKEN',
        allLabel: 'All claim tokens',
        allTestId: 'all-tokens',
        isMultiSelect: false,
        options: [
          { label: 'rBTC', value: 'rbtc', icon: <TokenImage symbol={RBTC} size={16} /> },
          { label: 'Shares', value: 'shares' },
        ],
      },
      {
        id: 'status',
        title: 'FILTER BY STATUS',
        allLabel: 'All statuses',
        allTestId: 'all-statuses',
        isMultiSelect: true,
        options: FILTER_STATUS_OPTIONS.map(label => ({ label, value: label })),
      },
    ],
    [],
  )

  return (
    <FilterSideBar
      isOpen={isOpen}
      onClose={onClose}
      filterGroups={filterGroups}
      activeFilters={activeFilters}
      onApply={onApply}
      data-testid="btc-vault-history-filter-sidebar"
    />
  )
}
