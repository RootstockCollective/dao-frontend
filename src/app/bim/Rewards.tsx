import { useGetRewardDistributedLogs } from './hooks/useGetRewardDistributedLogs'
import { useGetTokenProjectedReward } from '@/app/bim/hooks/useGetTokenProjectedReward'
import { getLastRewardValid } from '@/app/bim/utils/getLastRewardValid'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { Address } from 'viem'
import { Header } from '@/components/Typography'
import { tokenContracts } from '@/lib/contracts'
import { PricesContextProvider, usePricesContext } from '@/shared/context/PricesContext'
import { formatCurrency } from '@/lib/utils'
import { getShare } from '@/app/bim/utils/getShare'
import { MetricsCardWithSpinner } from '@/components/MetricsCard/MetricsCard'
import { useEffect } from 'react'
import { useAlertContext } from '@/app/providers'

type RewardsProps = {
  builder: Address
}

export const Rewards = ({ builder }: RewardsProps) => {
  return (
    <>
      <Header variant="h2" className="mb-8">
        As a Builder
      </Header>
      <PricesContextProvider>
        <Reward builder={builder} rewardToken={tokenContracts.RBTC} />
        <Reward builder={builder} rewardToken={tokenContracts.RIF} />
      </PricesContextProvider>
    </>
  )
}

type RewardProps = {
  rewardToken: Address
  builder: Address
  currency?: string
}

const Reward = ({ rewardToken, builder, currency = 'USD' }: RewardProps) => {
  const { setMessage: setErrorMessage } = useAlertContext()
  const {
    data: rewardDistributedLogs,
    isLoading: logsLoading,
    error: rewardsError,
  } = useGetRewardDistributedLogs(rewardToken, builder)
  const { data: token, isLoading: tokenLoading, error: tokenError } = useGetTokenProjectedReward(rewardToken)
  const tokenSymbol = token.symbol ?? ''

  const { prices } = usePricesContext()
  const price = prices[tokenSymbol]?.price ?? 0

  const lastReward = getLastRewardValid(rewardDistributedLogs)
  const lastRewardInHuman = Number(formatBalanceToHuman(lastReward))

  const totalRewards = rewardDistributedLogs.reduce((acc, event) => {
    const amount = event.args.amount_ ?? 0n
    return acc + amount
  }, 0n)
  const totalRewardsInHuman = Number(formatBalanceToHuman(totalRewards))

  const projectedRewardInHuman = Number(formatBalanceToHuman(token?.projectedReward))

  const formatMetrics = (amount: number, symbol: string) => ({
    amount: `${amount} ${symbol}`,
    fiat: `= ${currency} ${formatCurrency(amount * price, currency)}`,
  })

  const totalRewardsMetrics = formatMetrics(totalRewardsInHuman, tokenSymbol)
  const lastRewardMetrics = formatMetrics(lastRewardInHuman, tokenSymbol)
  const projectedRewardsMetrics = formatMetrics(projectedRewardInHuman, tokenSymbol)
  const share = `${getShare(token)}%`

  const metricsData = [
    { title: 'Total Rewards', ...totalRewardsMetrics },
    { title: 'Last Epoch Rewards', ...lastRewardMetrics },
    { title: 'Projected Rewards', ...projectedRewardsMetrics },
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
      <div className="grid grid-cols-4 gap-[8px]">
        {metricsData.map(({ title, amount, fiat }, index) => (
          <MetricsCardWithSpinner
            key={index}
            title={title}
            amount={amount}
            fiatAmount={fiat}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  )
}
