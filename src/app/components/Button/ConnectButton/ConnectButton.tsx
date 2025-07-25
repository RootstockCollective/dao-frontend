import { Button, ButtonProps } from '@/components/ButtonNew'
import { ReactElement, ReactNode } from 'react'
import { ConnectTooltip } from '../../Tooltip/ConnectTooltip/ConnectTooltip'
import { ConnectTooltipContent } from '../../Tooltip/ConnectTooltip/ConnectTooltipContent'

export type ConnectButtonProps = ButtonProps & {
  tooltipContent: ReactNode
}

export const ConnectButton = ({ children, tooltipContent, ...props }: ConnectButtonProps): ReactElement => (
  <ConnectTooltip tooltipContent={<ConnectTooltipContent>{tooltipContent}</ConnectTooltipContent>}>
    <Button variant="secondary-outline" {...props}>
      {children}
    </Button>
  </ConnectTooltip>
)
