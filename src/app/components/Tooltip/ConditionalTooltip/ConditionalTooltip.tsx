import { Tooltip, TooltipProps } from '@/components/Tooltip'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export type TooltipConditionPair = {
  condition: () => boolean
  lazyContent: () => ReactNode
}

export type ConditionalTooltipProps = Omit<TooltipProps, 'text' | 'disabled'> & {
  conditionPairs: TooltipConditionPair[]
}

export const ConditionalTooltip = ({
  children,
  conditionPairs,
  className,
  ...tooltipProps
}: ConditionalTooltipProps) => {
  const currentConditionIndex = conditionPairs.findIndex(({ condition }) => condition())
  const currentContent = conditionPairs[currentConditionIndex]?.lazyContent() ?? ''

  return (
    <Tooltip
      className={cn('rounded-sm z-50 bg-v3-text-80 text-v3-bg-accent-60 p-6 text-sm', className)}
      side="top"
      align="center"
      text={currentContent}
      disabled={currentConditionIndex === -1}
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  )
}
