'use client'
import { useState } from 'react'
import { useConnect } from 'wagmi'
import { useAlertContext } from '@/app/providers'
import { ConnectButtonComponent } from '@/lib/walletConnection/components/ConnectButtonComponent'
import { DisclaimerFlow } from '@/lib/walletConnection/components'
import { parseWalletConnectionError } from '@/lib/walletConnection/utils'
import { ConnectWorkflowProps } from '@/lib/walletConnection/types'

/**
 * The developer can override the ConnectComponent to use a custom button/component to trigger the flow.
 * @param ConnectComponent
 * @constructor
 */
export const ConnectWorkflow = ({ ConnectComponent = ConnectButtonComponent }: ConnectWorkflowProps) => {
  const [flowState, setFlowState] = useState('idle')

  const { connectors, connectAsync } = useConnect()
  const { setMessage } = useAlertContext()

  const handleConnectWallet = () => {
    if (connectors.length) {
      connectAsync({ connector: connectors[connectors.length - 1] }).catch(err => {
        setFlowState('idle')
        setMessage({
          severity: 'error',
          content: parseWalletConnectionError(err),
          title: 'Failed to connect to wallet',
        })
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
      <ConnectComponent onClick={onConnectWalletButtonClick} />
      {flowState === 'disclaimer' && <DisclaimerFlow onAgree={handleConnectWallet} onClose={handleClose} />}
    </>
  )
}
