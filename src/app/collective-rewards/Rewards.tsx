import { useGetRewardDistributedLogs } from './hooks/useGetRewardDistributedLogs'
import { useGetTokenProjectedReward } from '@/app/collective-rewards/hooks/useGetTokenProjectedReward'
import { getLastCycleRewards } from '@/app/collective-rewards/utils/getLastCycleRewards'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { Address } from 'viem'
import { HeaderTitle } from '@/components/Typography'
import { tokenContracts } from '@/lib/contracts'
import { PricesContextProvider, usePricesContext } from '@/shared/context/PricesContext'
import { formatCurrency, toFixed } from '@/lib/utils'
import { getShare } from '@/app/collective-rewards/utils/getShare'
import { MetricsCardWithSpinner } from '@/components/MetricsCard/MetricsCard'
import { useEffect } from 'react'
import { useAlertContext } from '@/app/providers'

type RewardsProps = {
  builder: Address
}

export const Rewards = ({ builder }: RewardsProps) => {
  return (
    <>
      <HeaderTitle className="mb-8 font-normal">As a Builder</HeaderTitle>
      <PricesContextProvider>
        <Reward builder={builder} rewardToken={tokenContracts.RBTC} rewardTokenSymbol="RBTC" />
        <Reward builder={builder} rewardToken={tokenContracts.RIF} rewardTokenSymbol="RIF" />
      </PricesContextProvider>
    </>
  )
}

type RewardProps = {
  rewardToken: Address
  rewardTokenSymbol?: string
  builder: Address
  currency?: string
}

const Reward = ({ rewardToken, rewardTokenSymbol, builder, currency = 'USD' }: RewardProps) => {
  const { setMessage: setErrorMessage } = useAlertContext()
  const {
    data: rewardDistributedLogs,
    isLoading: logsLoading,
    error: rewardsError,
  } = useGetRewardDistributedLogs(rewardToken, builder)
  const { data: token, isLoading: tokenLoading, error: tokenError } = useGetTokenProjectedReward(rewardToken)
  const tokenSymbol = rewardTokenSymbol ?? token.symbol ?? ''

  const { prices } = usePricesContext()
  const price = prices[tokenSymbol]?.price ?? 0

  const lastCycleRewards = getLastCycleRewards(rewardDistributedLogs)
  const lastCycleRewardsInHuman = Number(formatBalanceToHuman(lastCycleRewards))

  const totalRewards = rewardDistributedLogs.reduce((acc, event) => {
    const amount = event.args.amount_ ?? 0n
    return acc + amount
  }, 0n)
  const totalRewardsInHuman = Number(formatBalanceToHuman(totalRewards))

  const projectedRewardInHuman = Number(formatBalanceToHuman(token?.projectedReward))

  const formatMetrics = (amount: number, symbol: string) => ({
    amount: `${toFixed(amount)} ${symbol}`,
    fiat: `= ${currency} ${formatCurrency(amount * price, currency)}`,
  })

  const totalRewardsMetrics = formatMetrics(totalRewardsInHuman, tokenSymbol)
  const lastCycleRewardsMetrics = formatMetrics(lastCycleRewardsInHuman, tokenSymbol)
  const projectedRewardsMetrics = formatMetrics(projectedRewardInHuman, tokenSymbol)
  const share = `${getShare(token)}%`

  const metricsData = [
    { title: 'Total rewards', ...totalRewardsMetrics },
    { title: 'Last cycle rewards', ...lastCycleRewardsMetrics },
    { title: 'Projected rewards', ...projectedRewardsMetrics },
    { title: 'Share', amount: share, fiat: '' },
  ]

  const isLoading = logsLoading || tokenLoading

  useEffect(() => {
    if (rewardsError) {
      setErrorMessage({
        severity: 'error',
        title: 'Error loading rewards',
        content: rewardsError.message,
      })
      console.error('🐛 rewardsError:', rewardsError)
    }

    if (tokenError) {
      setErrorMessage({
        severity: 'error',
        title: 'Error loading tokens',
        content: tokenError.message,
      })
      console.error('🐛 tokenError:', tokenError)
    }
  }, [rewardsError, tokenError, setErrorMessage])

  return (
    <div className="mb-[32px]">
      <div className="grid grid-cols-4 gap-[16px] ">
        {metricsData.map(({ title, amount, fiat }, index) => (
          <MetricsCardWithSpinner
            key={index}
            title={title}
            amount={amount}
            fiatAmount={fiat}
            isLoading={isLoading}
            borderless
          />
        ))}
      </div>
    </div>
  )
}
