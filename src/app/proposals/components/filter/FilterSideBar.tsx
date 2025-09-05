import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'
import { FilterRadioItem } from './FilterRadioItem'
import { FilterOption, categoryFilterOptions, statusFilterOptions, timeFilterOptions } from './filterOptions'
import { Button } from '@/components/Button'
import { Header } from '@/components/Typography'
import { Modal } from '@/components/Modal'
import { TrashIcon } from '@/components/Icons'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface FilterSideBarProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  activeFilters: string[]
  onAddFilter: (filter: { type: 'category' | 'status' | 'time'; label: string; value: string }) => void
  onRemoveFilter: (value: string) => void
  title?: string
}

/**
 * Enhanced sidebar panel containing filters for categories, status, and time
 * Shows as modal on mobile, sidebar on desktop
 * Extends the existing filtering system from commit 9cdc386
 */
export function FilterSideBar({
  isOpen,
  onClose,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  className,
  title = 'Filter by category',
  ...props
}: FilterSideBarProps) {
  const isDesktop = useIsDesktop()

  const handleFilterToggle = (option: FilterOption, type: 'category' | 'status' | 'time') => {
    if (activeFilters.includes(option.value)) {
      onRemoveFilter(option.value)
    } else {
      onAddFilter({ type, label: option.label, value: option.value })
    }
  }

  const handleClearAll = () => {
    activeFilters.forEach(value => onRemoveFilter(value))
  }

  const hasActiveFilters = activeFilters.length > 0

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
    type: 'category' | 'status' | 'time'
    allLabel: string
    allTestId: string
  }) => (
    <div>
      <Header variant="h5" className="mb-4 text-text-40 uppercase">
        {title}
      </Header>
      <ul className="pl-1 space-y-3" role="group">
        <li>
          <FilterRadioItem
            selected={activeFilters.length === 0}
            option={{ label: allLabel, value: '' }}
            onClick={() => handleClearAll()}
            data-testid={allTestId}
          />
        </li>
        {options.map((option, i) => (
          <li key={i}>
            <FilterRadioItem
              selected={activeFilters.includes(option.value)}
              option={option}
              onClick={() => handleFilterToggle(option, type)}
              data-testid={`${type}Filter-${option.label}`}
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
          type="category"
          allLabel="All categories"
          allTestId="AllCategories"
        />

        <FilterSection
          title="FILTER BY STATUS"
          options={statusFilterOptions}
          type="status"
          allLabel="All statuses"
          allTestId="AllStatuses"
        />

        <FilterSection
          title="FILTER BY TIME"
          options={timeFilterOptions}
          type="time"
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
          >
            <TrashIcon size={16} />
            Reset filters
          </Button>
          {!isDesktop && (
            <Button onClick={onClose} variant="primary" className="flex-1">
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
