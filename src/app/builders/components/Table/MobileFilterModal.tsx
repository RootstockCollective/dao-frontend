import { Modal } from '@/components/Modal/Modal'
import { Button } from '@/components/Button'
import { Paragraph } from '@/components/Typography'
import { SelectableItem } from '@/components/SelectableItem'
import { BuilderFilterOption, BuilderFilterOptionId } from './BuilderFilterDropdown'
import { ColumnId } from './BuilderTable.config'
import { FC, useState, useEffect } from 'react'
import { TrashIcon } from '@/components/Icons'

interface MobileFilterModalProps {
  isOpen: boolean
  filterOptions: BuilderFilterOption[]
  currentFilter: BuilderFilterOptionId
  currentSort: ColumnId | null
  onClose: () => void
  onApply: (filter: BuilderFilterOptionId, sort: ColumnId | null) => void
  onReset: () => void
}

export const MobileFilterModal: FC<MobileFilterModalProps> = ({
  isOpen,
  filterOptions,
  currentFilter,
  currentSort,
  onClose,
  onApply,
  onReset,
}) => {
  // Internal state for temporary selections
  const [tempFilter, setTempFilter] = useState<BuilderFilterOptionId>(currentFilter)
  const [tempSort, setTempSort] = useState<ColumnId | null>(currentSort)

  // Sync internal state when modal opens or current values change
  useEffect(() => {
    if (isOpen) {
      setTempFilter(currentFilter)
      setTempSort(currentSort)
    }
  }, [isOpen, currentFilter, currentSort])

  if (!isOpen) return null

  const handleClose = () => {
    // Reset temp state to current values on close
    setTempFilter(currentFilter)
    setTempSort(currentSort)
    onClose()
  }

  const handleApply = () => {
    onApply(tempFilter, tempSort)
  }

  const handleReset = () => {
    setTempFilter('all')
    setTempSort(null)
    onReset()
  }

  const sortOptions: { id: ColumnId; label: string }[] = [
    { id: 'builder', label: 'Builder name' },
    { id: 'backer_rewards', label: 'Backer Rewards %' },
    { id: 'rewards_past_cycle', label: 'Rewards - past cycle' },
    { id: 'rewards_upcoming', label: 'Rewards - upcoming cycle' },
    { id: 'backing', label: 'Backing amount' },
    { id: 'backingShare', label: 'Backing share %' },
  ]

  // Map sort options to FilterOption format
  const sortRadioOptions = sortOptions.map(option => ({
    label: option.label,
    value: option.id,
  }))

  return (
    <Modal onClose={handleClose} fullscreen data-testid="mobile-builders-filter-modal">
      <div className="flex flex-col h-full bg-v3-bg-accent-80 rounded-lg">
        <div className="flex-1 p-4 pt-16 overflow-y-auto">
          {/* Sort builders Section */}
          <div className="mb-8">
            <Paragraph className="text-v3-bg-accent-40 text-xs font-bold uppercase tracking-wider mb-4">
              SORT BY
            </Paragraph>
            <div className="space-y-3">
              {sortRadioOptions.map(option => (
                <SelectableItem
                  key={option.value}
                  option={option}
                  selected={tempSort === option.value}
                  onClick={value => setTempSort(value as ColumnId)}
                  variant="round"
                />
              ))}
            </div>
          </div>

          {/* Filter Builders Section */}
          <div>
            <Paragraph className="text-v3-bg-accent-40 text-xs font-bold uppercase tracking-wider mb-4">
              FILTER BUILDERS
            </Paragraph>
            {filterOptions.length <= 1 ? (
              <Paragraph>
                No filter options available, all the Collective Builders are currently active.
              </Paragraph>
            ) : (
              <div className="space-y-3">
                {filterOptions.map(option => (
                  <SelectableItem
                    key={option.id}
                    option={{ label: option.label, value: option.id }}
                    selected={tempFilter === option.id}
                    onClick={value => setTempFilter(value as BuilderFilterOptionId)}
                    variant="round"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-v3-text-100/20 flex gap-4">
          <Button variant="secondary-outline" onClick={handleReset} data-testid="reset-filter-button">
            <TrashIcon size={24} className="mr-1" />
            Reset
          </Button>
          <Button variant="primary" onClick={handleApply} data-testid="apply-filter-button">
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  )
}
