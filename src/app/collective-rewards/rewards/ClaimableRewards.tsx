import { FC } from 'react'
import { Address } from 'viem'
import { usePricesContext } from '@/shared/context/PricesContext'
import {
  formatMetrics,
  useClaimBuilderRewards,
  useGetBuilderRewards,
  useClaimStateReporting,
  MetricsCardWithSpinner,
} from '@/app/collective-rewards/rewards'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { Popover } from '@/components/Popover'
import { useHandleErrors } from '@/app/collective-rewards/utils'

type Token = {
  symbol: string
  address: Address
}

type ClaimableRewardsProps = {
  builder: Address
  gauge: Address
  currency?: string
  data: {
    [token: string]: Token
  }
}

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

const getAction = (onClick: () => void, disabled: boolean) => (
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
    <button onClick={onClick} disabled={disabled}>
      <ClaimYourRewardsSvg />
    </button>
  </Popover>
)

const useGetRewardMetrics = (
  builder: Address,
  gauge: Address,
  tokenAddress: Address,
  symbol: string,
  currency: string,
) => {
  const { data: rewards, isLoading, error } = useGetBuilderRewards(tokenAddress, gauge)
  const { prices } = usePricesContext()

  const price = prices[symbol]?.price ?? 0
  const rewardsInHuman = Number(formatBalanceToHuman(rewards ?? 0n))
  const rewardMetrics = formatMetrics(rewardsInHuman, price, symbol, currency)

  const { isClaimFunctionReady, claimRewards, ...claimTx } = useClaimBuilderRewards(builder, tokenAddress)
  useClaimStateReporting({ ...claimTx })

  const action = getAction(claimRewards, !isClaimFunctionReady)

  return {
    data: {
      ...rewardMetrics,
      action,
    },
    error,
    isLoading,
  }
}

export const ClaimableRewards: FC<ClaimableRewardsProps> = ({
  builder,
  gauge,
  data: { rif, rbtc },
  currency = 'USD',
}) => {
  const {
    data: rifRewardsMetrics,
    isLoading: rifLoading,
    error: rifError,
  } = useGetRewardMetrics(builder, gauge, rif.address, rif.symbol, currency)
  const {
    data: rbtcRewardsMetrics,
    isLoading: rbtcLoading,
    error: rbtcError,
  } = useGetRewardMetrics(builder, gauge, rbtc.address, rbtc.symbol, currency)

  useHandleErrors([
    { error: rifError, title: 'Error loading builder rif rewards' },
    { error: rbtcError, title: 'Error loading builder rbtc rewards' },
  ])

  const isLoading = rifLoading || rbtcLoading

  return (
    <div>
      <MetricsCardWithSpinner
        title="Claimable rewards"
        data={{
          rif: rifRewardsMetrics,
          rbtc: rbtcRewardsMetrics,
        }}
        isLoading={isLoading}
        borderless
      />
    </div>
  )
}
