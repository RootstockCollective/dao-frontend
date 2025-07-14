import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/ButtonNew'
import { Modal } from '@/components/Modal/Modal'
import { TokenImage } from '@/components/TokenImage'
import { Tooltip } from '@/components/Tooltip'
import { Typography } from '@/components/TypographyNew/Typography'
import { cn, formatCurrency } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { ClaimRewardType } from './types'
import { RBTC } from '@/lib/constants'
import { ClaimRewardRadioGroup } from './ClaimRewardRadioGroup'

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
      subLabel: formatCurrency(totalFiatAmount),
    },
    ...Object.entries(tokens).map(([tokenKey, tokenInfo]) => ({
      value: tokenKey as ClaimRewardType,
      label: (
        <div className="flex items-center gap-2">
          {formatSymbol(tokenAmounts[tokenKey], tokenInfo.symbol)}{' '}
          <TokenImage symbol={tokenInfo.symbol} size={tokenInfo.symbol === RBTC ? 18 : 16} />
        </div>
      ),
      subLabel: `${formatCurrency(tokenFiatAmounts[tokenKey])} USD`,
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
      <div className="p-8 flex flex-col gap-8">
        <Typography variant="h1">CLAIM REWARDS</Typography>
        <Typography>
          Select the rewards that you want to claim, then confirm the transaction in your wallet.
        </Typography>
        <ClaimRewardRadioGroup
          value={selectedRewardType}
          onValueChange={onRewardTypeChange}
          options={radioOptions}
          isLoading={isLoading}
        />
        <Typography variant="body">
          Claim your rewards directly to your wallet. Claimed rewards are transferred immediately, and your
          unclaimed balance resets.
        </Typography>
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="secondary-outline" onClick={onClose}>
            Cancel
          </Button>
          {isTxPending ? (
            <TransactionInProgressButton />
          ) : (
            <Tooltip
              text="Current rewards are not claimable"
              disabled={isClaimable}
              className="z-50"
              side="left"
            >
              <Button variant="primary" onClick={() => isClaimable && onClaim()}>
                Claim now
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </Modal>
  )
}
