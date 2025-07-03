import { Button } from '@/components/ButtonNew/Button'
import { Button as OldButton } from '@/components/Button/Button'
import { ConnectButtonComponentProps } from '../types'
import { Span } from '@/components/TypographyNew'

/**
 * New button that shows Connect Wallet
 * @param onClick
 * @constructor
 */
export const ConnectButtonComponent = ({ onClick }: ConnectButtonComponentProps) => (
  <Button
    onClick={onClick}
    data-testid="ConnectWallet"
    variant="secondary-outline"
    className="px-2 py-1 border-bg-40"
  >
    <Span className="text-[14px] font-normal">Connect Wallet</Span>
  </Button>
)

export const ConnectButtonOrangeComponent = ({ onClick }: ConnectButtonComponentProps) => (
  <Button onClick={onClick} data-testid="ConnectWallet" variant="primary" className="px-2 py-1 border-bg-40">
    Connect Wallet
  </Button>
)

export const ConnectButtonComponentSecondary = ({ onClick }: ConnectButtonComponentProps) => (
  <OldButton onClick={onClick} data-testid="ConnectWallet" variant="secondary">
    Connect Wallet
  </OldButton>
)
