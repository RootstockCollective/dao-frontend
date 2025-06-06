import { HeaderTitle, Typography } from '@/components/Typography'
import { MetricsCard } from '@/components/MetricsCard'
import { useStRifHoldings } from './hooks/useStRifHoldings'
import { formatNumberWithCommas } from '@/lib/utils/utils'
import { Popover } from '@/components/Popover'
import { QuestionIcon } from '@/components/Icons'

/**
 * Displays key treasury metrics including total stRIF, treasury balance,
 * and total value locked (TVL) in USD.
 */
export const MetricsSection = () => {
  const { stRifBalance, stRifUsdBalance, totalFundingUsd, tvlUsd } = useStRifHoldings()
  return (
    <div>
      <HeaderTitle className="mb-4">Metrics</HeaderTitle>
      <div className="flex flex-row gap-4">
        <MetricsCard
          className="max-w-[214px] min-w-[120px]"
          title={<Typography className="text-sm font-bold">Total stRIF</Typography>}
          amount={`${formatNumberWithCommas(stRifBalance)} STRIF`}
          fiatAmount={`= USD $${formatNumberWithCommas(stRifUsdBalance)}`}
          borderless
        />
        <MetricsCard
          className="max-w-[214px] min-w-[120px]"
          title={<Typography className="text-sm font-bold">Treasury</Typography>}
          amount={`${formatNumberWithCommas(totalFundingUsd)} USD`}
          borderless
        />
        <MetricsCard
          className="max-w-[444px] min-w-[120px] overflow-visible"
          title={
            <div className="flex flex-row gap-2">
              <Typography tagVariant="span" className="text-sm font-bold">
                TVL{' '}
              </Typography>
              <Popover
                contentContainerClassName="w-max"
                trigger="hover"
                content={
                  <div>
                    <Typography className="">Total value locked</Typography>
                    <Typography className="text-sm">(Total stRIF + Treasury)</Typography>
                  </div>
                }
              >
                <QuestionIcon className="ml-1 hover:cursor-help" />
              </Popover>
            </div>
          }
          amount={`${formatNumberWithCommas(tvlUsd)} USD`}
          borderless
        />
      </div>
    </div>
  )
}
