import type { KeyboardEvent } from 'react'
import type { Address } from 'viem'

import { CopyButton } from '@/components/CopyButton'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { BiCopyIcon } from '@/components/Icons'
import { Span } from '@/components/Typography'
import { cn, shortAddress } from '@/lib/utils'

interface WalletIdentityProps {
  address?: Address
  className?: string
}

/**
 * Which wallet the onboarding is talking about.
 *
 * This replaced a static "Your wallet" label. In a flow that sends people to four external
 * services and asks them to send tokens back, the receiving address is the one thing the
 * panel cannot otherwise confirm — and it is exactly what they have to paste into an
 * exchange's withdrawal field.
 *
 * Mirrors the header's `AccountAddress`: same jdenticon, same `shortAddress`, same copy
 * affordance. Deliberately no RNS/ENS resolution — the header does not resolve it for the
 * connected user either, and the two disagreeing would be worse than neither having it.
 */
export const WalletIdentity = ({ address, className }: WalletIdentityProps) => {
  if (!address) {
    return null
  }

  // `CopyButton` is a div with an onClick, so it is mouse-only as shipped. It sets its own
  // onClick after spreading props, which `onKeyDown` survives — so this is what makes the
  // control reachable by keyboard without forking a shared component.
  const activateOnKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    event.currentTarget.click()
  }

  return (
    <div className={cn('flex flex-row items-center gap-2', className)} data-testid="intro-wallet-identity">
      <span className="shrink-0 rounded-full bg-white leading-none">
        <Jdenticon size="20" value={address} />
      </span>

      <CopyButton
        copyText={address}
        icon={<BiCopyIcon className="h-4 w-4 rotate-180" />}
        role="button"
        tabIndex={0}
        aria-label={`Copy your wallet address, ${address}`}
        onKeyDown={activateOnKeyboard}
        className="justify-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <Span variant="body-s" className="text-text-100">
          {shortAddress(address)}
        </Span>
      </CopyButton>
    </div>
  )
}
