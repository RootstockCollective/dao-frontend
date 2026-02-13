'use client'

import { useMemo } from 'react'
import { FilterSideBar } from '@/components/FilterSideBar'
import { FilterGroup, ActiveFilter } from '@/components/FilterSideBar/types'
import { TokenImage } from '@/components/TokenImage'
import { TOKENS } from '@/lib/tokens'

interface Props {
  isOpen: boolean
  onClose: () => void
  activeFilters: ActiveFilter[]
  onApply: (filters: ActiveFilter[]) => void
}

/**
 * Filter sidebar for builder transaction history
 * Provides filter for reward token
 */
export function BuilderTransactionHistoryFilterSideBar({ isOpen, onClose, activeFilters, onApply }: Props) {
  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        id: 'claim-token',
        title: 'FILTER BY REWARD TOKEN',
        allLabel: 'All reward tokens',
        allTestId: 'AllRewardTokens',
        isMultiSelect: true,
        options: [
          { label: 'RIF', value: TOKENS.rif.address, icon: <TokenImage symbol="RIF" size={16} /> },
          { label: 'USDRIF', value: TOKENS.usdrif.address, icon: <TokenImage symbol="USDRIF" size={16} /> },
          { label: 'rBTC', value: TOKENS.rbtc.address, icon: <TokenImage symbol="RBTC" size={16} /> },
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
    />
  )
}
