'use client'

import { useState } from 'react'

import { getCycleRateFromAbi } from '@/app/collective-rewards/shared/hooks/useGetABI'
import { SegmentedControl } from '@/components/SegmentedControl'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { CYCLES_PER_YEAR, RIF, STRIF } from '@/lib/constants'
import { cn, formatNumberWithCommas } from '@/lib/utils'

import { formatUsdWhole } from '../../utils/dashboardFormatters'

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
  /** `null` while it loads. */
  abiPct: number | null
  rifPrice: number
  className?: string
}

/**
 * A what-if that never reads the connected wallet. Annual and per-cycle figures share one
 * per-cycle rate (the inverse of `calculateAbi`), so per-cycle × 26 is intentionally not the
 * annual figure: the ABI compounds.
 */
export const PositionSimulator = ({ abiPct, rifPrice, className }: PositionSimulatorProps) => {
  const [position, setPosition] = useState(DEFAULT_POSITION)

  const cycleRate = getCycleRateFromAbi(abiPct)
  const annualRate = cycleRate === null ? null : Math.pow(1 + cycleRate, CYCLES_PER_YEAR) - 1
  const annualRif = annualRate === null ? null : Big(position).mul(annualRate)
  const perCycleRif = cycleRate === null ? null : Big(position).mul(cycleRate)

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

        <SegmentedControl
          label="Position size"
          className="grid grid-cols-4 gap-2"
          value={String(position)}
          onChange={next => setPosition(Number(next))}
          options={PRESETS.map(({ value, label }) => ({ value: String(value), label }))}
          optionClassName="py-2 rounded-full border bg-transparent border-v3-bg-accent-60 hover:border-v3-bg-accent-40"
          selectedOptionClassName="bg-v3-text-80 border-v3-text-80"
          renderLabel={({ label }, isSelected) => (
            <Span
              variant="body-s"
              className={cn('cursor-[inherit]', isSelected ? 'text-v3-text-0' : 'text-v3-text-40')}
            >
              {label}
            </Span>
          )}
        />
      </div>

      <div className="bg-v3-primary rounded-lg px-4 py-3 flex flex-col gap-0.5">
        <Header variant="h3" className="text-v3-text-0">
          {annualRate === null ? 'ABI —' : `${(annualRate * 100).toFixed(0)}% ABI`}
        </Header>
        <Span variant="body-xs" className="text-v3-text-0/80">
          Estimated
        </Span>
      </div>

      <div className="flex gap-8">
        <Figure
          label="Annual rewards"
          value={annualRif === null ? '—' : `${formatNumberWithCommas(annualRif.round(0))} ${RIF}`}
          sub={annualRif === null ? '—' : formatUsdWhole(annualRif.mul(rifPrice))}
        />
        <Figure
          label="Per cycle"
          value={perCycleRif === null ? '—' : `${formatNumberWithCommas(perCycleRif.round(0))} ${RIF}`}
          sub={`Compounded over ${CYCLES_PER_YEAR} cycles a year`}
        />
      </div>

      <Paragraph variant="body-xs" className="text-v3-text-40">
        Illustrative. Actual rewards depend on total backing, Builder performance and the {RIF} price at
        distribution.
      </Paragraph>
    </div>
  )
}
