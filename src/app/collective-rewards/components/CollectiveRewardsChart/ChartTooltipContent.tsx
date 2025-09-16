import { Metric } from '@/components/Metric'
import { TokenSymbol } from '@/components/TokenImage'
import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography/Span'
import { Label } from '@/components/Typography/Label'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { TooltipPayload } from '@/app/collective-rewards/types'
import { formatCurrency } from '@/lib/utils'
import { ONE_DAY_IN_MS } from '../../constants/chartConstants'
import { Header } from '@/components/Typography'
import { USD } from '@/lib/constants'

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string | number
}

export const ChartTooltipContent = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null

  const d = payload[0]?.payload?.day as Date
  const backingVal = payload[0]?.payload?.backingWei ?? payload[0]?.payload?.backing ?? 0n
  const rewardsUsd = payload[0]?.payload?.rewardsUSD ?? 0n

  const cycleNumber = payload[0]?.payload?.cycle ?? 'N/A'
  const dayInCycle = payload[0]?.payload?.dayInCycle ?? 'N/A'

  // Add one day to align tooltip date with actual data dates
  const displayDate = new Date(d.getTime() + ONE_DAY_IN_MS)

  return (
    <div className="p-4 bg-text-80 shadow-xl rounded flex flex-col gap-2">
      <Span variant="body-xs" className="text-bg-100">
        {displayDate instanceof Date
          ? displayDate
              .toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              .toUpperCase()
          : String(label)}
      </Span>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-6">
          <Metric
            title={
              <Label variant="tag" className="text-bg-40">
                Cycle
              </Label>
            }
            className="w-auto text-bg-40"
            containerClassName="gap-1"
          >
            <Header variant="h3" className="text-bg-100">
              {cycleNumber}
            </Header>
          </Metric>

          <Metric
            title={
              <Label variant="tag" className="text-bg-40">
                Day
              </Label>
            }
            className="w-auto text-bg-40"
            containerClassName="gap-1"
          >
            <Header variant="h3" className="text-bg-100">
              {dayInCycle}
            </Header>
          </Metric>

          <div className="flex items-start gap-2">
            <div className="size-3 mt-1.5 rounded-full bg-v3-rif-blue" />
            <Metric
              title={
                <Label variant="tag" className="text-bg-40">
                  Total Backing
                </Label>
              }
              className="w-auto text-bg-40 whitespace-nowrap"
              containerClassName="gap-1"
            >
              <div className="flex items-center gap-2 text-bg-100">
                <Header variant="h3">{formatSymbol(backingVal, TokenSymbol.STRIF)}</Header>
                <TokenImage symbol={TokenSymbol.STRIF} size={16} />
                <Span variant="tag-s">{TokenSymbol.STRIF}</Span>
              </div>
            </Metric>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="size-3 rounded-full mt-1.5 bg-brand-rootstock-lime border-[1px] border-bg-100" />
          <Metric
            title={
              <Label variant="tag" className="text-bg-40">
                Rewards distributed this cycle
              </Label>
            }
            className="w-auto text-bg-40 whitespace-nowrap"
            containerClassName="gap-1"
          >
            <div className="flex items-end gap-2 text-bg-100">
              <Header variant="h3">{formatCurrency(rewardsUsd.toString())}</Header>
              <Span variant="tag" bold>
                {USD}
              </Span>
            </div>
          </Metric>
        </div>
      </div>
    </div>
  )
}
