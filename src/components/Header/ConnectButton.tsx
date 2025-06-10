import { FC } from 'react'
import { useConnect } from 'wagmi'
import { Button } from '../Button'
import { isUserRejectedTxError } from '../ErrorPage'
import { useErrorBoundary } from 'react-error-boundary'

interface Props {
  onSuccess?: () => void
  variant?: 'primary' | 'white'
  children?: string
}

/**
 * @deprecated
 * @param onSuccess
 * @param children
 * @param variant
 * @constructor
 */
export const ConnectButton: FC<Props> = ({ onSuccess, children = 'Connect wallet', variant = 'primary' }) => {
  const { connectors, connectAsync } = useConnect({
    mutation: { onSuccess },
  })

  const { showBoundary } = useErrorBoundary()

  const handleConnectWallet = () => {
    if (connectors.length) {
      connectAsync({ connector: connectors[connectors.length - 1] }).catch(err => {
        if (!isUserRejectedTxError(err)) {
          showBoundary(err)
        }
      })
    }
  }

  return (
    <Button onClick={handleConnectWallet} variant={variant} data-testid="ConnectWallet">
      {children}
    </Button>
  )
}
