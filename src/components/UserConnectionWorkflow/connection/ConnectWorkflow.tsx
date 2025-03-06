'use client'
import { ComponentType, useState } from 'react'
import { Button } from '@/components/Button'
import { useConnect } from 'wagmi'
import { useAlertContext } from '@/app/providers'
import { ConfirmationModal } from '@/components/Modal'
import { disclaimerModalText } from '@/components/UserConnectionWorkflow/connection/constants'

interface ConnectWorkflowProps {
  ConnectComponent?: ComponentType<ConnectButtonComponentProps>
}

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

interface ConnectButtonComponentProps {
  onClick: () => void
}

const ConnectButtonComponent = ({ onClick }: ConnectButtonComponentProps) => (
  <Button onClick={onClick} data-testid="ConnectWallet" variant="primary-new">
    Connect Wallet
  </Button>
)

interface DisclaimerFlowProps {
  onAgree: () => void
  onClose: () => void
}

/**
 * Shows the modal with the disclaimer text and triggers the onAgree callback when the user agrees.
 * @param onAgree
 * @param onClose
 * @constructor
 */
const DisclaimerFlow = ({ onAgree, onClose }: DisclaimerFlowProps) => {
  return (
    <ConfirmationModal
      title={disclaimerModalText.modalTitle}
      isOpen
      onClose={onClose}
      onDecline={onClose}
      onAccept={onAgree}
    >
      {disclaimerModalText.modalDescription}
    </ConfirmationModal>
  )
}

/**
 * Parses the error object when attempting to connect to extract the error message.
 * @param error
 */
function parseWalletConnectionError(error: unknown): string {
  let errorParsed: string

  if (error instanceof Error) {
    // If it's an Error object, access the message property directly
    errorParsed = error.message
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    // If it's an object with a message property (but not an Error instance)
    errorParsed = (error as { message: string }).message
  } else {
    // Fall back to string conversion for other cases
    errorParsed = String(error)
  }
  switch (true) {
    case errorParsed.includes('rejected the request'):
      return 'Request to connect wallet has been rejected.'
    case errorParsed.includes('already pending'):
      return 'You have a pending request. Please check your wallet.'
    default:
      return errorParsed
  }
}
