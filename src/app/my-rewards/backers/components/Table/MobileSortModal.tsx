import { Modal } from '@/components/Modal/Modal'
import { Button } from '@/components/Button'
import { Paragraph } from '@/components/Typography'
import { SelectableItem } from '@/components/SelectableItem'
import { ColumnId, SORT_OPTIONS } from './BackerRewardsTable.config'
import { FC, useState, useEffect } from 'react'
import { TrashIcon } from '@/components/Icons'
import { SORT_DIRECTION_ASC, SORT_DIRECTION_DESC } from '@/shared/context/TableContext/constants'
import { SortDirection } from '@/shared/context/TableContext/types'

interface MobileSortModalProps {
  isOpen: boolean
  currentSort: ColumnId | null
  currentSortDirection: SortDirection | null
  onClose: () => void
  onApply: (sort: ColumnId | null, sortDirection: SortDirection | null) => void
  onReset: () => void
}

export const MobileSortModal: FC<MobileSortModalProps> = ({
  isOpen,
  currentSort,
  currentSortDirection,
  onClose,
  onApply,
  onReset,
}) => {
  const [tempSort, setTempSort] = useState<ColumnId | null>(currentSort)
  const [tempSortDirection, setTempSortDirection] = useState<SortDirection | null>(currentSortDirection)

  const resetTempState = () => {
    setTempSort(currentSort)
    setTempSortDirection(currentSortDirection)
  }

  useEffect(() => {
    if (isOpen) {
      resetTempState()
    }
  }, [isOpen, currentSort, currentSortDirection]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  const handleClose = () => {
    resetTempState()
    onClose()
  }

  const handleApply = () => {
    onApply(tempSort, tempSortDirection)
  }

  const handleReset = () => {
    setTempSort(null)
    setTempSortDirection(null)
    onReset()
  }

  const sortRadioOptions = SORT_OPTIONS.map(option => ({
    label: option.label,
    value: option.id,
  }))

  const sortDirectionOptions = [
    { label: 'Ascending', value: SORT_DIRECTION_ASC },
    { label: 'Descending', value: SORT_DIRECTION_DESC },
  ]

  return (
    <Modal onClose={handleClose} fullscreen data-testid="mobile-backer-rewards-sort-modal">
      <div className="flex flex-col h-full bg-v3-bg-accent-80 rounded-lg">
        <div className="flex-1 p-4 pt-16 overflow-y-auto">
          {/* Sort By Section */}
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

          <div className="mb-8">
            <Paragraph className="text-v3-bg-accent-40 text-xs font-bold uppercase tracking-wider mb-4">
              SORT DIRECTION
            </Paragraph>
            <div className="space-y-3">
              {sortDirectionOptions.map(option => (
                <SelectableItem
                  key={option.value}
                  option={option}
                  selected={tempSortDirection === option.value}
                  onClick={value => setTempSortDirection(value as SortDirection)}
                  variant="round"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-v3-text-100/20 flex gap-4">
          <Button variant="secondary-outline" onClick={handleReset} data-testid="reset-sort-button">
            <TrashIcon size={24} className="mr-1" />
            Reset
          </Button>
          <Button variant="primary" onClick={handleApply} data-testid="apply-sort-button">
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  )
}
