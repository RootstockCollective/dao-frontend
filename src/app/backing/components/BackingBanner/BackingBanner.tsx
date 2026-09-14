'use client'

import Image from 'next/image'
import { useState } from 'react'

import { CRWhitepaperLink } from '@/app/collective-rewards/shared/components/CRWhitepaperLinkNew'
import { CommonComponentProps } from '@/components/commonProps'
import { DismissButton } from '@/components/DismissButton'
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

export const BackingBanner = ({ className = '' }: CommonComponentProps) => {
  // Dismissal lasts for the session only: a reload brings the card back
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) {
    return null
  }

  return (
    <div
      className={cn(
        'relative w-full self-stretch overflow-hidden rounded-lg bg-v3-bg-accent-100 text-v3-text-100',
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

      <DismissButton
        aria-label="Dismiss the What's in it for me banner"
        onClick={() => setIsDismissed(true)}
        className="absolute right-4 top-4 z-base"
        data-testid="DismissBackingBannerButton"
      />

      <div className="relative flex flex-col items-start gap-4 px-4 py-6 md:p-6">
        <Header caps variant="h3">{`What's in it for me?`}</Header>

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
      </div>
    </div>
  )
}
