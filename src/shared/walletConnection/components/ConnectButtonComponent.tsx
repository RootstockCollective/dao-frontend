import { Button } from '@/components/Button'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { ConnectButtonComponentProps } from '../types'

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
    className={cn('px-2 py-1 border-bg-40', className)}
  >
    <Span variant="body-s" className={textClassName}>
      Connect Wallet
    </Span>
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
  <Button
    onClick={onClick}
    data-testid="ConnectWallet"
    variant="secondary-outline"
    className="flex h-[1.75rem] p-[0.25rem_0.5rem] items-center gap-[0.5rem] rounded-sm border border-bg-40 px-2 py-1"
  >
    <Span className="text-v3-bg-accent-100 font-rootstock-sans not-italic text-sm font-normal leading-[145%]">
      Connect Wallet
    </Span>
  </Button>
)
