import { Button } from '@/components/ButtonNew/Button'
import { ConnectButtonComponentProps } from '../types'
import { Span } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'

/**
 * New button that shows Connect Wallet
 * @param onClick
 * @constructor
 */
export const ConnectButtonComponent = ({
  onClick,
  className,
  textClassName,
}: ConnectButtonComponentProps) => (
  <Button
    onClick={onClick}
    data-testid="ConnectWallet"
    variant="secondary-outline"
    className={`px-2 py-1 border-bg-40 ${className ?? ''}`}
    textClassName={`text-[14px] font-normal ${textClassName ?? ''}`}
  >
    <Span className="text-[14px] font-normal">Connect Wallet</Span>
  </Button>
)

export const ConnectButtonOrangeComponent = ({ onClick, className }: ConnectButtonComponentProps) => (
  <Button
    onClick={onClick}
    data-testid="ConnectWallet"
    variant="primary"
    className={cn('px-2 py-1 border-bg-40', className)}
  >
    Connect Wallet
  </Button>
)

export const ConnectButtonComponentSecondary = ({ onClick }: ConnectButtonComponentProps) => (
  <Button onClick={onClick} data-testid="ConnectWallet" variant="secondary">
    Connect Wallet
  </Button>
)
