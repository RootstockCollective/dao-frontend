import { ConditionalTooltip, TooltipConditionPair } from '@/app/components/Tooltip/ConditionalTooltip'
import { CommonComponentProps } from '@/components/commonProps'
import { ReactElement, ReactNode } from 'react'
import { useAccount } from 'wagmi'

export interface ConnectTooltipProps extends CommonComponentProps {
  tooltipContent: ReactNode
}

export const ConnectTooltip = ({ children, tooltipContent, ...props }: ConnectTooltipProps): ReactElement => {
  const { isConnected } = useAccount()

  const conditionPairs: TooltipConditionPair[] = [
    {
      condition: () => !isConnected,
      lazyContent: () => tooltipContent,
    },
  ]

  return (
    <ConditionalTooltip conditionPairs={conditionPairs} className="p-0" {...props}>
      {children}
    </ConditionalTooltip>
  )
}
