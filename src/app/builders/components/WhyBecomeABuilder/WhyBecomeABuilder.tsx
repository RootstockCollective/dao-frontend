'use client'

import Image from 'next/image'

import { AccentSquare } from '@/components/AccentSquare'
import { CommonComponentProps } from '@/components/commonProps'
import { PersistedCollapsible } from '@/components/PersistedCollapsible'
import { Header, Paragraph } from '@/components/Typography'

export const WHY_BECOME_A_BUILDER_STORAGE_KEY = 'builders-why-become-open'

const ILLUSTRATION_SRC = '/images/why-become-a-builder.webp'

const PERKS = [
  {
    title: 'Network',
    description: 'Join a mission-aligned network of builders shipping on Rootstock.',
  },
  {
    title: 'Rewards',
    description: 'Earn performance-based rewards every cycle you stay active.',
  },
  {
    title: 'Grants',
    description: 'Access grants to kickstart your project before revenue.',
  },
]

export const WhyBecomeABuilder = ({ className }: CommonComponentProps) => (
  <PersistedCollapsible
    storageKey={WHY_BECOME_A_BUILDER_STORAGE_KEY}
    data-testid="WhyBecomeABuilder"
    toggleTestId="WhyBecomeABuilderToggle"
    className={className}
    bodyClassName="flex flex-col gap-6 lg:flex-row lg:gap-10"
    heading={
      <div className="flex items-center gap-3">
        <AccentSquare />
        <Header caps variant="h3">
          Why become a builder?
        </Header>
      </div>
    }
  >
    <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-sm lg:h-[260px] lg:w-[300px]">
      <Image
        src={ILLUSTRATION_SRC}
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 1024px) 300px, 100vw"
        className="object-cover"
      />
    </div>

    <ul className="grid flex-1 list-none grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
      {PERKS.map(({ title, description }) => (
        <li key={title} className="flex flex-col gap-2">
          <Header caps variant="h5">
            {title}
          </Header>
          <Paragraph>{description}</Paragraph>
        </li>
      ))}
    </ul>
  </PersistedCollapsible>
)
