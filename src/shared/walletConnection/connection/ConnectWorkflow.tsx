'use client'
import { useState } from 'react'
import { useAlertContext } from '@/app/providers'
import { DisclaimerFlow, ConnectButtonComponent } from '../components'
import { parseWalletConnectionError } from '../utils'
import { useAppKit } from '@reown/appkit/react'
import { ConnectWorkflowProps } from '../types'

/**
 * The developer can override the ConnectComponent to use a custom button/component to trigger the flow.
 * @param ConnectComponent
 * @constructor
 */
export const ConnectWorkflow = ({ ConnectComponent = ConnectButtonComponent }: ConnectWorkflowProps) => {
  const [flowState, setFlowState] = useState('idle')
  const { open } = useAppKit()
  const { setMessage } = useAlertContext()

  const handleConnectWallet = () => {
    try {
      open()
    } catch (err) {
      setFlowState('idle')
      setMessage({
        severity: 'error',
        content: parseWalletConnectionError(err),
        title: 'Failed to connect to wallet',
      })
    }
  }

  const handleClose = () => {
    setFlowState('idle')
  }

  const onConnectWalletButtonClick = () => {
    setFlowState('disclaimer')
  }

  return (
    <>
      {/* Uncomment to use the AppKit connect wallet button */}
      {/*<appkit-button />*/}
      <ConnectComponent onClick={onConnectWalletButtonClick} />
      {flowState === 'disclaimer' && <DisclaimerFlow onAgree={handleConnectWallet} onClose={handleClose} />}
    </>
  )
}
