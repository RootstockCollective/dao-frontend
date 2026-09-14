'use client'

import { useState } from 'react'

import { Button } from '@/components/Button'
import { CommonComponentProps } from '@/components/commonProps'
import { DismissButton } from '@/components/DismissButton'
import { Header, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'

import { MotionLogo } from './MotionLogo'

const POSSIBILITIES = [
  {
    title: 'Build',
    description: 'Build on Rootstock with EVM compatibility and familiar tools.',
  },
  {
    title: 'Earn',
    description: 'Stake RIF for voting rights and a say in DAO governance.',
  },
  {
    title: 'Participate',
    description: 'Vote on proposals that decide grants and governance changes.',
  },
]

/**
 * Light hero shown to visitors without a connected wallet: the animated Collective logo
 * next to the three things the DAO lets them do, plus the connect call to action.
 */
export const CollectivePossibilities = ({ className }: CommonComponentProps) => {
  // Dismissal lasts for the session only: a reload brings the card back
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) {
    return null
  }

  return (
    <div
      data-testid="CollectivePossibilities"
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-sm bg-v3-text-80 text-v3-bg-accent-100 lg:flex-row',
        className,
      )}
    >
      <MotionLogo className="h-[160px] w-full shrink-0 lg:h-auto lg:w-[200px]" />

      <div className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Span caps bold variant="body-s" className="tracking-widest text-v3-bg-accent-60">
              Don&apos;t miss
            </Span>
            <Header caps variant="h2">
              The Collective <Span variant="h2" className="text-v3-bg-accent-40">{`Possibilities`}</Span>
            </Header>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ConnectWorkflow
              ConnectComponent={props => (
                <Button {...props} data-testid="ConnectButton">
                  Connect wallet
                </Button>
              )}
            />
            <DismissButton
              variant="onLight"
              aria-label="Dismiss the Collective Possibilities banner"
              onClick={() => setIsDismissed(true)}
              data-testid="DismissPossibilitiesButton"
            />
          </div>
        </div>

        <ul className="grid list-none grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
          {POSSIBILITIES.map(({ title, description }) => (
            <li key={title} className="flex flex-col gap-2 border-t border-v3-bg-accent-100/15 pt-4 md:pt-6">
              <Header caps variant="h5">
                {title}
              </Header>
              <Paragraph>{description}</Paragraph>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
