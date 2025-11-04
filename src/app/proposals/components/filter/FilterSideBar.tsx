import { Header } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'
import { FilterItem, FilterType } from './types'
import {
  FilterOption,
  categoryFilterOptions,
  statusFilterOptions,
  timeFilterOptions,
  createFilter,
} from './filterOptions'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { TrashIcon } from '@/components/Icons'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { SelectableItem } from '@/components/SelectableItem'

interface FilterSideBarProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  activeFilters: FilterItem[]
  onAddFilter: (filter: FilterItem) => void
  onRemoveFilter: (id: string) => void
  title?: string
}

/**
 * Enhanced sidebar panel containing filters for categories, status, and time
 * Shows as modal on mobile, sidebar on desktop
 * Hybrid approach combining type safety with responsive design
 */
export function FilterSideBar({
  isOpen,
  onClose,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  className,
  ...props
}: FilterSideBarProps) {
  const isDesktop = useIsDesktop()

  const handleFilterToggle = (option: FilterOption, type: FilterType) => {
    const existingFilter = activeFilters.find(f => f.type === type && f.value === option.value)

    if (existingFilter) {
      onRemoveFilter(existingFilter.id)
    } else {
      // Create appropriate filter based on type using unified function
      // Time filters are exclusive, others are not
      const filter = createFilter(type, option, false, type === FilterType.TIME)
      onAddFilter(filter)
    }
  }

  const handleClearAll = () => {
    // Remove all non-"all" filters
    activeFilters.filter(f => !f.isAll).forEach(f => onRemoveFilter(f.id))
  }

  const hasActiveFilters = activeFilters.some(f => !f.isAll)

  // Helper to check if a filter is selected
  const isFilterSelected = (option: FilterOption, type: FilterType) => {
    return activeFilters.some(f => f.type === type && f.value === option.value)
  }

  // Helper to check if "all" filter is selected for a type
  const isAllSelected = (type: FilterType) => {
    return activeFilters.some(f => f.type === type && f.isAll)
  }

  // Reusable filter section component
  const FilterSection = ({
    title,
    options,
    type,
    allLabel,
    allTestId,
  }: {
    title: string
    options: FilterOption[]
    type: FilterType
    allLabel: string
    allTestId: string
  }) => (
    <div>
      <Header variant="h5" className="mb-4 text-text-40 uppercase">
        {title}
      </Header>
      <ul className="pl-1 space-y-3" role="group">
        <li>
          <SelectableItem
            selected={isAllSelected(type)}
            option={{ label: allLabel, value: '' }}
            onClick={() => {
              // Remove all filters of this type to show "all"
              activeFilters.filter(f => f.type === type).forEach(f => onRemoveFilter(f.id))
            }}
            data-testid={allTestId}
            variant={type === FilterType.TIME ? 'round' : 'square'}
          />
        </li>
        {options.map((option, i) => (
          <li key={i}>
            <SelectableItem
              selected={isFilterSelected(option, type)}
              option={option}
              onClick={() => handleFilterToggle(option, type)}
              data-testid={`${type}Filter-${option.label}`}
              variant={type === FilterType.TIME ? 'round' : 'square'}
            />
          </li>
        ))}
      </ul>
    </div>
  )

  const sidebarContent = (
    <div className="h-full flex flex-col" onClick={e => e.stopPropagation()}>
      <div className="flex-1 space-y-8 overflow-y-auto pb-8">
        <FilterSection
          title="FILTER BY CATEGORY"
          options={categoryFilterOptions}
          type={FilterType.CATEGORY}
          allLabel="All categories"
          allTestId="AllCategories"
        />

        <FilterSection
          title="FILTER BY STATUS"
          options={statusFilterOptions}
          type={FilterType.STATUS}
          allLabel="All statuses"
          allTestId="AllStatuses"
        />

        <FilterSection
          title="FILTER BY TIME"
          options={timeFilterOptions}
          type={FilterType.TIME}
          allLabel="All proposals"
          allTestId="AllProposals"
        />
      </div>

      {/* Footer with Reset and Apply buttons - sticky on mobile */}
      <div className={`pt-6 border-t border-text-20 ${!isDesktop ? 'sticky bottom-0 bg-bg-80' : ''}`}>
        <div className="flex gap-3">
          <Button
            onClick={handleClearAll}
            variant="transparent"
            className={`${isDesktop ? 'w-full' : 'flex-1'} border border-text-20 text-white hover:bg-white/5 flex items-center justify-center gap-2`}
            disabled={!hasActiveFilters}
            data-testid="ResetFiltersButton"
          >
            <TrashIcon size={16} />
            Reset filters
          </Button>
          {!isDesktop && (
            <Button onClick={onClose} variant="primary" className="flex-1" data-testid="ApplyButton">
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  if (isDesktop) {
    // Desktop: Show as sidebar
    return (
      <div className={cn('w-[256px] h-full pt-[56px] pb-4 px-6 bg-bg-60 rounded-sm', className)} {...props}>
        {sidebarContent}
      </div>
    )
  }

  // Mobile: Show as modal using standard Modal component
  return (
    <>
      {isOpen && (
        <Modal onClose={onClose} className="bg-bg-80 p-4 pt-14" closeButtonColor="white" fullscreen>
          {sidebarContent}
        </Modal>
      )}
    </>
  )
}
