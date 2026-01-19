import { formatSymbol } from '@/app/shared/formatter'
import { ConditionalTooltip } from '@/app/components'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal/Modal'
import { TokenImage } from '@/components/TokenImage'
import { Header, Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn, formatCurrencyWithLabel } from '@/lib/utils'
import { Separator } from '@radix-ui/react-select'
import { FC, ReactNode } from 'react'
import { ClaimRewardRadioGroup } from './ClaimRewardRadioGroup'
import { ClaimRewardType } from './types'
import { REWARD_TOKEN_KEYS, TOKENS, type RewardToken } from '@/lib/tokens'

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
    ...REWARD_TOKEN_KEYS.map(tokenKey => ({
      value: tokenKey,
      label: (
        <div className="flex items-center gap-2">
          {formatSymbol(tokenAmounts[tokenKey], TOKENS[tokenKey].symbol)}{' '}
          <TokenImage symbol={TOKENS[tokenKey].symbol} size={TOKENS[tokenKey].symbol === RBTC ? 18 : 16} />
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
        <Header variant="h1">CLAIM REWARDS</Header>
        <Paragraph>
          Select the rewards that you want to claim, then confirm the transaction in your wallet.
        </Paragraph>
        <ClaimRewardRadioGroup
          value={selectedRewardType}
          onValueChange={onRewardTypeChange}
          options={radioOptions}
          isLoading={isLoading}
        />
        <Paragraph variant="body">
          Claim your rewards directly to your wallet. Claimed rewards are transferred immediately, and your
          unclaimed balance resets.
        </Paragraph>

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
