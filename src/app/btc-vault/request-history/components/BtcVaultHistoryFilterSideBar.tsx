'use client'

import { useMemo } from 'react'

import { FilterSideBar } from '@/components/FilterSideBar'
import type { ActiveFilter, FilterGroup } from '@/components/FilterSideBar/types'

import { DISPLAY_REQUEST_TYPE_LABELS, DISPLAY_STATUS_LABELS } from '../../services/ui/types'

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
        title: 'TYPE',
        allLabel: 'All types',
        allTestId: 'AllTypes',
        isMultiSelect: false,
        options: Object.entries(DISPLAY_REQUEST_TYPE_LABELS).map(([value, label]) => ({
          label,
          value,
        })),
      },
      {
        id: 'claimToken',
        title: 'CLAIM TOKEN',
        allLabel: 'All tokens',
        allTestId: 'AllTokens',
        isMultiSelect: false,
        options: [
          { label: 'rBTC', value: 'rbtc' },
          { label: 'Shares', value: 'shares' },
        ],
      },
      {
        id: 'status',
        title: 'STATUS',
        allLabel: 'All statuses',
        allTestId: 'AllStatuses',
        isMultiSelect: true,
        options: Object.entries(DISPLAY_STATUS_LABELS).map(([value, label]) => ({
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
