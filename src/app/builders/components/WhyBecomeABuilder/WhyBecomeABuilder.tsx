'use client'

import Image from 'next/image'
import useLocalStorageState from 'use-local-storage-state'

import { AccentSquare } from '@/components/AccentSquare'
import { CommonComponentProps } from '@/components/commonProps'
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons'
import { Header, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

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

export const WhyBecomeABuilder = ({ className }: CommonComponentProps) => {
  const [isOpen, setIsOpen] = useLocalStorageState<boolean>(WHY_BECOME_A_BUILDER_STORAGE_KEY, {
    defaultValue: true,
  })

  return (
    <section
      data-testid="WhyBecomeABuilder"
      className={cn(
        'flex w-full flex-col gap-6 self-stretch rounded bg-v3-bg-accent-80 px-4 py-6 md:px-6 md:py-8',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <AccentSquare />
          <Header caps variant="h3">
            Why become a builder?
          </Header>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(open => !open)}
          aria-expanded={isOpen}
          className="flex shrink-0 cursor-pointer items-center gap-1 text-v3-text-60 hover:text-v3-text-100"
          data-testid="WhyBecomeABuilderToggle"
        >
          <Span variant="body-s">{isOpen ? 'Hide' : 'Show'}</Span>
          {isOpen ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
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
        </div>
      )}
    </section>
  )
}
