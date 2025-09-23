import { ReactNode } from 'react'
import { ConditionalTooltip } from '@/app/components'
import { ConnectTooltipContent } from '@/app/components/Tooltip/ConnectTooltip/ConnectTooltipContent'
import { SelectBuildersTooltipContent, NonHoverableBuilderTooltipContent } from './TooltipContents'

interface BuilderRowConditionalTooltipProps {
  children: ReactNode
  className?: string
  isConnected: boolean
  canBack: boolean
  hasSelections: boolean
  onConnectWalletButtonClick: () => void
}

export const BuilderRowConditionalTooltip = ({
  children,
  className,
  isConnected,
  canBack,
  hasSelections,
  onConnectWalletButtonClick,
}: BuilderRowConditionalTooltipProps) => {
  return (
    <ConditionalTooltip
      side="top"
      align="start"
      className={className}
      supportMobileTap={true}
      conditionPairs={[
        {
          condition: () => !isConnected,
          lazyContent: () => (
            <ConnectTooltipContent onClick={onConnectWalletButtonClick}>
              Connect your wallet to select Builders, back and adjust their backing.
            </ConnectTooltipContent>
          ),
        },
        {
          condition: () => !canBack,
          lazyContent: () => <NonHoverableBuilderTooltipContent />,
        },
        {
          condition: () => !hasSelections,
          lazyContent: () => <SelectBuildersTooltipContent />,
        },
      ]}
    >
      {children}
    </ConditionalTooltip>
  )
}
