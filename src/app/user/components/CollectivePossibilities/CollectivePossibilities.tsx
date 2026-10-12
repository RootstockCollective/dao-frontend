'use client'

import { useEffect, useId, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import useLocalStorageState from 'use-local-storage-state'

import { Button } from '@/components/Button'
import { CommonComponentProps } from '@/components/commonProps'
import { DismissButton } from '@/components/DismissButton'
import { useTopBarDock } from '@/components/MainContainer/TopBarDockProvider'
import { cn } from '@/lib/utils'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import type { ConnectButtonComponentProps } from '@/shared/walletConnection/types'

import { DISMISSED_STORAGE_KEY } from './constants'
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

const BannerConnectButton = ({ onClick }: ConnectButtonComponentProps) => (
  <Button onClick={onClick} className={cn(CONNECT_CTA_CLASSES, 'h-12 px-[26px]')} data-testid="ConnectButton">
    Connect wallet
  </Button>
)

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const getFocusablesAfter = (element: HTMLElement) =>
  [...document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    candidate =>
      Boolean(element.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING) &&
      !element.contains(candidate) &&
      candidate.getBoundingClientRect().bottom > 0,
  )

const focusFirst = (candidates: HTMLElement[]) => {
  for (const candidate of candidates) {
    candidate.focus()
    if (document.activeElement === candidate) return
  }
}

export const CollectivePossibilities = ({ className }: CommonComponentProps) => {
  const titleId = useId()
  const [isDismissed, setIsDismissed] = useLocalStorageState(DISMISSED_STORAGE_KEY, { defaultValue: false })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLElement>(null)
  const tileRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const nextFocusRef = useRef<HTMLElement[]>([])

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

  const dismiss = () => {
    const wrapper = wrapperRef.current
    const focused = document.activeElement
    if (wrapper && focused && (wrapper.contains(focused) || slot?.contains(focused))) {
      nextFocusRef.current = getFocusablesAfter(wrapper)
    }
    setIsDismissed(true)
  }

  useLayoutEffect(() => {
    if (!isDismissed) return
    focusFirst(nextFocusRef.current)
    nextFocusRef.current = []
  }, [isDismissed])

  if (isDismissed) {
    return null
  }

  return (
    <div ref={wrapperRef} data-testid="CollectivePossibilities" className={cn('mb-4 max-md:mt-4', className)}>
      <section
        ref={bannerRef}
        aria-labelledby={titleId}
        className={cn(
          'relative grid origin-top grid-cols-1 overflow-hidden rounded-[16px] bg-warm-surface-raised',
          '@min-[900px]/content:grid-cols-[minmax(0,1fr)_minmax(260px,30%)]',
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
                THE COLLECTIVE <span className="text-warm-text-subtle">POSSIBILITIES</span>
              </h2>
            </div>

            <div ref={actionsRef} className="flex flex-none items-center gap-3">
              <ConnectWorkflow ConnectComponent={BannerConnectButton} />
              <DismissButton
                variant="round"
                aria-label="Dismiss the Don't Miss banner"
                onClick={dismiss}
                data-testid="DismissPossibilitiesButton"
              />
            </div>
          </div>

          <ul className="m-0 grid list-none grid-cols-1 gap-x-10 gap-y-5 p-0 @min-[1180px]/content:grid-cols-3">
            {POSSIBILITIES.map(({ title, description }) => (
              <li
                key={title}
                className="grid min-w-0 grid-cols-[minmax(110px,140px)_1fr] items-baseline gap-x-5 gap-y-2 @min-[1180px]/content:grid-cols-1"
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
          className="relative -order-1 min-h-[180px] overflow-hidden bg-banner-ink @min-[900px]/content:order-none @min-[900px]/content:min-h-[300px]"
          data-testid="PossibilitiesTile"
        >
          <div ref={tileRef} className="absolute inset-0">
            <PosterArt
              moleculeSize={120}
              imageClassName="object-[100%_50%] @min-[900px]/content:object-[70%_50%]"
              moleculeClassName="justify-end pr-14 @min-[900px]/content:justify-center @min-[900px]/content:pr-0"
            />
            <MotionLogo className="hidden @min-[900px]/content:block" paused={isDocked} />
          </div>
        </div>
      </section>

      {slot &&
        createPortal(
          <PossibilitiesDock
            isDocked={isDocked}
            shouldAnimate={shouldAnimate}
            onDismiss={dismiss}
            bannerActionsRef={actionsRef}
          />,
          slot,
        )}
    </div>
  )
}
