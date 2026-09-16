'use client'

import Image from 'next/image'
import { useState } from 'react'

import { CRWhitepaperLink } from '@/app/collective-rewards/shared/components/CRWhitepaperLinkNew'
import { CommonComponentProps } from '@/components/commonProps'
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons'
import { Header, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

const BACKGROUND_SRC = '/images/backing-info-bg.webp'

/** Fades the artwork out towards the left so the copy stays readable. */
const DESKTOP_OVERLAY =
  'linear-gradient(90deg, #171412 0%, #171412 30%, rgba(23,20,18,0.9) 44%, rgba(23,20,18,0.4) 62%, rgba(23,20,18,0) 80%)'
const MOBILE_OVERLAY =
  'linear-gradient(180deg, rgba(23,20,18,0.95) 0%, rgba(23,20,18,0.9) 55%, rgba(23,20,18,0.65) 100%)'

const PERKS = [
  'Earn a share of the rewards from Builders you back',
  'Influence how rewards are distributed to Builders',
  'Retain full ownership and access to your stRIF',
]

const PerkBullet = () => (
  <span
    aria-hidden="true"
    className="mt-[0.4rem] inline-block size-[0.6rem] shrink-0 rounded-full border border-v3-primary"
  />
)

interface BackingBannerProps extends CommonComponentProps {
  /** Controls the collapse from the page, so the layout around it can react to the state. */
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export const BackingBanner = ({ className = '', isOpen: openProp, onOpenChange }: BackingBannerProps) => {
  // The collapse lasts for the session only: a reload brings the card back expanded
  const [uncontrolledOpen, setUncontrolledOpen] = useState(true)
  const isOpen = openProp ?? uncontrolledOpen

  const toggle = () => {
    const next = !isOpen
    setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col self-stretch overflow-hidden rounded-lg bg-v3-bg-accent-100 text-v3-text-100',
        className,
      )}
      data-testid="BackingBanner"
    >
      <Image
        src={BACKGROUND_SRC}
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover object-right"
      />
      <div className="absolute inset-0 md:hidden" style={{ background: MOBILE_OVERLAY }} />
      <div className="absolute inset-0 hidden md:block" style={{ background: DESKTOP_OVERLAY }} />

      <div
        className={cn(
          'relative flex flex-1 flex-col items-start gap-4 px-4 md:px-6',
          // Collapsed it is just a title row, so centre it in whatever height is left
          isOpen ? 'py-6' : 'justify-center py-4',
        )}
      >
        {/* The title row stays put, so collapsing leaves a slim strip instead of a gap */}
        <div className="flex w-full items-center justify-between gap-4">
          <Header caps variant="h3">{`What's in it for me?`}</Header>

          <button
            type="button"
            onClick={toggle}
            aria-expanded={isOpen}
            className="flex shrink-0 cursor-pointer items-center gap-1 text-v3-text-60 hover:text-v3-text-100"
            data-testid="BackingBannerToggle"
          >
            <Span variant="body-s">{isOpen ? 'Hide' : 'Show'}</Span>
            {isOpen ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
          </button>
        </div>

        {isOpen && (
          <>
            <ul className="flex list-none flex-col gap-2">
              {PERKS.map(perk => (
                <li key={perk} className="flex items-start gap-3">
                  <PerkBullet />
                  <Paragraph>{perk}</Paragraph>
                </li>
              ))}
            </ul>

            <Span className="mt-2 text-v3-primary">
              {/* CRWhitepaperLink spreads props last, so className replaces its own defaults */}
              See the <CRWhitepaperLink className="gap-1 underline">Whitepaper</CRWhitepaperLink>
            </Span>
          </>
        )}
      </div>
    </div>
  )
}
