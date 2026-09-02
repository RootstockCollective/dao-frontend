import { ABIFormula } from '@/app/backing/components/ABIFormula'
import { InfoIconButton } from '@/components/IconButton/InfoIconButton'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { cn } from '@/lib/utils'

import { SPOT_PRICE_NOTE } from '../../constants/dashboardCopy'
import { CARD_RADIUS } from '../../constants/dashboardSurface'
import { formatUsdWhole } from '../../utils/dashboardFormatters'

const ABI_INFO = (
  <Paragraph className="text-sm font-normal text-left">
    The Annual Backers Incentives (%) represents an estimate of the annualized percentage of rewards that
    backers could receive based on their backing allocations.
    <br />
    <br />
    The calculation follows the formula:
    <span className="flex justify-center pt-4">
      <ABIFormula />
    </span>
    <br />
    <br />
    This estimation is dynamic and may vary based on total rewards and user activity. This data is for
    informational purposes only.
  </Paragraph>
)

const Figure = ({ label, value, note }: { label: string; value: string; note?: string }) => (
  <div className="flex flex-col gap-1 min-w-0">
    <div className="flex items-center gap-1">
      <Label variant="tag-s" caps className="text-v3-text-60 tracking-wider">
        {label}
      </Label>
      {note && <InfoIconButton info={<Paragraph className="text-sm">{note}</Paragraph>} />}
    </div>
    <Paragraph className="text-v3-text-100 truncate">{value}</Paragraph>
  </div>
)

export interface AbiHeroCardProps {
  /** Annualised backer incentive, as a percentage. */
  abiPct: number
  /** Distributed in the cycle the page is describing. */
  paidInCycle: Big
  /** Distributed to date. `null` while the reward events are still loading. */
  paidAllTime: Big | null
  /** Names the cycle, since it follows the page's selection rather than always being "this". */
  paidInCycleLabel?: string
  isLoading?: boolean
  className?: string
}

export const AbiHeroCard = ({
  abiPct,
  paidInCycle,
  paidAllTime,
  paidInCycleLabel = 'Paid this cycle',
  isLoading = false,
  className,
}: AbiHeroCardProps) => (
  <div
    className={cn(
      'relative overflow-hidden border border-v3-primary/50 bg-v3-bg-accent-100',
      CARD_RADIUS,
      'p-5 md:p-6 flex flex-col justify-between gap-8 min-w-0',
      className,
    )}
    data-testid="abi-hero-card"
  >
    {/* Warm wash anchored bottom-left, matching the design's light source. */}
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(120% 120% at 15% 90%, rgba(247,147,25,0.55) 0%, rgba(247,147,25,0.14) 45%, transparent 75%)',
      }}
    />

    <div className="relative flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <Label variant="tag-s" caps className="text-v3-text-60 tracking-wider">
          Annual Backers Incentive
        </Label>
        <InfoIconButton info={ABI_INFO} className="cursor-pointer" tooltipClassName="max-w-sm text-sm" />
      </div>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <Header variant="e1" className="text-v3-text-100">
          {isLoading ? (
            <LoadingSpinner size="small" />
          ) : Number.isFinite(abiPct) ? (
            `${abiPct.toFixed(0)}%`
          ) : (
            '—'
          )}
        </Header>
        <Span variant="body-s" className="text-v3-text-60">
          estimated
        </Span>
      </div>
    </div>

    <div className="relative flex gap-8">
      <Figure label={paidInCycleLabel} value={formatUsdWhole(paidInCycle)} />
      <Figure
        label="All-time"
        value={paidAllTime === null ? '—' : formatUsdWhole(paidAllTime)}
        note={SPOT_PRICE_NOTE}
      />
    </div>
  </div>
)
