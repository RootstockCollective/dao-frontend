import {
  BuilderRewardDetails,
  ClaimYourRewardsButton,
  formatMetrics,
  MetricsCard,
  MetricsCardTitle,
  Token,
  TokenMetricsCardRow,
  useClaimBuilderRewardsPerToken,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { FC } from 'react'
import { Address } from 'viem'
import { TokenImage } from '@/components/TokenImage'

type TokenRewardsMetricsProps = {
  builder: Address
  gauge: Address
  token: Token
  currency?: string
}

const TokenRewardsMetrics: FC<TokenRewardsMetricsProps> = ({
  builder,
  gauge,
  token: { address, symbol },
  currency = 'USD',
}) => {
  const { prices } = usePricesContext()

  const {
    data: rewards,
    isLoading: rewardsLoading,
    error: rewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [address] })
  useHandleErrors({ error: rewardsError, title: 'Error loading rewards' })

  const tokenPrice = prices[symbol]?.price ?? 0

  const { amount, fiatAmount } = formatMetrics(rewards ?? 0n, tokenPrice, symbol, currency)

  const { isClaimable, claimRewards, isPaused } = useClaimBuilderRewardsPerToken(builder, gauge, address)
  const content = isPaused ? 'You cannot be paused to claim rewards' : undefined

  // Layout and typography styles
  const mainRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  }
  const iconTextStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }
  const amountTextStyle: React.CSSProperties = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 1,
    overflow: 'hidden',
    color: 'var(--Text-100, #FFF)',
    textOverflow: 'ellipsis',
    fontFamily: 'KK-Topo',
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '130%',
    letterSpacing: '0.4px',
    marginRight: 0,
    marginLeft: 0,
  }
  const usdTextStyle: React.CSSProperties = {
    alignSelf: 'stretch',
    color: 'var(--Background-0, #ACA39D)',
    fontFamily: 'Rootstock Sans',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '150%',
    marginLeft: 0,
    marginRight: 0,
  }

  return (
    <div style={mainRowStyle}>
      <div style={iconTextStyle}>
        <TokenImage symbol={symbol} size={20} />
        <span style={{ color: 'var(--Text-100, #FFF)', fontFamily: 'Rootstock Sans', fontSize: 16, fontWeight: 500 }}>
          {symbol}
        </span>
        <span style={amountTextStyle}>{amount}</span>
      </div>
      <span style={usdTextStyle}>{fiatAmount}</span>
      <ClaimYourRewardsButton
        onClick={() => claimRewards()}
        disabled={!isClaimable || isPaused}
        content={content}
      />
    </div>
  )
}

type ClaimableRewardsProps = BuilderRewardDetails

export const ClaimableRewards: FC<ClaimableRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Claimable rewards"
        data-testid="ClaimableRewards"
        tooltip={{ text: 'Your rewards available to claim' }}
      />
      <TokenRewardsMetrics {...rest} token={rif} />
      <TokenRewardsMetrics {...rest} token={rbtc} />
    </MetricsCard>
  )
}
