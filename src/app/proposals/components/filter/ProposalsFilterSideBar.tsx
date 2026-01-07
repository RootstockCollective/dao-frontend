import { type HTMLAttributes, useMemo } from 'react'
import { FilterItem, FilterType } from './types'
import { categoryFilterOptions, statusFilterOptions, timeFilterOptions, createFilter } from './filterOptions'
import { FilterSideBar } from '@/components/FilterSideBar'
import type { FilterGroup, ActiveFilter } from '@/components/FilterSideBar'

interface ProposalsFilterSideBarProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  activeFilters: FilterItem[]
  onApplyFilters: (filters: FilterItem[]) => void
  title?: string
}

/**
 * Proposals-specific filter sidebar that wraps the generic FilterSideBar component
 * Adapts proposal filter logic to work with the generic component interface
 */
export function ProposalsFilterSideBar({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters,
  ...props
}: ProposalsFilterSideBarProps) {
  // Configure filter groups for proposals
  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        id: FilterType.CATEGORY,
        title: 'FILTER BY CATEGORY',
        allLabel: 'All categories',
        allTestId: 'AllCategories',
        isMultiSelect: true,
        options: categoryFilterOptions,
      },
      {
        id: FilterType.STATUS,
        title: 'FILTER BY STATUS',
        allLabel: 'All statuses',
        allTestId: 'AllStatuses',
        isMultiSelect: true,
        options: statusFilterOptions,
      },
      {
        id: FilterType.TIME,
        title: 'FILTER BY TIME',
        allLabel: 'All proposals',
        allTestId: 'AllProposals',
        isMultiSelect: false,
        options: timeFilterOptions,
      },
    ],
    [],
  )

  // Convert FilterItem[] to ActiveFilter[]
  const adaptedActiveFilters: ActiveFilter[] = useMemo(
    () =>
      activeFilters
        .filter(f => !f.isAll)
        .map(f => ({
          groupId: f.type,
          option: { label: f.label, value: f.value },
        })),
    [activeFilters],
  )

  // Convert ActiveFilter[] back to FilterItem[] when applying
  const handleApply = (filters: ActiveFilter[]) => {
    const newFilters: FilterItem[] = filters.map(f => {
      const type = f.groupId as FilterType
      return createFilter(type, f.option, false, type === FilterType.TIME)
    })
    onApplyFilters(newFilters)
  }

  return (
    <FilterSideBar
      isOpen={isOpen}
      onClose={onClose}
      filterGroups={filterGroups}
      activeFilters={adaptedActiveFilters}
      onApply={handleApply}
      {...props}
    />
  )
}
