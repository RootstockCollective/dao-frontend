import { FC } from 'react'
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
  return configs[actionType]
}

export const ActionCell: FC<ActionCellProps> = ({ className, actionType, onClick }) => {
  const config = getActionConfig(actionType)

  const handleClick = () => {
    onClick?.()
  }

  if (!config) {
    return <TableCell className={cn(className, 'border-solid align-center')} />
  }

  return (
    <TableCell className={cn(className, 'border-solid align-center')}>
      <Button
        variant="outlined"
        onClick={handleClick}
        className="p-2 min-w-[40px] h-[40px] flex justify-center items-center gap-1 text-sm font-medium text-[var(--text-0)] font-rootstock-sans leading-[145%]"
      >
        {config.icon} {config.text}
      </Button>
    </TableCell>
  )
}
