import { cn } from '@/lib/utils'
import { type HTMLAttributes, useState, useEffect, useMemo } from 'react'
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
  onApply: (filters: ActiveFilter[]) => void
}

/**
 * Reusable sidebar panel containing configurable filter groups
 * Shows as modal on mobile, sidebar on desktop
 * Filters are only applied when clicking Apply button
 */
export function FilterSideBar({
  isOpen,
  onClose,
  filterGroups,
  activeFilters,
  onApply,
  className,
  ...props
}: Props) {
  const isDesktop = useIsDesktop()

  // Pending filters: what user is selecting before clicking Apply
  const [pendingFilters, setPendingFilters] = useState<ActiveFilter[]>(activeFilters)

  // Sync pending filters with active filters when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setPendingFilters(activeFilters)
    }
  }, [isOpen, activeFilters])

  const hasFiltersChanged = useMemo(() => {
    if (pendingFilters.length !== activeFilters.length) {
      return true
    }
    // check if any pending filter doesn't have a match in active filters
    return pendingFilters.some(pendingFilter => {
      return !activeFilters.some(
        activeFilter =>
          pendingFilter.groupId === activeFilter.groupId &&
          pendingFilter.option.value === activeFilter.option.value,
      )
    })
  }, [pendingFilters, activeFilters])

  // Helper to check if a filter is selected (in pending state)
  const isFilterSelected = (groupId: string, option: FilterOption) => {
    return pendingFilters.some(f => f.groupId === groupId && f.option.value === option.value)
  }

  // Helper to check if "all" filter is selected for a group (no filters active)
  const isAllSelected = (groupId: string) => {
    return !pendingFilters.some(f => f.groupId === groupId)
  }

  // Handle toggling a filter option
  const handleFilterToggle = (groupId: string, option: FilterOption) => {
    const group = filterGroups.find(g => g.id === groupId)
    const isMultiSelect = group?.isMultiSelect ?? false

    setPendingFilters(prev => {
      const isSelected = prev.some(f => f.groupId === groupId && f.option.value === option.value)

      if (isSelected) {
        // Remove the filter
        return prev.filter(f => !(f.groupId === groupId && f.option.value === option.value))
      }

      if (isMultiSelect) {
        // Add to existing filters
        return [...prev, { groupId, option }]
      }

      // Single select: replace any existing filter for this group
      return [...prev.filter(f => f.groupId !== groupId), { groupId, option }]
    })
  }

  // Handle clearing all filters for a group
  const handleClearGroup = (groupId: string) => {
    setPendingFilters(prev => prev.filter(f => f.groupId !== groupId))
  }

  // Handle clearing all filters
  const handleClearAll = () => {
    setPendingFilters([])
  }

  // Handle applying the pending filters
  const handleApply = () => {
    onApply(pendingFilters)
    onClose()
  }

  const sidebarContent = (
    <div className="flex flex-col" onClick={e => e.stopPropagation()}>
      <div className="flex-1 space-y-10 overflow-y-auto md:pb-2">
        {filterGroups.map(group => (
          <FilterSection
            key={group.id}
            group={group}
            isAllSelected={isAllSelected}
            isFilterSelected={isFilterSelected}
            onClearGroup={handleClearGroup}
            onFilterToggle={handleFilterToggle}
          />
        ))}

        {/* Footer with Reset and Apply buttons - sticky on mobile */}
        <div className={`pt-4 ${!isDesktop ? 'border-t border-bg-60 sticky bottom-0 bg-bg-80' : ''}`}>
          <div className="flex gap-3">
            <Button
              onClick={handleClearAll}
              variant="secondary-outline"
              className="flex-1 hover:bg-white/5 flex items-center justify-center gap-2"
              disabled={pendingFilters.length === 0}
              data-testid="ResetFiltersButton"
            >
              <>
                {!isDesktop && <TrashIcon size={16} />}
                Reset
              </>
            </Button>
            <Button
              onClick={handleApply}
              variant="primary"
              className="flex-1"
              disabled={!hasFiltersChanged}
              data-testid="ApplyButton"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  if (isDesktop) {
    // Desktop: Show as sidebar
    return (
      <div className={cn('w-[256px] h-full pt-14 pb-4 px-6 bg-bg-60 rounded-sm', className)} {...props}>
        {sidebarContent}
      </div>
    )
  }

  if (isOpen) {
    // Mobile: Show as modal using standard Modal component
    return (
      <Modal onClose={onClose} className="p-4 pt-14" data-testid="FilterSideBarModal">
        {sidebarContent}
      </Modal>
    )
  }

  return null
}
