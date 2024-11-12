import {
  formatMetrics,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
  useClaimBuilderRewards,
  useClaimStateReporting,
  useGetBuilderRewards,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { Button, ButtonProps } from '@/components/Button'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Popover } from '@/components/Popover'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC } from 'react'
import { Address } from 'viem'

const ClaimYourRewardsSvg = () => (
  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.75 12.1667H13.7583M2.5 4.66667V16.3333C2.5 17.2538 3.24619 18 4.16667 18H15.8333C16.7538 18 17.5 17.2538 17.5 16.3333V8C17.5 7.07953 16.7538 6.33333 15.8333 6.33333L4.16667 6.33333C3.24619 6.33333 2.5 5.58714 2.5 4.66667ZM2.5 4.66667C2.5 3.74619 3.24619 3 4.16667 3H14.1667M14.1667 12.1667C14.1667 12.3968 13.9801 12.5833 13.75 12.5833C13.5199 12.5833 13.3333 12.3968 13.3333 12.1667C13.3333 11.9365 13.5199 11.75 13.75 11.75C13.9801 11.75 14.1667 11.9365 14.1667 12.1667Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ClaimYourRewardsButton: FC<Required<Pick<ButtonProps, 'onClick' | 'disabled'>>> = buttonProps => (
  <div className="self-start justify-self-end pt-[10px]">
    <Popover
      content={
        <div className="text-[12px] font-bold mb-1">
          <p data-testid="builderAddressTooltip">Claim your rewards</p>
        </div>
      }
      size="small"
      position="top"
      trigger="hover"
    >
      <Button {...buttonProps} variant="borderless" className="px-1 py-1">
        <ClaimYourRewardsSvg />
      </Button>
    </Popover>
  </div>
)

type Token = {
  symbol: string
  address: Address
}

type RewardsTokenMetricsProps = {
  builder: Address
  gauge: Address
  token: Token
  currency?: string
}

const RewardsTokenMetrics: FC<RewardsTokenMetricsProps> = ({
  builder,
  gauge,
  token: { address, symbol },
  currency = 'USD',
}) => {
  const { prices } = usePricesContext()

  const {
    data: rewards,
    isLoading: isLoadingRewards,
    error: rewardsError,
  } = useGetBuilderRewards(address, gauge)
  useHandleErrors({ error: rewardsError, title: 'Error loading rewards' })

  const tokenPrice = prices[symbol]?.price ?? 0

  const { amount, fiatAmount } = formatMetrics(
    Number(formatBalanceToHuman(rewards ?? 0n)),
    tokenPrice,
    symbol,
    currency,
  )

  const { isClaimFunctionReady, claimRewards, ...claimTx } = useClaimBuilderRewards(builder)

  useClaimStateReporting({ ...claimTx, error: rewardsError ?? claimTx.error })

  return withSpinner(TokenMetricsCardRow)({
    amount,
    fiatAmount,
    isLoading: isLoadingRewards,
    children: (
      <ClaimYourRewardsButton onClick={() => claimRewards(address)} disabled={!isClaimFunctionReady} />
    ),
  })
}

type ClaimableRewardsProps = {
  builder: Address
  gauge: Address
  currency?: string
  data: {
    [token: string]: Token
  }
}

export const ClaimableRewards: FC<ClaimableRewardsProps> = ({ data, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Claimable rewards" data-testid="ClaimableRewards" />
      <RewardsTokenMetrics {...rest} token={data.rif} />
      <RewardsTokenMetrics {...rest} token={data.rbtc} />
    </MetricsCard>
  )
}
