import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Metric, MetricTitle } from '@/components/Metric'
import { TokenAmount } from '@/components/TokenAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { Paragraph } from '@/components/TypographyNew'
import { useBackersEstimatedRewards } from '../hooks/useBackersEstimatedRewards'

export const BackersEstimatedRewards = () => {
  const { rif: rifData, rbtc: rbtcData } = useBackersEstimatedRewards()

  useHandleErrors({
    error: rifData.error ?? rbtcData.error,
    title: 'Error loading backers estimated rewards',
  })

  return (
    <Metric
      title={
        <MetricTitle
          title="Estimated this cycle"
          info={
            <Paragraph className="text-[14px] font-normal text-left">
              Your rewards available to claim
            </Paragraph>
          }
        />
      }
    >
      <div className="flex flex-col gap-2">
        <TokenAmount
          amount={rifData.amount}
          tokenSymbol={TokenSymbol.RIF}
          amountInFiat={rifData.fiatAmount}
        />
        <TokenAmount
          amount={rbtcData.amount}
          tokenSymbol={TokenSymbol.RBTC}
          amountInFiat={rbtcData.fiatAmount}
        />
      </div>
    </Metric>
  )
}
