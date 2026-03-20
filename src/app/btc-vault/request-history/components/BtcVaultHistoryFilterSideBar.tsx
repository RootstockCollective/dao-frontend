'use client'

import { useMemo } from 'react'

import { FilterSideBar } from '@/components/FilterSideBar'
import type { ActiveFilter, FilterGroup } from '@/components/FilterSideBar/types'
import { TokenImage } from '@/components/TokenImage'
import { RBTC } from '@/lib/constants'

import type { DisplayStatus } from '../../services/ui/types'

/**
 * Filter-specific labels keyed by internal `DisplayStatus` (same keys as client-side status filter).
 * `claim_pending` uses withdraw-oriented copy; `successful` uses **Completed** so one chip covers finalized
 * deposits ("Successful" in rows) and claimed withdrawals ("Withdrawn" in rows).
 */
const FILTER_STATUS_LABELS: Record<DisplayStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  open_to_claim: 'Active',
  claim_pending: 'Ready to withdraw',
  successful: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

const STATUS_ORDER: DisplayStatus[] = [
  'pending',
  'approved',
  'open_to_claim',
  'claim_pending',
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
