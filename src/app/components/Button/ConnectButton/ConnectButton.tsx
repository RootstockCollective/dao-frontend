import { Button, ButtonProps } from '@/components/ButtonNew'
import { DisclaimerFlow } from '@/shared/walletConnection'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { ReactElement, ReactNode } from 'react'
import { ConnectTooltip } from '../../Tooltip/ConnectTooltip/ConnectTooltip'
import { ConnectTooltipContent } from '../../Tooltip/ConnectTooltip/ConnectTooltipContent'

export type ConnectButtonProps = ButtonProps & {
  tooltipContent: ReactNode
}

export const ConnectButton = ({ children, tooltipContent, ...props }: ConnectButtonProps): ReactElement => {
  const { intermediateStep, handleConnectWallet, handleCloseIntermediateStep, onConnectWalletButtonClick } =
    useAppKitFlow()
  return (
    <>
      <ConnectTooltip
        tooltipContent={
          <ConnectTooltipContent onClick={onConnectWalletButtonClick}>{tooltipContent}</ConnectTooltipContent>
        }
      >
        <Button variant="secondary-outline" {...props}>
          {children}
        </Button>
      </ConnectTooltip>
      {!!intermediateStep && (
        <DisclaimerFlow onAgree={handleConnectWallet} onClose={handleCloseIntermediateStep} />
      )}
    </>
  )
}
