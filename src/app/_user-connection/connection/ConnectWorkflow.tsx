'use client'
import { ComponentType, useState } from 'react'
import { Button } from '@/components/Button'
import { useConnect } from 'wagmi'
import { useAlertContext } from '@/app/providers'
const onSuccess = () => {
  console.log('Dummy on success')
}

interface ConnectWorkflowProps {
  ConnectComponent?: ComponentType<ConnectButtonComponentProps>
}

/**
 * The developer can override the ConnectComponent to use a custom button/component.
 // @TODO what if the user leaves metamask opened? (handle case)
 * @param ConnectComponent
 * @constructor
 */
export const ConnectWorkflow = ({ ConnectComponent = ConnectButtonComponent }: ConnectWorkflowProps) => {
  const [flowState, setFlowState] = useState('idle')

  const { connectors, connectAsync } = useConnect({
    mutation: { onSuccess },
  })
  const { setMessage } = useAlertContext()

  const handleConnectWallet = () => {
    if (connectors.length) {
      connectAsync({ connector: connectors[connectors.length - 1] }).catch(err => {
        setFlowState('idle')
        setMessage({
          severity: 'error',
          content: err.toString(),
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

interface ConnectButtonComponentProps {
  onClick: () => void
}

const ConnectButtonComponent = ({ onClick }: ConnectButtonComponentProps) => (
  <Button
    onClick={onClick}
    data-testid="ConnectWallet"
    buttonProps={{ style: { width: '165px', height: '40px' } }}
  >
    Connect Wallet
  </Button>
)

interface DisclaimerFlowProps {
  onAgree: () => void
  onClose: () => void
}

/**
 * This is dependent on the generic modal @TODO
 * @param onAgree
 * @param onClose
 * @constructor
 */
const DisclaimerFlow = ({ onAgree, onClose }: DisclaimerFlowProps) => {
  return (
    <div>
      <p>A placeholder for the modal here</p>
      <button type="button" onClick={onAgree}>
        Agree
      </button>
      <button type="button" onClick={onClose}>
        Agree
      </button>
    </div>
  )
}
