import { FC, TableHTMLAttributes, useCallback, useContext } from 'react'
import { cn } from '@/lib/utils'
import { TableContext } from '@/shared/context/TableContext/TableContext'
import { TableActionsContext } from '@/shared/context/TableContext/TableActionsContext'
import { Tooltip } from '@/components/Tooltip'
import { Paragraph } from '@/components/TypographyNew'

interface TableRowProps extends Omit<TableHTMLAttributes<HTMLTableRowElement>, 'onClick'> {
  rowId: string
  onClick?: (rowId: string) => void
}

export const TableRow: FC<TableRowProps> = ({ className, rowId, onClick, children, ...props }) => {
  const tableContext = useContext(TableContext)
  const dispatch = useContext(TableActionsContext)

  const isSelected = tableContext ? !!tableContext.selectedRows[rowId] : false

  const handleClick = useCallback(() => {
    if (rowId) {
      if (onClick) {
        onClick(rowId)
      } else if (dispatch) {
        dispatch({ type: 'TOGGLE_ROW_SELECTION', payload: rowId })
      }
    }
  }, [rowId, onClick, dispatch])

  return (
    <Tooltip
      text={
        <Paragraph variant="body-s" className="self-stretch text-[var(--color-v3-bg-accent-100)]">
          Select the row
        </Paragraph>
      }
      disabled={isSelected}
      side="right"
      sideOffset={10}
      className="flex flex-col items-start gap-2 self-stretch p-6 rounded bg-[var(--color-v3-text-80)] shadow-[0px_8px_24px_0px_rgba(23,20,18,0.14)] font-rootstock-sans"
    >
      <tr
        className={cn(
          'text-sm border-hidden relative border-t-solid',
          'cursor-pointer transition-all duration-150',
          'hover:bg-[var(--color-v3-text-80)] hover:border-b hover:border-[var(--color-v3-bg-accent-60)]',
          'hover:[&_*]:text-[var(--color-v3-bg-accent-100)]',
          isSelected && 'bg-white/5 border-primary/20',
          className,
        )}
        style={props.style}
        onClick={handleClick}
        data-selected={isSelected}
        {...props}
      >
        {children}
      </tr>
    </Tooltip>
  )
}
