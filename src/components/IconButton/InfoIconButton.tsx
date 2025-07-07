import { KotoQuestionMarkIcon } from '@/components/Icons/KotoQuestionMarkIcon'
import { Tooltip, type TooltipProps } from '@/components/Tooltip'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../commonProps'

export interface InfoIconButtonProps extends CommonComponentProps, Omit<TooltipProps, 'text' | 'children'> {
  info: ReactNode
  tooltipClassName?: string
}

export const InfoIconButton: FC<InfoIconButtonProps> = ({
  info,
  className = '',
  tooltipClassName = '',
  ...tooltipProps
}) => (
  <div data-testid="InfoIconButton" className={cn('items-center flex gap-2 self-center', className)}>
    <Tooltip
      text={info}
      className={cn('rounded-sm z-50 bg-v3-text-80 text-v3-bg-accent-60', tooltipClassName)}
      {...tooltipProps}
    >
      <KotoQuestionMarkIcon />
    </Tooltip>
  </div>
)
