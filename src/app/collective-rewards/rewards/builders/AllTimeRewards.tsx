import {
  BuilderRewardDetails,
  formatMetrics,
  MetricsCard,
  MetricsCardTitle,
  Token,
  TokenMetricsCardRow,
  useGetBuilderRewardsClaimedLogs,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { FC } from 'react'
import { Address } from 'viem'

type TokenRewardsMetricsProps = {
  gauge: Address
  currency?: string
  token: Token
}

const TokenRewardsMetrics: FC<TokenRewardsMetricsProps> = ({
  gauge,
  token: { symbol, address },
  currency = 'USD',
}) => {
  const {
    data: builderRewardsPerToken,
    isLoading: builderRewardsPerTokenLoading,
    error: builderRewardsPerTokenError,
  } = useGetBuilderRewardsClaimedLogs(gauge)
  const {
    data: claimableRewards,
    isLoading: claimableRewardsLoading,
    error: claimableRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [address] })

  const error = builderRewardsPerTokenError ?? claimableRewardsError
  useHandleErrors({ error, title: 'Error loading all time rewards' })

  const { prices } = usePricesContext()

  const totalClaimedRewards =
    builderRewardsPerToken[address]?.reduce((acc, event) => {
      const amount = event.args.amount_ ?? 0n
      return acc + amount
    }, 0n) ?? 0n

  const totalRewards = totalClaimedRewards + (claimableRewards ?? 0n)
  const price = prices[symbol]?.price ?? 0

  const { amount, fiatAmount } = formatMetrics(totalRewards, price, symbol, currency)

  return withSpinner(TokenMetricsCardRow, { className: 'min-h-0 grow-0', size: 'small' })({
    amount,
    fiatAmount,
    isLoading: builderRewardsPerTokenLoading || claimableRewardsLoading,
  })
}

type AllTimeRewardsProps = Omit<BuilderRewardDetails, 'builder'>

export const AllTimeRewards: FC<AllTimeRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="All time rewards"
        data-testid="AllTimeRewards"
        tooltip={{
          text: 'Total of your received and claimable rewards',
          side: 'bottom',
        }}
      />
      <TokenRewardsMetrics {...rest} token={rif} />
      <TokenRewardsMetrics {...rest} token={rbtc} />
    </MetricsCard>
  )
}
