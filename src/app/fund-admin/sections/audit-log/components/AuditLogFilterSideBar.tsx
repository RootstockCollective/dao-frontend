'use client'

import { useMemo } from 'react'

import { FilterSideBar } from '@/components/FilterSideBar'
import { ActiveFilter, FilterGroup } from '@/components/FilterSideBar/types'
import { TokenImage } from '@/components/TokenImage'
import { RBTC } from '@/lib/constants'

import { AUDIT_LOG_ROLE_FILTERS, AUDIT_LOG_SHOW_FILTERS, AUDIT_LOG_TYPE_FILTERS } from '../constants'

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
        options: AUDIT_LOG_TYPE_FILTERS.map(option => ({ label: option.label, value: option.value })),
      },
      {
        id: 'show',
        title: 'SHOW',
        allLabel: 'All values',
        allTestId: 'AllValues',
        isMultiSelect: true,
        options: AUDIT_LOG_SHOW_FILTERS.map(option => ({
          label: option.label,
          value: option.value,
          ...(option.value === 'reason' ? {} : { icon: <TokenImage symbol={RBTC} size={16} /> }),
        })),
      },
      {
        id: 'role',
        title: 'FILTER BY ROLE',
        allLabel: 'All roles',
        allTestId: 'AllRoles',
        isMultiSelect: true,
        options: AUDIT_LOG_ROLE_FILTERS.map(option => ({ label: option.label, value: option.value })),
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
