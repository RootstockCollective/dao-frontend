import { FC, TableHTMLAttributes, useCallback, useState, useContext } from 'react'
import { cn } from '@/lib/utils'
import { TableContext } from '@/shared/context/TableContext/TableContext'
import { TableActionsContext } from '@/shared/context/TableContext/TableActionsContext'

interface TableRowProps extends Omit<TableHTMLAttributes<HTMLTableRowElement>, 'onClick'> {
  rowId?: string
  isSelected?: boolean
  onClick?: (rowId: string) => void
}

export const TableRow: FC<TableRowProps> = ({
  className,
  rowId,
  isSelected: externalIsSelected,
  onClick,
  children,
  ...props
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)

  // Use context directly to avoid throwing errors when context is not available
  const tableContext = useContext(TableContext)
  const dispatch = useContext(TableActionsContext)

  const isSelected =
    externalIsSelected ?? (rowId && tableContext ? !!tableContext.selectedRows[rowId] : false)

  const handleClick = useCallback(() => {
    if (rowId) {
      if (onClick) {
        onClick(rowId)
      } else if (dispatch) {
        dispatch({ type: 'TOGGLE_ROW_SELECTION', payload: rowId })
      }
    }
  }, [rowId, onClick, dispatch])

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }, [])

  return (
    <>
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        data-selected={isSelected}
        {...props}
      >
        {children}
      </tr>

      {showTooltip && (
        <div
          className="fixed pointer-events-none z-50 flex p-6 flex-col items-start gap-2 self-stretch rounded bg-[var(--color-v3-text-80)] shadow-[0px_8px_24px_0px_rgb(from_var(--color-v3-bg-accent-100)_r_g_b_/_0.14)]"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
          }}
        >
          <span className="text-sm font-normal leading-[1.45] self-stretch text-[var(--color-v3-bg-accent-100)] font-[Rootstock_Sans]">
            Select the row
          </span>
        </div>
      )}
    </>
  )
}
