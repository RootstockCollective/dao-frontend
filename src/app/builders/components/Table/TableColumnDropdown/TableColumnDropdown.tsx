import { MultipleSelectDropdown, SelectorOption } from '@/app/builders/components/MultipleSelectDropdown'
import { CommonComponentProps } from '@/components/commonProps'
import { CloseIconKoto } from '@/components/Icons'
import { MoreIcon } from '@/components/Icons/MoreIcon'
import { useTableActionsContext, useTableContext } from '@/shared/context/TableContext'

export const TableColumnDropdown = <ColumnId extends string>({
  className,
  labels,
}: CommonComponentProps & {
  labels: Partial<Record<ColumnId, { label: string; sublabel?: string }>>
}) => {
  // Tell useTableContext the generic too!
  const { columns } = useTableContext<ColumnId>()
  const dispatch = useTableActionsContext()

  const handleColumnChange = (newSelected: ColumnId[]) => {
    // Hidden are columns whose IDs are NOT in newSelected
    const hiddenColumns = columns.map(col => col.id).filter(id => !newSelected.includes(id))
    dispatch({ type: 'SET_HIDDEN_COLUMNS', payload: hiddenColumns })
  }

  // Build selector options by filtering columns for those with labels provided
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

  // Columns currently visible (not hidden)
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
