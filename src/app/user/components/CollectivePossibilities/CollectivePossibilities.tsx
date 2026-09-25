'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { CommonComponentProps } from '@/components/commonProps'
import { DismissButton } from '@/components/DismissButton'
import { useTopBarDock } from '@/components/MainContainer/TopBarDockProvider'
import { cn } from '@/lib/utils'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'

import { MotionLogo } from './MotionLogo'
import { PossibilitiesDock } from './PossibilitiesDock'
import { PosterArt } from './PosterArt'
import { CONNECT_CTA_CLASSES, EYEBROW_CLASSES } from './styles'
import { useScrollDock } from './useScrollDock'

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
 * Dark hero shown to visitors without a connected wallet: the three things the DAO lets them
 * do and the connect call to action, next to the animated Collective logo.
 *
 * The layout follows the width of the content column rather than the viewport, since the
 * sidebar can be open or collapsed, so the breakpoints are container queries:
 * - 1180px and up: logo tile on the right, the three pillars side by side
 * - 900 to 1179px: tile on the right, one pillar per row with the label beside the text
 * - below 900px: the tile becomes a strip across the top showing only the poster, anchored on
 *   its bright edge with the molecule on the right, and the actions wrap under the title
 *
 * Scrolling it away shrinks and fades it and docks a compact bar under the top bar
 * (PossibilitiesDock), which stands in for the top bar's own Connect button until the banner
 * comes back. Dismissing either one removes both.
 */
export const CollectivePossibilities = ({ className }: CommonComponentProps) => {
  const titleId = useId()
  // Dismissal lasts for the session only: a reload brings the card back
  const [isDismissed, setIsDismissed] = useState(false)
  const bannerRef = useRef<HTMLElement>(null)
  const tileRef = useRef<HTMLDivElement>(null)

  const { slot, setActive, setDocked } = useTopBarDock()
  const { isDocked, shouldAnimate } = useScrollDock({
    bannerRef,
    tileRef,
    anchor: slot,
    isEnabled: !isDismissed,
  })

  useEffect(() => {
    setActive(!isDismissed)
    return () => setActive(false)
  }, [isDismissed, setActive])

  useEffect(() => {
    setDocked(isDocked)
    return () => setDocked(false)
  }, [isDocked, setDocked])

  const dismiss = () => setIsDismissed(true)

  if (isDismissed) {
    return null
  }

  return (
    <div data-testid="CollectivePossibilities" className={cn('@container mb-4', className)}>
      <section
        ref={bannerRef}
        aria-labelledby={titleId}
        className={cn(
          'relative grid origin-top will-change-[transform,opacity] grid-cols-1 overflow-hidden rounded-[16px] bg-warm-surface-raised',
          '@min-[900px]:grid-cols-[minmax(0,1fr)_minmax(260px,30%)]',
        )}
      >
        <div className="flex min-w-0 flex-col justify-between gap-9 p-[clamp(28px,3.2vw,48px)]">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
            <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-2.5">
              <span className={cn(EYEBROW_CLASSES, 'text-[13px]')}>Don&apos;t miss</span>
              <h2
                id={titleId}
                className="m-0 font-kk-topo text-[clamp(30px,2.8vw,40px)] leading-none tracking-[0.005em] text-v3-text-80"
              >
                THE COLLECTIVE <span className="text-warm-text-dim">POSSIBILITIES</span>
              </h2>
            </div>

            <div className="flex flex-none items-center gap-3">
              <ConnectWorkflow
                ConnectComponent={props => (
                  <button
                    type="button"
                    {...props}
                    className={cn(CONNECT_CTA_CLASSES, 'h-12 px-[26px] text-base')}
                    data-testid="ConnectButton"
                  >
                    Connect wallet
                  </button>
                )}
              />
              <DismissButton
                variant="round"
                aria-label="Dismiss"
                onClick={dismiss}
                data-testid="DismissPossibilitiesButton"
              />
            </div>
          </div>

          <ul className="m-0 grid list-none grid-cols-1 gap-x-10 gap-y-5 p-0 @min-[1180px]:grid-cols-3">
            {POSSIBILITIES.map(({ title, description }) => (
              <li
                key={title}
                className="grid min-w-0 grid-cols-[minmax(110px,140px)_1fr] items-baseline gap-x-5 gap-y-2 @min-[1180px]:grid-cols-1"
              >
                <span className="font-rootstock-sans text-[13px] font-medium uppercase tracking-[0.14em] text-v3-text-80">
                  {title}
                </span>
                <p className="m-0 font-rootstock-sans text-base leading-[1.55] text-pretty text-warm-text-soft">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative -order-1 min-h-[180px] overflow-hidden bg-banner-ink @min-[900px]:order-none @min-[900px]:min-h-[300px]"
          data-testid="PossibilitiesTile"
        >
          <div ref={tileRef} className="absolute inset-0 will-change-transform">
            <PosterArt
              moleculeSize={120}
              imageClassName="object-[100%_50%] @min-[900px]:object-[70%_50%]"
              moleculeClassName="justify-end pr-14 @min-[900px]:justify-center @min-[900px]:pr-0"
            />
            {/* The video centres the molecule, which a 180px strip would crop; the strip keeps the poster */}
            <MotionLogo className="hidden @min-[900px]:block" />
          </div>
        </div>
      </section>

      {slot &&
        createPortal(
          <PossibilitiesDock isDocked={isDocked} shouldAnimate={shouldAnimate} onDismiss={dismiss} />,
          slot,
        )}
    </div>
  )
}
