'use client'

import { useMemo } from 'react'

import { FilterSideBar } from '@/components/FilterSideBar'
import type { ActiveFilter, FilterGroup } from '@/components/FilterSideBar/types'
import { TokenImage } from '@/components/TokenImage'

import type { DisplayStatus } from '../../services/ui/types'

const FILTER_STATUS_LABELS: Record<DisplayStatus, string> = {
  pending: 'Pending',
  claim_pending: 'Shares claim pending',
  open_to_claim: 'Active',
  successful: 'Successful',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

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
        allTestId: 'AllTypes',
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
        allTestId: 'AllTokens',
        isMultiSelect: false,
        options: [
          { label: 'rBTC', value: 'rbtc', icon: <TokenImage symbol="RBTC" size={16} /> },
          { label: 'Shares', value: 'shares' },
        ],
      },
      {
        id: 'status',
        title: 'FILTER BY STATUS',
        allLabel: 'All statuses',
        allTestId: 'AllStatuses',
        isMultiSelect: true,
        options: Object.entries(FILTER_STATUS_LABELS).map(([value, label]) => ({
          label,
          value,
        })),
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
      data-testid="BtcVaultHistoryFilterSideBar"
    />
  )
}
