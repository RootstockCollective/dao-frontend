import { FC } from 'react'
import { TableCell } from '@/components/Table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/Button'
import { RemoveBackingIcon } from '@/components/Icons/RemoveBackingIcon'
import { AdjustBacking } from '@/components/Icons/AdjustBackingIcon'
import { BackBuilder } from '@/components/Icons/BackBuilderIcon'

type ActionType = 'removeBacking' | 'adjustBacking' | 'backBuilder'

type ActionCellProps = {
  className?: string
  actionType: ActionType
  onClick?: () => void
}

const getActionConfig = (actionType: ActionType) => {
  const configs = {
    removeBacking: { text: 'Remove Backing', icon: <RemoveBackingIcon size={16} /> },
    adjustBacking: { text: 'Adjust Backing', icon: <AdjustBacking size={16} /> },
    backBuilder: { text: 'Back Builder', icon: <BackBuilder size={16} /> },
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
        <span className="flex justify-center items-center gap-1">
          {config.icon} {config.text}
        </span>
      </Button>
    </TableCell>
  )
}
