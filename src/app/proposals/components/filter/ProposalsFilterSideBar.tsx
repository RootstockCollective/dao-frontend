import { type HTMLAttributes, useMemo } from 'react'
import { FilterItem, FilterType } from './types'
import {
  FilterOption,
  categoryFilterOptions,
  statusFilterOptions,
  timeFilterOptions,
  createFilter,
} from './filterOptions'
import { FilterSideBar } from '@/components/FilterSideBar'
import type { FilterGroup, ActiveFilter } from '@/components/FilterSideBar'

interface ProposalsFilterSideBarProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  activeFilters: FilterItem[]
  onAddFilter: (filter: FilterItem) => void
  onRemoveFilter: (id: string) => void
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
  onAddFilter,
  onRemoveFilter,
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

  const handleFilterToggle = (groupId: string, option: FilterOption) => {
    const type = groupId as FilterType
    const existingFilter = activeFilters.find(f => f.type === type && f.value === option.value)

    if (existingFilter) {
      onRemoveFilter(existingFilter.id)
    } else {
      // Create appropriate filter based on type
      // Time filters are exclusive, others are not
      const filter = createFilter(type, option, false, type === FilterType.TIME)
      onAddFilter(filter)
    }
  }

  const handleClearGroup = (groupId: string) => {
    const type = groupId as FilterType
    activeFilters.filter(f => f.type === type).forEach(f => onRemoveFilter(f.id))
  }

  const handleClearAll = () => {
    // Remove all non-"all" filters
    activeFilters.filter(f => !f.isAll).forEach(f => onRemoveFilter(f.id))
  }

  return (
    <FilterSideBar
      isOpen={isOpen}
      onClose={onClose}
      filterGroups={filterGroups}
      activeFilters={adaptedActiveFilters}
      onFilterToggle={handleFilterToggle}
      onClearGroup={handleClearGroup}
      onClearAll={handleClearAll}
      {...props}
    />
  )
}
