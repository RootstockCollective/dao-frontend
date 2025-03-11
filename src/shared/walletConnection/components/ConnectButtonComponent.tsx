import { Button } from '@/components/Button'
import { ConnectButtonComponentProps } from '../types'

/**
 * New button that shows Connect Wallet
 * @param onClick
 * @constructor
 */
export const ConnectButtonComponent = ({ onClick }: ConnectButtonComponentProps) => (
  <Button onClick={onClick} data-testid="ConnectWallet" variant="primary-new">
    Connect Wallet
  </Button>
)
export const ConnectButtonComponentSecondary = ({ onClick }: ConnectButtonComponentProps) => (
  <Button onClick={onClick} data-testid="ConnectWallet" variant="secondary">
    Connect Wallet
  </Button>
)