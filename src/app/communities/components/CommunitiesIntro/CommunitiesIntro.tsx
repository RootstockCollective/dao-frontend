'use client'

import Image from 'next/image'

import { AccentSquare } from '@/components/AccentSquare'
import { CommonComponentProps } from '@/components/commonProps'
import { PersistedCollapsible } from '@/components/PersistedCollapsible'
import { Header, Paragraph } from '@/components/Typography'

export const COMMUNITIES_INTRO_STORAGE_KEY = 'communities-intro-open'

const ILLUSTRATION_SRC = '/images/hero/community-banner.png'

/** Same copy the Communities hero carried before the page moved to a banner. */
const POINTS = [
  'Collective Badges are dynamic NFTs that represent your role and impact within the DAO.',
  'Whether you’re a Builder, Backer, or Community Contributor, your badge shows that you belong.',
  'Be part of something bigger, helping shape the future of Bitcoin.',
  'These aren’t just collectibles. They are your passport to participation.',
]

const Bullet = () => (
  <span
    aria-hidden="true"
    className="mt-2 inline-block h-[6px] w-[6px] shrink-0 rounded-full border border-v3-text-60"
  />
)

/**
 * What Collective Badges are, as a collapsible section under the Communities banner, the same
 * way Proposals, Builders and Delegation explain themselves.
 */
export const CommunitiesIntro = ({ className }: CommonComponentProps) => (
  <PersistedCollapsible
    storageKey={COMMUNITIES_INTRO_STORAGE_KEY}
    data-testid="CommunitiesIntro"
    toggleTestId="CommunitiesIntroToggle"
    className={className}
    bodyClassName="flex flex-col gap-6 lg:flex-row lg:gap-8"
    heading={
      <div className="flex items-center gap-3">
        <AccentSquare />
        <Header caps variant="h3">
          Show your true colors <span className="text-v3-bg-accent-40">curated by the Collective</span>
        </Header>
      </div>
    }
  >
    <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-sm lg:w-[300px]">
      <Image
        src={ILLUSTRATION_SRC}
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 1024px) 300px, 100vw"
        className="object-cover"
      />
    </div>

    <ul className="grid flex-1 list-none grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
      {POINTS.map(point => (
        <li key={point} className="flex items-start gap-2">
          <Bullet />
          <Paragraph>{point}</Paragraph>
        </li>
      ))}
    </ul>
  </PersistedCollapsible>
)
