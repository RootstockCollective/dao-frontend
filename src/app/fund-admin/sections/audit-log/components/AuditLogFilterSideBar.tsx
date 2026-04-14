'use client'

import { useMemo } from 'react'

import { FilterSideBar } from '@/components/FilterSideBar'
import { ActiveFilter, FilterGroup } from '@/components/FilterSideBar/types'
import { TokenImage } from '@/components/TokenImage'
import { RBTC, WRBTC } from '@/lib/constants'

interface AuditLogFilterSideBarProps {
  isOpen: boolean
  onClose: () => void
  activeFilters: ActiveFilter[]
  onApply: (filters: ActiveFilter[]) => void
}

export function AuditLogFilterSideBar({
  isOpen,
  onClose,
  activeFilters,
  onApply,
}: AuditLogFilterSideBarProps) {
  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        id: 'type',
        title: 'FILTER BY TYPE',
        allLabel: 'All types',
        allTestId: 'AllTypes',
        isMultiSelect: true,
        options: [
          { label: 'Deposit', value: 'deposit' },
          { label: 'Withdraw', value: 'withdraw' },
          { label: 'Whitelisted', value: 'whitelisted' },
          { label: 'Dewhitelisted', value: 'dewhitelisted' },
          { label: 'Top up synthetic yield APY', value: 'top-up-synthetic-yield-apy' },
          { label: 'Transfer to manager wallet', value: 'transfer-to-manager-wallet' },
          { label: 'Top up manual buffer', value: 'top-up-manual-buffer' },
          { label: 'NAV update', value: 'nav-update' },
          { label: 'Vault deposit', value: 'vault-deposit' },
        ],
      },
      {
        id: 'show',
        title: 'SHOW',
        allLabel: 'All values',
        allTestId: 'AllValues',
        isMultiSelect: true,
        options: [
          { label: 'Reason', value: 'reason' },
          { label: RBTC, value: 'rbtc', icon: <TokenImage symbol={RBTC} size={16} /> },
          { label: WRBTC, value: 'wrbtc', icon: <TokenImage symbol={RBTC} size={16} /> },
        ],
      },
      {
        id: 'role',
        title: 'FILTER BY ROLE',
        allLabel: 'All roles',
        allTestId: 'AllRoles',
        isMultiSelect: true,
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Fund manager', value: 'fund-manager' },
          { label: 'Investor', value: 'investor' },
          { label: 'Whitelister', value: 'whitelister' },
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
      data-testid="AuditLogFilterSideBar"
    />
  )
}
