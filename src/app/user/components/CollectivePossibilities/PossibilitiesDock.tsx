'use client'

import { type RefObject, useRef } from 'react'

import { Button } from '@/components/Button'
import { DismissButton } from '@/components/DismissButton'
import { cn } from '@/lib/utils'
import { useInertHandoff } from '@/shared/hooks/useInertHandoff'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import type { ConnectButtonComponentProps } from '@/shared/walletConnection/types'

import { PosterArt } from './PosterArt'
import { CONNECT_CTA_CLASSES, EYEBROW_CLASSES } from './styles'

const DockConnectButton = ({ onClick }: ConnectButtonComponentProps) => (
  <Button
    onClick={onClick}
    className={cn(CONNECT_CTA_CLASSES, 'h-10 px-5')}
    textClassName="text-[15px]"
    data-testid="DockConnectButton"
  >
    Connect wallet
  </Button>
)

interface PossibilitiesDockProps {
  isDocked: boolean
  shouldAnimate: boolean
  onDismiss: () => void
  bannerActionsRef: RefObject<HTMLElement | null>
}

export const PossibilitiesDock = ({
  isDocked,
  shouldAnimate,
  onDismiss,
  bannerActionsRef,
}: PossibilitiesDockProps) => {
  const dockRef = useRef<HTMLDivElement>(null)
  const isInert = useInertHandoff(!isDocked, dockRef, focused => {
    const dockActions = [...(dockRef.current?.querySelectorAll<HTMLElement>('button') ?? [])]
    return bannerActionsRef.current?.querySelectorAll<HTMLElement>('button')[dockActions.indexOf(focused)]
  })

  return (
    <div
      ref={dockRef}
      className={cn(
        '@container grid',
        isDocked ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        shouldAnimate &&
          'transition-[grid-template-rows] duration-320 ease-out-cubic motion-reduce:transition-none',
      )}
      inert={isInert}
      data-docked={isDocked}
      data-testid="PossibilitiesDock"
    >
      <div className="min-h-0 overflow-hidden">
        <div
          role="region"
          aria-label="Connect wallet prompt"
          className={cn(
            'mb-3 flex h-16 items-center gap-4 rounded-[12px] border border-btc-orange/35 bg-warm-surface-raised pl-2.5 pr-3',
            isDocked ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
            shouldAnimate &&
              'transition-[opacity,translate] duration-[280ms,320ms] ease-out-cubic motion-reduce:transition-none',
          )}
        >
          <div className="relative size-11 shrink-0 overflow-hidden rounded-[8px] bg-banner-ink">
            <PosterArt moleculeSize={24} imageClassName="object-[70%_50%]" />
          </div>

          <div className="flex min-w-0 flex-1 items-baseline gap-3.5 overflow-hidden whitespace-nowrap">
            <span className={cn(EYEBROW_CLASSES, 'hidden flex-none text-[12px] @min-[900px]:inline')}>
              Don&apos;t miss
            </span>
            <span className="min-w-0 truncate font-kk-topo text-[20px] leading-none text-v3-text-80">
              THE COLLECTIVE <span className="text-warm-text-subtle">POSSIBILITIES</span>
            </span>
          </div>

          <ConnectWorkflow ConnectComponent={DockConnectButton} />
          <DismissButton
            variant="roundQuiet"
            aria-label="Dismiss the connect prompt"
            onClick={onDismiss}
            data-testid="DismissDockButton"
          />
        </div>
      </div>
    </div>
  )
}
