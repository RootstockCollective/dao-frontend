import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { ConditionalTooltip } from '@/app/components'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { TokenImage } from '@/components/TokenImage'
import { BaseTypography } from '@/components/Typography/Typography'
import { RBTC } from '@/lib/constants'
import { cn, formatCurrencyWithLabel } from '@/lib/utils'
import { Separator } from '@radix-ui/react-select'
import { FC, ReactNode } from 'react'
import { ClaimRewardRadioGroup } from './ClaimRewardRadioGroup'
import { ClaimRewardType } from './types'

interface ClaimRewardsModalViewProps {
  onClose: () => void
  selectedRewardType: ClaimRewardType
  onRewardTypeChange: (value: ClaimRewardType) => void
  tokenAmounts: Record<string, bigint>
  tokenFiatAmounts: Record<string, number>
  totalFiatAmount: number
  onClaim: () => void
  isClaimable: boolean
  isTxPending?: boolean
  isLoading?: boolean
  className?: string
  tokens: Record<string, { symbol: string; address: string }>
}

export const ClaimRewardsModalView: FC<ClaimRewardsModalViewProps> = ({
  onClose,
  selectedRewardType,
  onRewardTypeChange,
  tokenAmounts,
  tokenFiatAmounts,
  totalFiatAmount,
  onClaim,
  isClaimable,
  isTxPending = false,
  isLoading = false,
  className,
  tokens,
}) => {
  const radioOptions: Array<{
    value: ClaimRewardType
    label: ReactNode
    subLabel: ReactNode
  }> = [
    {
      value: 'all',
      label: 'All Rewards',
      subLabel: formatCurrencyWithLabel(totalFiatAmount),
    },
    ...Object.entries(tokens).map(([tokenKey, tokenInfo]) => ({
      value: tokenKey as ClaimRewardType,
      label: (
        <div className="flex items-center gap-2">
          {formatSymbol(tokenAmounts[tokenKey], tokenInfo.symbol)}{' '}
          <TokenImage symbol={tokenInfo.symbol} size={tokenInfo.symbol === RBTC ? 18 : 16} />
        </div>
      ),
      subLabel: `${formatCurrencyWithLabel(tokenFiatAmounts[tokenKey])}`,
    })),
  ]

  return (
    <Modal
      onClose={onClose}
      width={700}
      height="auto"
      closeButtonColor="white"
      data-testid="ClaimRewardsModalView"
      className={cn('font-rootstock-sans shadow-[0px_0px_40px_0px_rgba(255,255,255,0.10)]', className)}
    >
      <div className="p-8 flex flex-col gap-8 h-full justify-start">
        <BaseTypography variant="h1">CLAIM REWARDS</BaseTypography>
        <BaseTypography>
          Select the rewards that you want to claim, then confirm the transaction in your wallet.
        </BaseTypography>
        <ClaimRewardRadioGroup
          value={selectedRewardType}
          onValueChange={onRewardTypeChange}
          options={radioOptions}
          isLoading={isLoading}
        />
        <BaseTypography variant="body">
          Claim your rewards directly to your wallet. Claimed rewards are transferred immediately, and your
          unclaimed balance resets.
        </BaseTypography>

        <div className="mt-8 flex flex-col w-full gap-8 justify-end h-full">
          <Separator className="bg-v3-bg-accent-60 h-[1px] w-full" />
          <div className="w-full flex justify-stretch md:justify-end gap-4">
            <Button variant="secondary-outline" className="w-full md:w-auto" onClick={onClose}>
              Cancel
            </Button>
            {isTxPending ? (
              <TransactionInProgressButton />
            ) : (
              <ConditionalTooltip
                conditionPairs={[
                  {
                    condition: () => !isClaimable,
                    lazyContent: () => 'Current rewards are not claimable',
                  },
                ]}
                className="z-50"
                side="left"
              >
                <Button
                  variant="primary"
                  className="w-full md:w-auto"
                  onClick={() => isClaimable && onClaim()}
                >
                  Claim now
                </Button>
              </ConditionalTooltip>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
