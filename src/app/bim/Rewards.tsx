import { MetricsCard } from '@/components/MetricsCard'
import { useGetRewardDistributedLogs } from './hooks/useGetRewardDistributedLogs'
import { useAccount } from 'wagmi'
import { useGetTokenProjectedReward } from '@/app/bim/hooks/useGetTokenProjectedReward'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Address } from 'viem'
import { Header } from '@/components/Typography'
import { tokenContracts } from '@/lib/contracts'
import { getLastRewardValid } from '@/app/bim/utils/getLastRewardValid'
import { FC } from 'react'

type RewardsProps = {
  builder: Address
}

export const Rewards: FC<RewardsProps> = ({ builder }) => {
  return (
    <>
      <Header variant="h2" className="mb-8">
        As a Builder
      </Header>
      <>
        <Reward builder={builder} rewardToken={tokenContracts.RBTC} />
        <Reward builder={builder} rewardToken={tokenContracts.RIF} />
      </>
    </>
  )
}

type RewardProps = {
  rewardToken: Address
  builder: Address
}

const Reward = ({ rewardToken, builder }: RewardProps) => {
  const { data: rewardDistributedLogs, isLoading: logsLoading } = useGetRewardDistributedLogs(
    rewardToken,
    builder,
  )
  const lastReward = getLastRewardValid(rewardDistributedLogs)
  const lastRewardInHuman = Number(formatBalanceToHuman(lastReward))

  const totalRewards = rewardDistributedLogs.reduce((acc, event) => {
    const amount = event.args.amount_ ?? 0n
    return acc + amount
  }, 0n)
  const totalRewardsInHuman = Number(formatBalanceToHuman(totalRewards))

  const { data: token, isLoading: tokenLoading } = useGetTokenProjectedReward(rewardToken)
  const projectedRewardInHuman = Number(formatBalanceToHuman(token.projectedReward))
  const isLoading = logsLoading || tokenLoading
  const tokenSymbol = token.symbol ?? ''

  return (
    <div className="mb-[32px]">
      <div className="grid grid-cols-4 gap-[8px]">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <MetricsCard title="Total Rewards" amount={`${totalRewardsInHuman} ${tokenSymbol}`} />
        )}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <MetricsCard title="Last Epoch Rewards" amount={`${lastRewardInHuman} ${tokenSymbol}`} />
        )}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <MetricsCard title="Projected Rewards" amount={`${projectedRewardInHuman} ${tokenSymbol}`} />
        )}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <MetricsCard
            title="Performance"
            amount={`${!lastRewardInHuman ? 0 : projectedRewardInHuman / lastRewardInHuman}`}
          />
        )}
      </div>
    </div>
  )
}
