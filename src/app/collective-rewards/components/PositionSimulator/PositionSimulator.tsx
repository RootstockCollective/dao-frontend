'use client'

import { useState } from 'react'

import { Header, Label, Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { CYCLES_PER_YEAR, RIF, STRIF } from '@/lib/constants'
import { cn, formatNumberWithCommas } from '@/lib/utils'

import { formatUsdWhole } from '../../utils/dashboardFormatters'

/** Positions a Backer might plausibly hold, spanning three orders of magnitude. */
const PRESETS = [
  { value: 250_000, label: '250K' },
  { value: 1_000_000, label: '1M' },
  { value: 5_000_000, label: '5M' },
  { value: 25_000_000, label: '25M' },
]

const DEFAULT_POSITION = 1_000_000

const Figure = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div className="flex flex-col gap-1 min-w-0">
    <Span variant="body-s" className="text-v3-text-40">
      {label}
    </Span>
    <Header variant="h2" className="text-v3-text-100 truncate">
      {value}
    </Header>
    <Span variant="body-xs" className="text-v3-text-40">
      {sub}
    </Span>
  </div>
)

export interface PositionSimulatorProps {
  /** Annualised backer incentive, as a percentage. */
  abiPct: number
  rifPrice: number
  className?: string
}

/**
 * Projects what a given stRIF position would earn at the current ABI. Deliberately a
 * what-if: it never reads the connected wallet, so the presets mean the same thing to
 * everyone looking at the page.
 */
export const PositionSimulator = ({ abiPct, rifPrice, className }: PositionSimulatorProps) => {
  const [position, setPosition] = useState(DEFAULT_POSITION)

  const annualRif = Big(position).mul(abiPct).div(100)
  const perCycleRif = annualRif.div(CYCLES_PER_YEAR)

  return (
    <div
      className={cn('bg-v3-bg-accent-80 rounded-lg p-5 md:p-6 flex flex-col gap-5', className)}
      data-testid="position-simulator"
    >
      <Label variant="tag-s" caps className="text-v3-text-40 tracking-wider">
        Model a position
      </Label>

      <div className="bg-v3-bg-accent-100 rounded-lg p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Span variant="body-s" className="text-v3-text-40">
            {STRIF} backing power
          </Span>
          <Header variant="h1" className="text-v3-text-100">
            {formatNumberWithCommas(position)}
          </Header>
        </div>

        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Position size">
          {PRESETS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPosition(value)}
              aria-pressed={position === value}
              className={cn(
                'py-2 rounded-full border transition-colors cursor-pointer',
                position === value
                  ? 'bg-v3-text-80 border-v3-text-80'
                  : 'bg-transparent border-v3-bg-accent-60 hover:border-v3-bg-accent-40',
              )}
            >
              <Span
                variant="body-s"
                className={cn('cursor-[inherit]', position === value ? 'text-v3-text-0' : 'text-v3-text-40')}
              >
                {label}
              </Span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-v3-primary rounded-lg px-4 py-3 flex flex-col gap-0.5">
        <Header variant="h3" className="text-v3-text-0">
          {abiPct.toFixed(0)}% ABI
        </Header>
        <Span variant="body-xs" className="text-v3-text-0/80">
          Estimated
        </Span>
      </div>

      <div className="flex gap-8">
        <Figure
          label="Annual rewards"
          value={`${formatNumberWithCommas(annualRif.round(0))} ${RIF}`}
          sub={formatUsdWhole(annualRif.mul(rifPrice))}
        />
        <Figure
          label="Per cycle"
          value={`${formatNumberWithCommas(perCycleRif.round(0))} ${RIF}`}
          sub={`${CYCLES_PER_YEAR} cycles a year`}
        />
      </div>

      <Paragraph variant="body-xs" className="text-v3-text-40">
        Illustrative. Actual rewards depend on total backing, Builder performance and the {RIF} price at
        distribution.
      </Paragraph>
    </div>
  )
}
