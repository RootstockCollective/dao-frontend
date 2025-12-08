'use client'

import { useMemo } from 'react'
import { FilterSideBar } from '@/components/FilterSideBar'
import { FilterGroup, ActiveFilter } from '@/components/FilterSideBar/types'

interface TransactionHistoryFilterSideBarProps {
  isOpen: boolean
  onClose: () => void
  activeFilters: ActiveFilter[]
  onFilterToggle: (groupId: string, option: { label: string; value: string }) => void
  onClearGroup: (groupId: string) => void
  onClearAll: () => void
}

/**
 * Filter sidebar specifically for transaction history
 * Provides filters for type, claim token, and builder
 */
export function StakingHistoryFilterSideBar({
  isOpen,
  onClose,
  activeFilters,
  onFilterToggle,
  onClearGroup,
  onClearAll,
}: TransactionHistoryFilterSideBarProps) {
  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        id: 'type',
        title: 'FILTER BY TYPE',
        allLabel: 'All types',
        allTestId: 'AllTypes',
        isMultiSelect: false,
        options: [
          { label: 'Stake', value: 'stake' },
          { label: 'Unstake', value: 'unstake' },
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
      onFilterToggle={onFilterToggle}
      onClearGroup={onClearGroup}
      onClearAll={onClearAll}
      data-testid="StakingHistoryFilterSideBar"
    />
  )
}
