import { FC, TableHTMLAttributes, useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTableContext } from '../context/TableContext'

interface TableRowProps extends Omit<TableHTMLAttributes<HTMLTableRowElement>, 'onClick'> {
  rowId?: string
  isSelected?: boolean
  onClick?: (rowId: string) => void
  selectable?: boolean
}

// Safe hook that handles context availability
const useSafeTableContext = () => {
  try {
    return useTableContext()
  } catch {
    return null
  }
}

/**
 * Stateful table row component with selection capabilities
 * Manages highlighting state and integrates with TableContext for selection
 * Uses consistent typography and design patterns with existing Table components
 */
export const TableRow: FC<TableRowProps> = ({
  className,
  rowId,
  isSelected: externalIsSelected,
  onClick,
  selectable = false,
  children,
  ...props
}) => {
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const rowRef = useRef<HTMLTableRowElement>(null)

  // Always call the hook safely
  const tableContext = useSafeTableContext()

  // Determine if row is selected - use external prop or context
  const isSelected =
    externalIsSelected ?? (rowId && tableContext ? tableContext.actions.isRowSelected(rowId) : false)

  // Apply hover color change to all child elements
  useEffect(() => {
    if (rowRef.current && selectable) {
      const elements = rowRef.current.querySelectorAll('*')
      elements.forEach(element => {
        const htmlElement = element as HTMLElement
        if (isHighlighted) {
          // Store original color
          if (!htmlElement.dataset.originalColor) {
            htmlElement.dataset.originalColor = htmlElement.style.color || ''
          }

          // Apply hover color
          htmlElement.style.color = 'var(--Background-100, #171412)'
        } else if (htmlElement.dataset.originalColor !== undefined) {
          // Restore original color
          htmlElement.style.color = htmlElement.dataset.originalColor
        }
      })
    }
  }, [isHighlighted, selectable])

  const handleClick = useCallback(() => {
    if (selectable && rowId) {
      if (onClick) {
        onClick(rowId)
      } else if (tableContext) {
        // Use context selection by default
        tableContext.actions.toggleRowSelection(rowId)
      }
    }
  }, [selectable, rowId, onClick, tableContext])

  const handleMouseEnter = useCallback(() => {
    if (selectable) {
      setIsHighlighted(true)
      setShowTooltip(true)
    }
  }, [selectable])

  const handleMouseLeave = useCallback(() => {
    setIsHighlighted(false)
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

  // CSS-in-JS styles for hover state
  const hoverStyles =
    isHighlighted && selectable
      ? {
          borderBottom: '1px solid var(--Background-60, #37322F)',
          background: 'var(--Text-80, #E4E1DA)',
        }
      : {}

  return (
    <>
      <tr
        ref={rowRef}
        className={cn(
          // Base classes matching existing Table pattern
          'text-[14px] border-hidden relative',
          // Selection and interaction styles
          selectable && [
            'cursor-pointer transition-all duration-150',
            // Selected state with subtle styling consistent with table design
            isSelected && 'bg-white/5 border-primary/20',
          ],
          className,
        )}
        style={{
          borderTopStyle: 'solid',
          ...hoverStyles,
          ...props.style,
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        data-selected={isSelected}
        data-highlighted={isHighlighted}
        {...props}
      >
        {children}
      </tr>

      {/* Tooltip that follows the mouse */}
      {showTooltip && selectable && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            // Layout styles
            display: 'flex',
            padding: '24px',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '8px',
            alignSelf: 'stretch',
            // Style properties
            borderRadius: '4px',
            background: 'var(--Text-80, #E4E1DA)',
            boxShadow: '0px 8px 24px 0px rgba(23, 20, 18, 0.14)',
          }}
        >
          <span
            style={{
              // Typography
              color: 'var(--Background-100, #171412)',
              fontFamily: 'Rootstock Sans',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '145%' /* 20.3px */,
              // Style
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
