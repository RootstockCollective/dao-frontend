import { MultipleSelectDropdown, SelectorOption } from '@/app/builders/components/MultipleSelectDropdown'
import { CommonComponentProps } from '@/components/commonProps'
import { CloseIcon } from '@/components/Icons/CloseIcon'
import { MoreIcon } from '@/components/Icons/MoreIcon'
import { useTableActionsContext, useTableContext } from '@/shared/context/TableContext'
import { FC } from 'react'
import { ColumnId } from '../BuilderTable.config'

type ColumnLabel = {
  label: string
  sublabel?: string
}
type DropdowColumn = Exclude<ColumnId, 'actions' | 'builder'>

const LABELS: Record<DropdowColumn, ColumnLabel> = {
  backer_rewards: {
    label: 'Backer Rewards %',
  },
  rewards_past_cycle: {
    label: 'Rewards',
    sublabel: 'past cycle',
  },
  rewards_upcoming: {
    label: 'Rewards',
    sublabel: 'upcoming cycle',
  },
  backing: {
    label: 'Backing',
  },
  allocations: {
    label: 'Backing share',
  },
}

export const TableColumnDropdown: FC<CommonComponentProps> = ({ className }) => {
  const { columns } = useTableContext()
  const dispatch = useTableActionsContext()

  const handleColumnChange = (newSelected: string[]) => {
    // Get IDs of hidden columns (those not in newSelected)
    const hiddenColumns = columns.map(col => col.id).filter(id => !newSelected.includes(id))

    dispatch({ type: 'SET_HIDDEN_COLUMNS', payload: hiddenColumns })
  }

  // Convert columns to selector options
  const columnOptions: SelectorOption[] = columns.reduce((acc, col) => {
    const labels = LABELS[col.id as DropdowColumn]
    if (!labels) {
      return acc
    }

    acc.push({
      id: col.id,
      label: labels.label,
      sublabel: labels.sublabel,
    })

    return acc
  }, [] as SelectorOption[])

  // Get currently visible columns
  const selectedColumns = columns.filter(col => !col.hidden).map(col => col.id)

  return (
    <div className={className}>
      <MultipleSelectDropdown
        title="Table Columns"
        options={columnOptions}
        selected={selectedColumns}
        onChange={handleColumnChange}
        trigger={isOpen => (
          <div className="p-0 border-none bg-inherit">{isOpen ? <CloseIcon /> : <MoreIcon />}</div>
        )}
      />
    </div>
  )
}
