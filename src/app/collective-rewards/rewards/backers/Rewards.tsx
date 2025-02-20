import { BackerRewardsCard, MetricsCard, RewardDetails, Tooltip } from '@/app/collective-rewards/rewards'
import {
  ABIBackers,
  BackerClaimableRewards,
  useBackerRewardsContext,
  useClaimBackerRewards,
} from '@/app/collective-rewards/rewards/backers'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { BoltSvg } from '@/components/BoltSvg'
import { Button } from '@/components/Button'
import { GlowingLabel } from '@/components/Label/GlowingLabel'
import { Typography } from '@/components/Typography/Typography'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { RewardsCardProps, TokenRewardsMetrics } from './RewardsCard'

const estimatedRewardsTooltipData: RewardsCardProps['titleDetails']['tooltip'] = {
  text: (
    <>
      <Typography>
        An estimate of the remainder of this Cycle&apos;s rewards that will become fully claimable by the end
        of the current Cycle. These rewards gradually transition into your &apos;Claimable Rewards&apos; as
        the cycle progresses.
      </Typography>
      <Typography marginTop="1rem" marginBottom="1rem">
        To check the cycle&apos;s completion, go to Collective Rewards → Current Cycle.
      </Typography>
      <Typography>
        The displayed information is dynamic and may vary based on total rewards and user activity. This data
        is for informational purposes only.
      </Typography>
    </>
  ),
  popoverProps: { size: 'medium' },
}

const estimatedRewardsTitleData: RewardsCardProps['titleDetails'] = {
  'data-testid': 'EstimatedRewards',
  title: 'Estimated rewards',
  tooltip: estimatedRewardsTooltipData,
}

export const BoostedRewardsCard: FC<RewardsCardProps['rewardDetails']> = ({
  tokens: { rif, rbtc },
  ...rest
}) => (
  <MetricsCard
    borderless
    dataTestId="EstimatedRewards"
    className="mb-[46px] flex flex-col flex-none w-[214px] order-2"
    style={{
      boxShadow: '0px 0px 8.1px 0px rgba(192, 247, 255, 255)',
    }}
  >
    <div className="flex flex-nowrap gap-1 justify-between items-center">
      <GlowingLabel
        faded
        showGlow
        className={cn('normal-case font-bold font-rootstock-sans leading-none text-nowrap')}
        data-testid={'EstimatedRewards_MetricsCardTitle'}
      >
        {estimatedRewardsTitleData.title}
      </GlowingLabel>
      <div className="flex items-center gap-0">
        <Tooltip {...estimatedRewardsTooltipData} />
        <BoltSvg showGlow />
      </div>
    </div>
    <TokenRewardsMetrics {...rest} token={rif} />
    <TokenRewardsMetrics {...rest} token={rbtc} />
  </MetricsCard>
)

// FIXME: change type to match the domain (no builder in backer rewards)
type RewardsProps = RewardDetails
export const Rewards: FC<RewardsProps> = ({ builder, tokens }) => {
  const { claimRewards, isClaimable } = useClaimBackerRewards()
  const {
    detailedView: { value: isDetailedView },
  } = useBackerRewardsContext()

  const { isBoosted } = useNFTBoosterContext()

  return (
    <>
      <div className="flex gap-4 w-full ">
        <div
          data-testid="metric_with_button"
          className="flex flex-none flex-col justify-between gap-2 w-[214px] order-1"
        >
          <BackerClaimableRewards tokenRewardsMetrics={{ tokens }} className="w-full h-full" />
          <Button
            className="h-[38px] w-full"
            onClick={() => claimRewards()}
            disabled={!isClaimable}
            variant="primary"
          >
            Claim all
          </Button>
        </div>
        {isBoosted ? (
          <BoostedRewardsCard tokens={tokens} rewards={['estimated']} />
        ) : (
          <BackerRewardsCard
            className="order-2"
            rewardDetails={{
              rewards: ['estimated'],
              tokens,
            }}
            titleDetails={estimatedRewardsTitleData}
          />
        )}
        <BackerRewardsCard
          className={cn(
            'flex flex-col flex-none w-[214px] mb-[46px]',
            isDetailedView ? 'order-3' : 'order-4 opacity-0 pointer-events-none',
          )}
          dataTestId="AllTimeRewards"
          titleDetails={{
            title: 'All time rewards',
            tooltip: {
              text: 'Total of your received and claimable rewards',
              popoverProps: { size: 'medium' },
            },
          }}
          rewardDetails={{
            rewards: ['earned', 'claimed'],
            tokens,
          }}
        />
        <ABIBackers
          backer={builder}
          className={cn(
            'flex flex-col flex-none mb-[46px] w-[214px]',
            isDetailedView ? 'order-4' : 'order-3',
          )}
        />
        {/* 
      // Removed until RBI% is introduced (TOK-610)
        <BackerAllTimeShare gauges={gauges} tokens={tokens} />
      */}
      </div>
    </>
  )
}
