'use client'

import Image from 'next/image'
import Link from 'next/link'

import { CommonComponentProps } from '@/components/commonProps'
import { ArrowUpRightLightIcon } from '@/components/Icons'
import { ListBullet } from '@/components/ListBullet'
import { PersistedCollapsible } from '@/components/PersistedCollapsible'
import { Header, Paragraph } from '@/components/Typography'
import { currentLinks } from '@/lib/links'

/** The page's original hero artwork, from before the banners redesign. */
const ILLUSTRATION_SRC = '/images/hero/delegation-banner.webp'

export const WHY_DELEGATE_STORAGE_KEY = 'delegate-why-delegate-open'

const REASONS = [
  'You are only delegating your own voting power',
  'Your coins stay in your wallet',
  'You save on gas cost while being represented',
  'Your Rewards will keep accumulating as usual',
]

export const WhyDelegate = ({ className }: CommonComponentProps) => (
  <PersistedCollapsible
    storageKey={WHY_DELEGATE_STORAGE_KEY}
    data-testid="WhyDelegate"
    toggleTestId="WhyDelegateToggle"
    className={className}
    bodyClassName="flex flex-col gap-6 lg:flex-row lg:gap-8"
    heading={
      <Header caps variant="h3">
        Delegate your voting power <span className="text-v3-bg-accent-40">to influence what gets built</span>
      </Header>
    }
  >
    <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-sm lg:w-[300px]">
      <Image
        src={ILLUSTRATION_SRC}
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 1024px) 300px, 100vw"
        loading="eager"
        className="object-cover"
      />
    </div>

    <div className="flex flex-1 flex-col gap-6">
      <ul className="grid list-none grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
        {REASONS.map(reason => (
          <li key={reason} className="flex items-start gap-2">
            <ListBullet />
            <Paragraph>{reason}</Paragraph>
          </li>
        ))}
      </ul>

      <Paragraph>
        <Link
          href={currentLinks.howDelegationWorks}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 no-underline hover:underline"
        >
          How delegation works
          <ArrowUpRightLightIcon aria-hidden size={20} />
        </Link>
      </Paragraph>
    </div>
  </PersistedCollapsible>
)
