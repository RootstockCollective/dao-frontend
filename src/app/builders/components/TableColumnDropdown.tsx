import { FC } from 'react'
import { CommonComponentProps } from '@/components/commonProps'
import { Button } from '@/components/Button'
import { MoreIcon } from '@/components/Icons/MoreIcon'
import { MultipleSelectDropdown, SelectorOption } from '@/app/builders/components/MultipleSelectDropdown'
import { CloseIcon } from '@/components/Icons/CloseIcon'
import { useTableContext, useTableActionsContext } from '@/shared/context/TableContext'

export const TableColumnDropdown: FC<CommonComponentProps> = ({ className }) => {
  const { columns } = useTableContext()
  const dispatch = useTableActionsContext()

  const handleColumnChange = (newSelected: string[]) => {
    // Get IDs of hidden columns (those not in newSelected)
    const hiddenColumns = columns.map(col => col.id).filter(id => !newSelected.includes(id))

    dispatch({ type: 'SET_HIDDEN_COLUMNS', payload: hiddenColumns })
  }

  // Convert columns to selector options
  const columnOptions: SelectorOption[] = columns.map(col => ({
    id: col.id,
    label: col.label,
    sublabel: col.sublabel,
  }))

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
          <Button variant="secondary" className="p-0 border-none">
            {isOpen ? <CloseIcon /> : <MoreIcon />}
          </Button>
        )}
      />
    </div>
  )
}
