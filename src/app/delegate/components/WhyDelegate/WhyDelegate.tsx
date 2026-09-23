'use client'

import Image from 'next/image'
import { useId, useState } from 'react'

import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'

const ILLUSTRATION_SRC = '/images/hero/delegation-banner.png'

/** TODO: swap for a delegation-specific article once there is one; the FAQ covers it for now. */
const HOW_DELEGATION_WORKS_URL =
  'https://wiki.rootstockcollective.xyz/RootstockCollective-FAQ-1031ca6b0b02808c95d3dcb5a0074f4b'

const REASONS = [
  'You are only delegating your own voting power',
  'Your coins stay in your wallet',
  'You save on gas cost while being represented',
  'Your Rewards will keep accumulating as usual',
]

const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="M3 5.5L8 10.5L13 5.5" />
  </svg>
)

const Check = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    stroke="#f7931a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="shrink-0"
  >
    <path d="M2.5 8.5L6.5 12.5L13.5 4" />
  </svg>
)

export const WhyDelegate = ({ className }: CommonComponentProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const contentId = useId()

  return (
    <section
      data-testid="WhyDelegate"
      className={cn(
        'mt-7 w-full self-stretch overflow-hidden rounded-xl border border-[rgba(228,225,218,0.12)] bg-[#16130f]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="flex min-h-[72px] w-full cursor-pointer items-center gap-4 px-5 py-3 text-left outline-none transition-colors duration-150 hover:bg-[#1c1815] focus-visible:shadow-[inset_0_0_0_2px_#4b5cf0] md:h-[72px] md:py-0"
        data-testid="WhyDelegateToggle"
      >
        <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md">
          <Image
            src={ILLUSTRATION_SRC}
            alt=""
            aria-hidden="true"
            fill
            sizes="56px"
            className="object-cover object-[60%_40%]"
          />
        </span>

        <span className="font-kk-topo min-w-0 flex-1 text-lg uppercase leading-[1.15] tracking-[0.005em] text-[#e4e1da]">
          Delegate your voting power <span className="text-[#938a80]">to influence what gets built</span>
        </span>

        <span className="flex shrink-0 items-center gap-3 text-[13px] text-[#bbb2a7]">
          <span className="hidden sm:inline">{isOpen ? 'Hide' : 'Why delegate'}</span>
          <ChevronDown className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
        </span>
      </button>

      {isOpen && (
        <div
          id={contentId}
          className="flex flex-wrap items-center gap-8 border-t border-[rgba(228,225,218,0.08)] px-5 pb-[22px] pt-6"
        >
          <div className="relative aspect-[380/207] w-[380px] max-w-full shrink-0 overflow-hidden rounded-lg">
            <Image
              src={ILLUSTRATION_SRC}
              alt=""
              aria-hidden="true"
              fill
              sizes="380px"
              className="object-cover object-center"
            />
          </div>

          <div className="flex min-w-[260px] flex-1 flex-col gap-[18px]">
            <ul className="flex list-none flex-col gap-3.5">
              {REASONS.map(reason => (
                <li
                  key={reason}
                  className="font-rootstock-sans flex items-center gap-4 text-[15px] leading-[1.35] text-[#d2ccc3]"
                >
                  <Check />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>

            <a
              href={HOW_DELEGATION_WORKS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-rootstock-sans self-start border-b border-[rgba(228,225,218,0.7)] pb-px text-sm text-[#e4e1da] hover:border-v3-primary hover:text-v3-primary"
            >
              How delegation works
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
