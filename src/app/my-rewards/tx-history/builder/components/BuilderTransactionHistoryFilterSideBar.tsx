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

// Claim filter option - exported for use in default filters
export const CLAIM_FILTER_OPTION = { label: 'Claim', value: 'Claim' }

/**
 * Filter sidebar for builder transaction history
 * Includes type filter (Claim only, always checked) and reward token filter
 */
export function BuilderTransactionHistoryFilterSideBar({ isOpen, onClose, activeFilters, onApply }: Props) {
  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        id: 'type',
        title: 'FILTER BY TYPE',
        allLabel: 'All types',
        allTestId: 'AllTypes',
        isMultiSelect: false,
        options: [CLAIM_FILTER_OPTION],
      },
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
