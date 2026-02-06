import { Modal } from '@/components/Modal/Modal'
import { Button } from '@/components/Button'
import { Paragraph } from '@/components/Typography'
import { SelectableItem } from '@/components/SelectableItem'
import { ColumnId, SORT_LABELS, BackerRewardsCellDataMap } from './BackerRewardsTable.config'
import { FC, useState, useEffect } from 'react'
import { TrashIcon } from '@/components/Icons'
import { SORT_DIRECTION_ASC, SORT_DIRECTION_DESC } from '@/shared/context/TableContext/constants'
import { SortDirection } from '@/shared/context/TableContext/types'
import { useTableContext, useTableActionsContext } from '@/shared/context'

interface MobileSortModalProps {
  isOpen: boolean
  onClose: () => void
}

export const MobileSortModal: FC<MobileSortModalProps> = ({ isOpen, onClose }) => {
  const { sort, defaultSort, columns } = useTableContext<ColumnId, BackerRewardsCellDataMap>()
  const dispatch = useTableActionsContext<ColumnId, BackerRewardsCellDataMap>()

  const [tempSort, setTempSort] = useState<ColumnId | null>(sort.columnId)
  const [tempSortDirection, setTempSortDirection] = useState<SortDirection | null>(sort.direction)

  useEffect(() => {
    if (isOpen) {
      setTempSort(sort.columnId)
      setTempSortDirection(sort.direction)
    }
  }, [isOpen, sort.columnId, sort.direction])

  if (!isOpen) return null

  const handleApply = () => {
    const column = tempSort ?? defaultSort.columnId
    const direction = tempSortDirection ?? defaultSort.direction
    dispatch({
      type: 'SORT_BY_COLUMN',
      payload: { columnId: column, direction },
    })
    onClose()
  }

  const handleReset = () => {
    dispatch({
      type: 'SORT_BY_COLUMN',
      payload: { columnId: defaultSort.columnId, direction: defaultSort.direction },
    })
    onClose()
  }

  const sortRadioOptions = columns
    .filter(column => column.sortable && !column.hidden)
    .map(column => ({
      label: SORT_LABELS[column.id],
      value: column.id,
    }))

  return (
    <Modal onClose={onClose} data-testid="mobile-backer-rewards-sort-modal">
      <div className="flex flex-col h-full bg-v3-bg-accent-80 rounded-lg">
        <div className="flex-1 p-4 pt-16 overflow-y-auto">
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
              <SelectableItem
                option={{ label: 'Ascending', value: SORT_DIRECTION_ASC }}
                selected={tempSortDirection === SORT_DIRECTION_ASC}
                onClick={value => setTempSortDirection(value as SortDirection)}
                variant="round"
              />
              <SelectableItem
                option={{ label: 'Descending', value: SORT_DIRECTION_DESC }}
                selected={tempSortDirection === SORT_DIRECTION_DESC}
                onClick={value => setTempSortDirection(value as SortDirection)}
                variant="round"
              />
            </div>
          </div>
        </div>

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
