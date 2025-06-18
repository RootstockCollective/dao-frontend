import { Button } from '@/components/ButtonNew/Button'
import { CommonComponentProps } from '@/components/commonProps'
import { CloseIcon } from '@/components/Icons/CloseIcon'
import { MoreIcon } from '@/components/Icons/MoreIcon'
import { useTableActionsContext, useTableContext } from '@/shared/context/TableContext'
import { FC } from 'react'
import { MultipleSelectDropdown, SelectorOption } from './MultipleSelectDropdown'
import { ColumnId, ColumnType } from './Table/BuildersTable'

const COLUMN_DROPDOWN_OPTIONS: SelectorOption<ColumnId>[] = [
  {
    id: 'builder',
    label: 'Builder',
  },
  {
    id: 'backing',
    label: 'Backing',
  },
  {
    id: 'rewards_percentage',
    label: 'Rewards',
    sublabel: '%',
  },
  {
    id: 'rewards_past_cycle',
    label: 'Rewards',
    sublabel: 'past cycle',
  },
  {
    id: 'rewards_upcoming',
    label: 'Rewards',
    sublabel: 'upcoming cycle',
  },
  {
    id: 'allocations',
    label: 'Allocations',
  },
]

export const TableColumnDropdown: FC<CommonComponentProps> = ({ className }) => {
  const { columns } = useTableContext<ColumnId, ColumnType>()
  const dispatch = useTableActionsContext()

  const handleColumnChange = (newSelected: ColumnId[]) => {
    // Get IDs of hidden columns (those not in newSelected)
    const hiddenColumns = columns.map(col => col.id).filter(id => !newSelected.includes(id))

    dispatch({ type: 'SET_HIDDEN_COLUMNS', payload: hiddenColumns })
  }

  // Pick selector options from columns
  const columnOptions = COLUMN_DROPDOWN_OPTIONS.filter(option => columns.some(col => col.id === option.id))

  // Get currently visible columns
  const selectedColumns = columns.filter(col => !col.hidden).map(col => col.id)

  // FIXME: why wrap in div?
  return (
    <div className={className}>
      <MultipleSelectDropdown
        title="Table Columns"
        options={columnOptions}
        selected={selectedColumns}
        onChange={handleColumnChange}
        trigger={isOpen => (
          <Button variant="secondary" className="p-0 border-none">
            {isOpen ? <CloseIcon /> : <MoreIcon />}
          </Button>
        )}
      />
    </div>
  )
}
