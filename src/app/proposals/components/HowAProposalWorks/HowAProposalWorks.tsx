'use client'

import Image from 'next/image'
import { ReactNode } from 'react'
import useLocalStorageState from 'use-local-storage-state'

import { CommonComponentProps } from '@/components/commonProps'
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons'
import { Header, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { DiscourseLink } from '../DiscourseLink'

export const HOW_A_PROPOSAL_WORKS_STORAGE_KEY = 'proposals-how-it-works-open'

const ILLUSTRATION_SRC = '/images/hero/proposals-banner.png'

const STEPS: ReactNode[] = [
  <>
    Clarify your project&apos;s purpose on <DiscourseLink>Discourse</DiscourseLink>
  </>,
  'Submit a proposal to suggest a change or fund a project',
  'The community will view and discuss it',
  'The community will use their stRIF or delegated power to vote',
  'If your proposal passes quorum, it will be approved',
  'Complete your KYC to ensure eligibility (apply for Grants)',
]

const Bullet = () => (
  <span className="mt-2 inline-block h-[6px] w-[6px] shrink-0 rounded-full border border-v3-text-60" />
)

export const HowAProposalWorks = ({ className }: CommonComponentProps) => {
  const [isOpen, setIsOpen] = useLocalStorageState<boolean>(HOW_A_PROPOSAL_WORKS_STORAGE_KEY, {
    defaultValue: true,
  })

  return (
    <section
      data-testid="HowAProposalWorks"
      className={cn(
        'flex w-full flex-col gap-6 self-stretch rounded bg-v3-bg-accent-80 px-4 py-6 md:px-6 md:py-8',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <Header caps variant="h3">
          How a proposal works
        </Header>
        <button
          type="button"
          onClick={() => setIsOpen(open => !open)}
          aria-expanded={isOpen}
          className="flex shrink-0 cursor-pointer items-center gap-1 text-v3-text-60 hover:text-v3-text-100"
          data-testid="HowAProposalWorksToggle"
        >
          <Span variant="body-s">{isOpen ? 'Hide' : 'Show'}</Span>
          {isOpen ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-sm lg:h-[180px] lg:w-[230px]">
            <Image
              src={ILLUSTRATION_SRC}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1024px) 230px, 100vw"
              className="object-cover"
            />
          </div>

          <ul className="grid flex-1 list-none grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <Bullet />
                {typeof step === 'string' ? <Paragraph>{step}</Paragraph> : <Paragraph>{step}</Paragraph>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
