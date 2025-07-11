import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/ButtonNew'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Modal } from '@/components/Modal/Modal'
import { TokenImage } from '@/components/TokenImage'
import { Tooltip } from '@/components/Tooltip'
import { Typography } from '@/components/TypographyNew/Typography'
import { cn, formatCurrency } from '@/lib/utils'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { FC, ReactNode, memo } from 'react'
import { ClaimRewardType } from './types'
import { getTokens } from '@/lib/tokens'
import { RBTC } from '@/lib/constants'

const tokens = getTokens()

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

interface ClaimRewardRadioOptionProps {
  value: ClaimRewardType
  label: ReactNode
  subLabel: ReactNode
  isLoading?: boolean
}

const ClaimRewardRadioOption: FC<ClaimRewardRadioOptionProps> = memo(
  ({ value, label, subLabel, isLoading }) => (
    <RadioGroup.Item
      value={value}
      className="flex-1 rounded border-1 border-[v3-text-100] px-3 py-4 flex flex-col items-start gap-2 data-[state=checked]:border-t-4 data-[state=checked]:pt-[13px] focus:outline-none cursor-pointer"
    >
      {isLoading ? (
        <div className="flex justify-center items-center w-full py-2">
          <LoadingSpinner size="small" />
        </div>
      ) : (
        <div className="flex flex-row items-start gap-3 w-full">
          <span className="w-5 h-5 aspect-square rounded-full border-2 border-white flex items-center justify-center flex-shrink-0">
            <RadioGroup.Indicator className="w-full h-full rounded-full border-4 border-white" />
          </span>
          <div className="flex flex-col items-start gap-2 justify-start text-left w-full">
            <Typography variant="h3">{label}</Typography>
            <Typography variant="body" className="text-v3-bg-accent-0">
              {subLabel}
            </Typography>
          </div>
        </div>
      )}
    </RadioGroup.Item>
  ),
)

ClaimRewardRadioOption.displayName = 'ClaimRewardRadioOption'

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
        <RadioGroup.Root
          className="flex gap-2 w-full"
          value={selectedRewardType}
          onValueChange={onRewardTypeChange}
        >
          {radioOptions.map(option => (
            <ClaimRewardRadioOption
              key={option.value}
              value={option.value}
              label={option.label}
              subLabel={option.subLabel}
              isLoading={isLoading}
            />
          ))}
        </RadioGroup.Root>
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
