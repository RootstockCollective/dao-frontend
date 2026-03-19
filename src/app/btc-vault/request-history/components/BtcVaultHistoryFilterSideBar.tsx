'use client'

import { useMemo } from 'react'

import { FilterSideBar } from '@/components/FilterSideBar'
import type { ActiveFilter, FilterGroup } from '@/components/FilterSideBar/types'
import { TokenImage } from '@/components/TokenImage'
import { RBTC } from '@/lib/constants'

import type { DisplayStatus } from '../../services/ui/types'

/**
 * Filter-specific status labels per AC3 spec.
 * Differs from DISPLAY_STATUS_LABELS used for table badges.
 */
const FILTER_STATUS_LABELS: Record<DisplayStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  ready_to_claim: 'Ready to claim',
  ready_to_withdraw: 'Ready to withdraw',
  successful: 'Successful',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

/**
 * Order of statuses in the filter dropdown per AC3:
 * For deposits: Pending → Ready to claim → Successful → Cancelled
 * For withdrawals: Pending → Approved → Ready to withdraw → Successful → Cancelled
 * Merged list prioritizes the deposit flow, then adds withdrawal-specific states.
 */
const STATUS_ORDER: DisplayStatus[] = [
  'pending',
  'approved',
  'ready_to_claim',
  'ready_to_withdraw',
  'successful',
  'cancelled',
  'rejected',
]

interface Props {
  isOpen: boolean
  onClose: () => void
  activeFilters: ActiveFilter[]
  onApply: (filters: ActiveFilter[]) => void
}

/**
 * Filter sidebar for BTC Vault transaction history.
 * Provides three filter groups: Type, Claim Token, and Status per AC3 requirements.
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
        // Per AC3: Shares first, then RBTC with icon
        options: [
          { label: 'Shares', value: 'shares' },
          { label: 'rBTC', value: 'rbtc', icon: <TokenImage symbol={RBTC} size={16} /> },
        ],
      },
      {
        id: 'status',
        title: 'FILTER BY STATUS',
        allLabel: 'All statuses',
        allTestId: 'all-statuses',
        isMultiSelect: true,
        options: STATUS_ORDER.map(value => ({ label: FILTER_STATUS_LABELS[value], value })),
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
