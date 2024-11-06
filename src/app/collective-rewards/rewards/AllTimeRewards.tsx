import {
  formatMetrics,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
  useGetBuilderRewards,
  useGetBuilderRewardsClaimedLogs,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC } from 'react'
import { Address } from 'viem'

type Token = {
  symbol: string
  address: Address
}

type TokenRewardsMetricsProps = {
  gauge: Address
  currency?: string
  token: {
    symbol: string
    address: Address
  }
}

const TokenRewardsMetrics: FC<TokenRewardsMetricsProps> = ({
  gauge,
  token: { symbol, address },
  currency = 'USD',
}) => {
  const {
    data: rewardsPerToken,
    isLoading: logsLoading,
    error: rewardsError,
  } = useGetBuilderRewardsClaimedLogs(gauge)
  const {
    data: claimableRewards,
    isLoading: claimableRewardsLoading,
    error: claimableRewardsError,
  } = useGetBuilderRewards(address, gauge)

  const error = rewardsError ?? claimableRewardsError
  useHandleErrors({ error, title: 'Error loading all time rewards' })

  const { prices } = usePricesContext()

  const totalClaimedRewards =
    rewardsPerToken[address]?.reduce((acc, event) => {
      const amount = event.args.amount_ ?? 0n
      return acc + amount
    }, 0n) ?? 0n

  const totalRewards = totalClaimedRewards + (claimableRewards ?? 0n)
  const totalRewardsInHuman = Number(formatBalanceToHuman(totalRewards))
  const price = prices[symbol]?.price ?? 0

  const { amount, fiatAmount } = formatMetrics(totalRewardsInHuman, price, symbol, currency)

  return withSpinner(TokenMetricsCardRow)({
    amount,
    fiatAmount,
    isLoading: logsLoading || claimableRewardsLoading,
  })
}

type AllTimeRewardsProps = {
  gauge: Address
  currency?: string
  data: {
    [token: string]: Token
  }
}

export const AllTimeRewards: FC<AllTimeRewardsProps> = ({ data: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="All time rewards" data-testid="AllTimeRewards" />
      <TokenRewardsMetrics {...rest} token={rif} />
      <TokenRewardsMetrics {...rest} token={rbtc} />
    </MetricsCard>
  )
}
