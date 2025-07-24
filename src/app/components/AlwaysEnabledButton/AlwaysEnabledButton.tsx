import { ConditionalTooltip, TooltipConditionPair } from '@/app/components/ConditionalTooltip'
import { Button, ButtonProps } from '@/components/ButtonNew'
import { TooltipProps } from '@/components/Tooltip'

export type ButtonWithTipProps = ButtonProps & {
  conditionPairs: TooltipConditionPair[]
  tooltipProps?: Omit<TooltipProps, 'text' | 'disabled'>
}

export const AlwaysEnabledButton = ({
  conditionPairs,
  children,
  className,
  tooltipProps,
  ...buttonProps
}: ButtonWithTipProps) => {
  return (
    <ConditionalTooltip conditionPairs={conditionPairs} className={className} {...tooltipProps}>
      <Button disabled={false} {...buttonProps}>
        {children}
      </Button>
    </ConditionalTooltip>
  )
}
