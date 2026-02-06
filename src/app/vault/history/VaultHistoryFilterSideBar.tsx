'use client'

import { useMemo } from 'react'
import { FilterSideBar } from '@/components/FilterSideBar'
import { FilterGroup, ActiveFilter } from '@/components/FilterSideBar/types'

interface VaultHistoryFilterSideBarProps {
  isOpen: boolean
  onClose: () => void
  activeFilters: ActiveFilter[]
  onApply: (filters: ActiveFilter[]) => void
}

/**
 * Filter sidebar specifically for vault history
 * Provides filters for type (deposit/withdraw)
 */
export function VaultHistoryFilterSideBar({
  isOpen,
  onClose,
  activeFilters,
  onApply,
}: VaultHistoryFilterSideBarProps) {
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
          { label: 'Withdraw', value: 'withdraw' },
        ],
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
      data-testid="VaultHistoryFilterSideBar"
    />
  )
}
