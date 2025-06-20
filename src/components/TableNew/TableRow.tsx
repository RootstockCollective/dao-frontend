import { FC, TableHTMLAttributes, useCallback, useState, useContext } from 'react'
import { cn } from '@/lib/utils'
import { TableContext } from '@/shared/context/TableContext/TableContext'
import { TableActionsContext } from '@/shared/context/TableContext/TableActionsContext'

interface TableRowProps extends Omit<TableHTMLAttributes<HTMLTableRowElement>, 'onClick'> {
  rowId?: string
  isSelected?: boolean
  onClick?: (rowId: string) => void
  selectable?: boolean
}

export const TableRow: FC<TableRowProps> = ({
  className,
  rowId,
  isSelected: externalIsSelected,
  onClick,
  selectable = false,
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
    if (selectable && rowId) {
      if (onClick) {
        onClick(rowId)
      } else if (dispatch) {
        dispatch({ type: 'TOGGLE_ROW_SELECTION', payload: rowId })
      }
    }
  }, [selectable, rowId, onClick, dispatch])

  const handleMouseEnter = useCallback(() => {
    if (selectable) {
      setShowTooltip(true)
    }
  }, [selectable])

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (selectable) {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }
    },
    [selectable],
  )

  return (
    <>
      <tr
        className={cn(
          'text-[14px] border-hidden relative',
          selectable && [
            'cursor-pointer transition-all duration-150',
            'hover:bg-[var(--color-v3-text-80)] hover:border-b hover:border-[var(--color-v3-bg-accent-60)]',
            'hover:[&_*]:text-[var(--color-v3-bg-accent-100)]',
            isSelected && 'bg-white/5 border-primary/20',
          ],
          className,
        )}
        style={{
          borderTopStyle: 'solid',
          ...props.style,
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        data-selected={isSelected}
        {...props}
      >
        {children}
      </tr>

      {showTooltip && selectable && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            display: 'flex',
            padding: '24px',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '8px',
            alignSelf: 'stretch',
            borderRadius: '4px',
            background: 'var(--color-v3-text-80)',
            boxShadow: '0px 8px 24px 0px rgb(from var(--color-v3-bg-accent-100) r g b / 0.14)',
          }}
        >
          <span
            style={{
              color: 'var(--Background-100, #171412)',
              fontFamily: 'Rootstock Sans',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '145%',
              alignSelf: 'stretch',
            }}
          >
            Select the row
          </span>
        </div>
      )}
    </>
  )
}
