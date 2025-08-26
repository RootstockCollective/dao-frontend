import { Metric } from '@/components/Metric'
import { TokenSymbol } from '@/components/TokenImage'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography/Paragraph'
import { BaseTypography } from '@/components/Typography/Typography'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { Span } from '@/components/Typography/Span'
import { TooltipPayload } from '@/app/collective-rewards/types'

interface CollectiveRewardsChartTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string | number
  cycle?: number
  day?: string
}

export const CollectiveRewardsChartTooltipContent = ({
  active,
  payload,
  label,
  cycle = 21,
  day = '5/12',
}: CollectiveRewardsChartTooltipProps) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload?.day as Date
  const backingVal = payload[0]?.payload?.backing ?? 0n
  const rewardsUsd = payload[0]?.payload?.rewardsUSD ?? 0n

  return (
    <div className="p-4 bg-text-80 shadow-xl rounded flex flex-col gap-2">
      <BaseTypography variant="body-xs" className="text-bg-100">
        {d instanceof Date
          ? d
              .toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              .toUpperCase()
          : String(label)}
      </BaseTypography>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-6">
          <Metric
            title={
              <BaseTypography variant="tag" className="text-bg-40">
                Cycle
              </BaseTypography>
            }
            className="w-auto text-bg-40"
            containerClassName="gap-1"
          >
            <Paragraph className="font-kk-topo text-bg-100 text-xl">{cycle}</Paragraph>
          </Metric>
          <Metric
            title={
              <BaseTypography variant="tag" className="text-bg-40">
                Day
              </BaseTypography>
            }
            className="w-auto text-bg-40"
            containerClassName="gap-1"
          >
            <Paragraph className="font-kk-topo text-bg-100 text-xl">{day}</Paragraph>
          </Metric>
          <Metric
            title={
              <BaseTypography variant="tag" className="text-bg-40">
                Total Backing
              </BaseTypography>
            }
            className="w-auto text-bg-40 whitespace-nowrap"
            containerClassName="gap-1"
          >
            <div className="flex items-center gap-2 text-bg-100">
              <Paragraph className="text-xl font-kk-topo">{formatSymbol(backingVal, 'StRIF')}</Paragraph>
              <TokenImage symbol={TokenSymbol.STRIF} size={16} />
              <Span variant="tag-s" className="">
                {TokenSymbol.STRIF}
              </Span>
            </div>
          </Metric>
        </div>

        <Metric
          title={
            <BaseTypography variant="tag" className="text-bg-40">
              Rewards distributed this cycle
            </BaseTypography>
          }
          className="w-auto text-bg-40 whitespace-nowrap"
          containerClassName="gap-1"
        >
          <div className="flex items-end gap-2 text-bg-100">
            <Paragraph className="text-xl font-kk-topo">{formatSymbol(rewardsUsd, 'USD')}</Paragraph>
            <Span variant="tag-s" className="font-bold mb-0.5">
              USD
            </Span>
          </div>
        </Metric>
      </div>
    </div>
  )
}
