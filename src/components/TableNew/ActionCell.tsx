import { FC, useState } from 'react'
import { TableCell } from '@/components/Table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/Button'

type ActionType = 'select' | 'edit' | 'delete' | 'view' // Add more action types as needed

type ActionCellProps = {
  className?: string
  actionType: ActionType
  onClick?: () => void
}

const getActionConfig = (actionType: ActionType) => {
  const configs = {
    select: { text: 'Select', icon: '⋯' },
    edit: { text: 'Edit', icon: '⋯' },
    delete: { text: 'Delete', icon: '⋯' },
    view: { text: 'View', icon: '⋯' },
  }
  return configs[actionType] || configs.select
}

export const ActionCell: FC<ActionCellProps> = ({ className, actionType, onClick }) => {
  const [isVisible, setIsVisible] = useState(false)
  const config = getActionConfig(actionType)

  const handleToggle = () => {
    setIsVisible(!isVisible)
    onClick?.()
  }

  return (
    <TableCell className={cn(className, 'border-solid align-center')}>
      <Button
        variant="outlined"
        onClick={handleToggle}
        className="text-center p-2 min-w-[40px] h-[40px] flex items-center justify-center"
      >
        {isVisible ? '✕' : config.icon}
      </Button>
    </TableCell>
  )
}
