import { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useTableContext } from '../context/TableContext'
import { Span } from '../../Typography'

interface TableActionsBarProps {
  className?: string
  singleRowActions?: ReactNode
  multiRowActions?: ReactNode
  position?: 'top-right' | 'bottom'
}

/**
 * Table actions bar that displays different actions based on selection count
 * - Single row selected: shows actions at the bottom (inline with action column)
 * - Multiple rows selected: shows actions at the top-right
 * Uses consistent typography and design patterns with existing Table components
 * Currently disabled - no actions will be rendered
 */
export const TableActionsBar: FC<TableActionsBarProps> = ({
  className,
  singleRowActions,
  multiRowActions,
  position = 'top-right',
}) => {
  const { state } = useTableContext()
  const { selectedCount } = state

  // Return null to not render any actions
  return null
}
