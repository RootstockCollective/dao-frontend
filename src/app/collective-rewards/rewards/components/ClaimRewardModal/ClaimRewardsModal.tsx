import { FC, useState, useMemo } from 'react'
import { useClaimBackerRewards } from '../../backers/hooks/useClaimBackerRewards'
import { usePricesContext } from '@/shared/context'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useBackerRewardsContext } from '@/app/collective-rewards/rewards/backers'
import { getFiatAmount } from '@/app/collective-rewards/rewards/utils'
import { ClaimRewardsModalView } from './ClaimRewardsModalView'
import { getTokens } from '@/lib/tokens'
import { ClaimRewardType } from './types'

interface ClaimRewardsModalProps {
  open: boolean
  onClose: () => void
}

const tokens = getTokens()

const getRewardTokenAddress = (value: ClaimRewardType) => {
  switch (value) {
    case 'all':
      return undefined // Claim all rewards
    default:
      return tokens[value]?.address
  }
}

export const ClaimRewardsModal: FC<ClaimRewardsModalProps> = ({ open, onClose }) => {
  const [selectedRewardType, setSelectedRewardType] = useState<ClaimRewardType>('all')

  const { claimRewards, isClaimable, isLoadingReceipt, isPendingTx } = useClaimBackerRewards(
    getRewardTokenAddress(selectedRewardType),
  )

  const { data: backerRewards, isLoading, error } = useBackerRewardsContext()
  const { prices } = usePricesContext()

  const { tokenAmounts, tokenFiatAmounts, totalFiatAmount } = useMemo(() => {
    const tokenAmounts: Record<string, bigint> = {}
    const tokenFiatAmounts: Record<string, number> = {}
    let totalFiatAmount = 0

    // Calculate amounts and fiat values for each token
    Object.entries(tokens).forEach(([tokenKey, tokenInfo]) => {
      const earned = backerRewards[tokenInfo.address]?.earned || {}
      const amount = Object.values(earned).reduce((acc, earned) => acc + earned, 0n)
      const price = prices[tokenInfo.symbol]?.price ?? 0
      const fiatAmount = getFiatAmount(amount, price)

      tokenAmounts[tokenKey] = amount
      tokenFiatAmounts[tokenKey] = fiatAmount.toNumber()
      totalFiatAmount += fiatAmount.toNumber()
    })

    return {
      tokenAmounts,
      tokenFiatAmounts,
      totalFiatAmount,
    }
  }, [backerRewards, prices])

  useHandleErrors({ error, title: 'Error loading rewards' })

  return (
    open && (
      <ClaimRewardsModalView
        onClose={onClose}
        selectedRewardType={selectedRewardType}
        onRewardTypeChange={setSelectedRewardType}
        tokenAmounts={tokenAmounts}
        tokenFiatAmounts={tokenFiatAmounts}
        totalFiatAmount={totalFiatAmount}
        onClaim={claimRewards}
        isClaimable={isClaimable}
        isLoading={isLoading}
        isTxPending={isPendingTx || isLoadingReceipt}
      />
    )
  )
}

export default ClaimRewardsModal
