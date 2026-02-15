import { RootstockLogoIcon } from '@/components/Icons'
import { Span } from '@/components/Typography'
import { ENV } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface NetworkLogoProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * If true, shows only the logo without the network text
   * Useful for compact layouts
   */
  compact?: boolean
}

/**
 * NetworkLogo displays the Rootstock logo, with a network badge on testnet.
 * On mainnet, it renders just the plain logo.
 *
 * This helps users immediately identify which network they are using.
 */
export const NetworkLogo = ({ compact = false, className, ...props }: NetworkLogoProps) => {
  // On mainnet, show plain white logo
  if (ENV !== 'testnet') {
    return <RootstockLogoIcon className={cn('text-white', className)} />
  }

  // On testnet, show logo with network badge (black logo on green background)
  return (
    <div
      className={cn(
        'flex items-center rounded-full bg-st-success text-black w-fit',
        compact ? 'size-11 justify-center' : 'gap-2 px-3 py-2',
        className,
      )}
      data-testid="NetworkLogo"
      {...props}
    >
      <RootstockLogoIcon />
      {!compact && <Span className="text-sm font-medium">Testnet</Span>}
    </div>
  )
}
