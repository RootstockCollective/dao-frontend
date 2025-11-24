'use client'

import { useMemo } from 'react'
import { FilterSideBar } from '@/components/FilterSideBar'
import { FilterGroup, ActiveFilter } from '@/components/FilterSideBar/types'
import { TokenImage } from '@/components/TokenImage'
import { TOKENS } from '@/lib/tokens'
import { useGetBackedBuilders } from '../hooks/useGetBackedBuilders'
import { useAccount } from 'wagmi'

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
export function TransactionHistoryFilterSideBar({
  isOpen,
  onClose,
  activeFilters,
  onFilterToggle,
  onClearGroup,
  onClearAll,
}: TransactionHistoryFilterSideBarProps) {
  const { address } = useAccount()
  const { builders } = useGetBackedBuilders(address)

  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        id: 'type',
        title: 'FILTER BY TYPE',
        allLabel: 'All types',
        allTestId: 'AllTypes',
        isMultiSelect: false,
        options: [
          { label: 'Claim', value: 'Claim' },
          { label: 'Back', value: 'Back' },
        ],
      },
      {
        id: 'claim-token',
        title: 'FILTER BY CLAIM TOKEN',
        allLabel: 'All claim tokens',
        allTestId: 'AllClaimTokens',
        isMultiSelect: true,
        options: [
          { label: 'RIF', value: TOKENS.rif.address, icon: <TokenImage symbol="RIF" size={16} /> },
          { label: 'USDRIF', value: TOKENS.usdrif.address, icon: <TokenImage symbol="USDRIF" size={16} /> },
          { label: 'rBTC', value: TOKENS.rbtc.address, icon: <TokenImage symbol="RBTC" size={16} /> },
        ],
      },
      {
        id: 'builder',
        title: 'FILTER BY BUILDER',
        allLabel: 'All builders',
        allTestId: 'AllBuilders',
        isMultiSelect: true,
        options: builders,
      },
    ],
    [builders],
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
    />
  )
}
