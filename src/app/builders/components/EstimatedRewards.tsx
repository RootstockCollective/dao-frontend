import { getFiatAmount, useHandleErrors } from '@/app/collective-rewards/utils'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { Header } from '@/components/TypographyNew'
import { formatCurrency } from '@/lib/utils'
import Big from 'big.js'

export const USDWithTokensRewards = ({ usd, rif, rbtc }: { usd: Big; rif: bigint; rbtc: bigint }) => (
  <div className="flex flex-row items-baseline gap-2 font-rootstock-sans">
    <Header variant="h1">{formatCurrency(usd)}</Header>
    <RifRbtcTooltip rbtcValue={rbtc} rifValue={rif}>
      <DottedUnderlineLabel className="text-lg">USD</DottedUnderlineLabel>
    </RifRbtcTooltip>
  </div>
)

export const EstimatedRewards = () => {
  const {
    data: builderEstimatedRewards,
    isLoading: builderEstimatedRewardsLoading,
    error: builderEstimatedRewardsError,
  } = useGetBuilderEstimatedRewards()

  useHandleErrors({ error: builderEstimatedRewardsError, title: 'Error loading CTA section' })

  const {
    rifBackerRewards,
    rbtcBackerRewards,
    usdBackerRewards,
    rifBuilderRewards,
    rbtcBuilderRewards,
    usdBuilderRewards,
  } = builderEstimatedRewards.reduce(
    (acc, builder) => {
      return {
        rifBackerRewards: acc.rifBackerRewards + builder.backerEstimatedRewards.rif.amount.value,
        rbtcBackerRewards: acc.rbtcBackerRewards + builder.backerEstimatedRewards.rbtc.amount.value,
        usdBackerRewards: acc.usdBackerRewards
          .add(getFiatAmount(builder.backerEstimatedRewards.rif.amount))
          .add(getFiatAmount(builder.backerEstimatedRewards.rbtc.amount)),
        rifBuilderRewards: acc.rifBuilderRewards + builder.builderEstimatedRewards.rif.amount.value,
        rbtcBuilderRewards: acc.rbtcBuilderRewards + builder.builderEstimatedRewards.rbtc.amount.value,
        usdBuilderRewards: acc.usdBuilderRewards
          .add(getFiatAmount(builder.builderEstimatedRewards.rif.amount))
          .add(getFiatAmount(builder.builderEstimatedRewards.rbtc.amount)),
      }
    },
    {
      rifBackerRewards: 0n,
      rbtcBackerRewards: 0n,
      usdBackerRewards: Big(0),
      rifBuilderRewards: 0n,
      rbtcBuilderRewards: 0n,
      usdBuilderRewards: Big(0),
    },
  )
  return (
    <>
      {builderEstimatedRewardsLoading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <Metric title="Estimated Rewards for Builders">
          <USDWithTokensRewards usd={usdBuilderRewards} rif={rifBuilderRewards} rbtc={rbtcBuilderRewards} />
        </Metric>
      )}
      {builderEstimatedRewardsLoading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <Metric title="Estimated Rewards for Backers">
          <USDWithTokensRewards usd={usdBackerRewards} rif={rifBackerRewards} rbtc={rbtcBackerRewards} />
        </Metric>
      )}
    </>
  )
}
