import { MultipleSelectDropdown, SelectorOption } from '@/app/builders/components/MultipleSelectDropdown'
import { CommonComponentProps } from '@/components/commonProps'
import { CloseIconKoto } from '@/components/Icons'
import { MoreIcon } from '@/components/Icons/MoreIcon'
import { BaseColumnId, useTableActionsContext, useTableContext } from '@/shared/context/TableContext'

type ColumnLabel = {
  label: string
  sublabel?: string
}

export type TableColumnDropdownLabels<ColumnId extends BaseColumnId = BaseColumnId> = Record<
  ColumnId,
  ColumnLabel
>

export type TableColumnDropdownProps<ColumnId extends BaseColumnId = BaseColumnId> = CommonComponentProps & {
  labels: TableColumnDropdownLabels<ColumnId>
}

export const TableColumnDropdown = <ColumnId extends BaseColumnId = BaseColumnId>({
  className,
  labels,
}: TableColumnDropdownProps<ColumnId>) => {
  const { columns } = useTableContext<ColumnId>()
  const dispatch = useTableActionsContext<ColumnId>()

  const handleColumnChange = (newSelected: ColumnId[]) => {
    // Hidden are columns whose IDs are NOT in newSelected
    const hiddenColumns = columns.map(col => col.id).filter(id => !newSelected.includes(id))
    dispatch({ type: 'SET_HIDDEN_COLUMNS', payload: hiddenColumns })
  }

  // Filter out columns without labels
  const columnOptions: SelectorOption<ColumnId>[] = columns.reduce((acc, col) => {
    const labelInfo = labels[col.id]
    if (!labelInfo) return acc

    acc.push({
      id: col.id,
      label: labelInfo.label,
      sublabel: labelInfo.sublabel,
    })
    return acc
  }, [] as SelectorOption<ColumnId>[])

  // Currently visible (not hidden) columns
  const selectedColumns = columns.filter(col => !col.hidden).map(col => col.id)

  return (
    <div className={className}>
      <MultipleSelectDropdown
        title="Table Columns"
        options={columnOptions}
        selected={selectedColumns}
        onChange={handleColumnChange}
        trigger={isOpen => (
          <div className="p-0 border-none bg-inherit">{isOpen ? <CloseIconKoto /> : <MoreIcon />}</div>
        )}
      />
    </div>
  )
}
