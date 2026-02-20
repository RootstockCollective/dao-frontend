import { ConditionalTooltip } from '@/app/components'
import { formatSymbol } from '@/app/shared/formatter'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { Modal } from '@/components/Modal/Modal'
import { TokenImage } from '@/components/TokenImage'
import { Header, Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { formatCurrencyWithLabel } from '@/lib/utils'
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
    <Modal onClose={onClose} data-testid="ClaimRewardsModalView">
      <div className="h-full flex flex-col p-4 md:p-6">
        <Header className="mt-16 mb-8 md:mb-10">CLAIM REWARDS</Header>

        <Paragraph className="mb-6">
          Select the rewards that you want to claim, then confirm the transaction in your wallet.
        </Paragraph>

        <div className="flex-1">
          <ClaimRewardRadioGroup
            value={selectedRewardType}
            onValueChange={onRewardTypeChange}
            options={radioOptions}
            isLoading={isLoading}
          />

          <Paragraph className="mt-6 md:mt-10">
            Claim your rewards directly to your wallet. Claimed rewards are transferred immediately, and your
            unclaimed balance resets.
          </Paragraph>
        </div>

        <Divider className="mb-4 mt-14" />

        <div className="flex justify-end gap-4">
          <Button variant="secondary-outline" onClick={onClose}>
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
              side="left"
            >
              <Button variant="primary" onClick={() => isClaimable && onClaim()}>
                Claim now
              </Button>
            </ConditionalTooltip>
          )}
        </div>
      </div>
    </Modal>
  )
}
