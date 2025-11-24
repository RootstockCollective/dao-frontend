import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { TrashIcon } from '@/components/Icons'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { FilterGroup, ActiveFilter, FilterOption } from './types'
import { FilterSection } from './FilterSection'

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  filterGroups: FilterGroup[]
  activeFilters: ActiveFilter[]
  onFilterToggle: (groupId: string, option: FilterOption) => void
  onClearGroup: (groupId: string) => void
  onClearAll: () => void
}

/**
 * Reusable sidebar panel containing configurable filter groups
 * Shows as modal on mobile, sidebar on desktop
 * Filters apply immediately on toggle
 */
export function FilterSideBar({
  isOpen,
  onClose,
  filterGroups,
  activeFilters,
  onFilterToggle,
  onClearGroup,
  onClearAll,
  className,
  ...props
}: Props) {
  const isDesktop = useIsDesktop()

  const hasActiveFilters = activeFilters.length > 0

  // Helper to check if a filter is selected
  const isFilterSelected = (groupId: string, option: FilterOption) => {
    return activeFilters.some(f => f.groupId === groupId && f.option.value === option.value)
  }

  // Helper to check if "all" filter is selected for a group (no filters active)
  const isAllSelected = (groupId: string) => {
    return !activeFilters.some(f => f.groupId === groupId)
  }

  const sidebarContent = (
    <div className="flex flex-col" onClick={e => e.stopPropagation()}>
      <div className="flex-1 space-y-8 overflow-y-auto pb-8">
        {filterGroups.map(group => (
          <FilterSection
            key={group.id}
            group={group}
            isAllSelected={isAllSelected}
            isFilterSelected={isFilterSelected}
            onClearGroup={onClearGroup}
            onFilterToggle={onFilterToggle}
          />
        ))}
      </div>

      {/* Footer with Reset and Apply buttons - sticky on mobile */}
      <div className={`pt-6 border-t border-text-20 ${!isDesktop ? 'sticky bottom-0 bg-bg-80' : ''}`}>
        <div className="flex gap-3">
          <Button
            onClick={onClearAll}
            variant="secondary-outline"
            className={`${isDesktop ? 'w-full' : 'flex-1'} hover:bg-white/5 flex items-center justify-center gap-2`}
            disabled={!hasActiveFilters}
            data-testid="ResetFiltersButton"
          >
            {isDesktop ? (
              'Reset filters'
            ) : (
              <>
                <TrashIcon size={16} />
                Reset
              </>
            )}
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

  if (isOpen) {
    // Mobile: Show as modal using standard Modal component
    return (
      <Modal onClose={onClose} className="bg-bg-80 p-4 pt-14" closeButtonColor="white" fullscreen>
        {sidebarContent}
      </Modal>
    )
  }

  return null
}
