import { ABIFormula } from '@/app/backing/components/ABIFormula'
import { InfoIconButton } from '@/components/IconButton/InfoIconButton'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { cn } from '@/lib/utils'

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

const Figure = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 min-w-0">
    <Label variant="tag-s" caps className="text-v3-text-60 tracking-wider">
      {label}
    </Label>
    <Paragraph className="text-v3-text-100 truncate">{value}</Paragraph>
  </div>
)

export interface AbiHeroCardProps {
  /** Annualised backer incentive, as a percentage. */
  abiPct: number
  /** Distributed so far in the running cycle. */
  paidThisCycle: Big
  /** Distributed across every cycle to date. */
  paidAllTime: Big
  isLoading?: boolean
  className?: string
}

export const AbiHeroCard = ({
  abiPct,
  paidThisCycle,
  paidAllTime,
  isLoading = false,
  className,
}: AbiHeroCardProps) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-lg border border-v3-primary/50 bg-v3-bg-accent-100',
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
          {isLoading ? <LoadingSpinner size="small" /> : `${abiPct.toFixed(0)}%`}
        </Header>
        <Span variant="body-s" className="text-v3-text-60">
          estimated
        </Span>
      </div>
    </div>

    <div className="relative flex gap-8">
      <Figure label="Paid this cycle" value={formatUsdWhole(paidThisCycle)} />
      <Figure label="All-time" value={formatUsdWhole(paidAllTime)} />
    </div>
  </div>
)
