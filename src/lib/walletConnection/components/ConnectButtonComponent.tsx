import { Button } from '@/components/Button'
import { ConnectButtonComponentProps } from '@/lib/walletConnection/types'

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
