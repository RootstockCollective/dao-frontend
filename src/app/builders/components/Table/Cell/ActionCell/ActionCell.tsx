// FIXME: move to @/app/builders/components/Table folder
import { Builder } from '@/app/collective-rewards/types'
import { isBuilderActive } from '@/app/collective-rewards/utils'
import { Button } from '@/components/ButtonNew/Button'
import { CogIcon, HandshakeIcon, TrashIcon } from '@/components/Icons/v3design'
import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export const ACTION_CONFIG = {
  removeBacking: { text: 'Remove Backing', icon: <TrashIcon size={16} /> },
  adjustBacking: { text: 'Adjust Backing', icon: <CogIcon size={16} /> },
  backBuilder: { text: 'Back Builder', icon: <HandshakeIcon size={16} /> },
} as const

export type Action = keyof typeof ACTION_CONFIG

export const getActionType = (builder: Builder, hasBackingByUser: boolean): Action => {
  const isActive = isBuilderActive(builder.stateFlags)
  if (!isActive) {
    return 'removeBacking'
  }

  if (!hasBackingByUser) {
    return 'backBuilder'
  }

  return 'adjustBacking'
}
export type ActionCellProps = CommonComponentProps<HTMLButtonElement> & {
  className?: string
  actionType: Action
}

export const ActionCell = ({ className, actionType, onClick, ...props }: ActionCellProps): ReactNode => {
  const config = ACTION_CONFIG[actionType]

  if (!config) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    onClick && onClick(e)
  }

  return (
    <Button
      variant="secondary-outline"
      onClick={handleClick}
      className={cn(
        'p-2 min-w-[40px] h-7 flex justify-center items-center gap-1 text-sm font-medium text-v3-text-0 font-rootstock-sans leading-[145%] outline-0 border-0 overflow-visible',
        className,
      )}
      {...props}
    >
      <span className="flex justify-center text-nowrap items-center gap-1">
        {config.icon} {config.text}
      </span>
    </Button>
  )
}
