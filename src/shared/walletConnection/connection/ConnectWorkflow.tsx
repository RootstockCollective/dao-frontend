'use client'
import { ConnectButtonComponent } from '@/shared/walletConnection/components/ConnectButtonComponent'
import { DisclaimerFlow } from '@/shared/walletConnection/components/DisclaimerFlowModal'
import { ConnectWorkflowProps } from '../types'
import { useAppKitFlow } from './useAppKitFlow'

/**
 * The developer can override the ConnectComponent to use a custom button/component to trigger the flow.
 * @param ConnectComponent
 * @constructor
 */
export const ConnectWorkflow = ({ ConnectComponent = ConnectButtonComponent }: ConnectWorkflowProps) => {
  const { intermediateStep, handleConnectWallet, handleCloseIntermediateStep, onConnectWalletButtonClick } =
    useAppKitFlow()

  return (
    <>
      <ConnectComponent onClick={onConnectWalletButtonClick} />
      {!!intermediateStep && (
        <DisclaimerFlow onAgree={handleConnectWallet} onClose={handleCloseIntermediateStep} />
      )}
    </>
  )
}
