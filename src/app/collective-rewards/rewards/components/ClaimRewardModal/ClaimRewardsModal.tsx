import { FC, useState, useMemo } from 'react'
import { useClaimBackerRewards } from '../../backers/hooks/useClaimBackerRewards'
import { usePricesContext } from '@/shared/context'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useBackerRewardsContext } from '@/app/collective-rewards/rewards/backers'
import { getFiatAmount } from '@/app/collective-rewards/rewards/utils'
import { ClaimRewardsModalView } from './ClaimRewardsModalView'
import { TokenSymbol } from '@/components/TokenImage'
import { getTokens } from '@/lib/tokens'
import { ClaimRewardType } from './types'

interface ClaimRewardsModalProps {
  open: boolean
  onClose: () => void
}

const tokens = getTokens()

const getRewardTokenAddress = (value: ClaimRewardType) => {
  switch (value) {
    case 'rif':
      return tokens.rif.address
    case 'rbtc':
      return tokens.rbtc.address
    case 'all':
    default:
      return undefined // Claim all rewards
  }
}

export const ClaimRewardsModal: FC<ClaimRewardsModalProps> = ({ open, onClose }) => {
  const [selectedRewardType, setSelectedRewardType] = useState<ClaimRewardType>('all')

  const { claimRewards, isClaimable, isLoadingReceipt, isPendingTx } = useClaimBackerRewards(
    getRewardTokenAddress(selectedRewardType),
  )

  const { data, isLoading, error } = useBackerRewardsContext()
  const { prices } = usePricesContext()

  const rifPrice = prices[TokenSymbol.STRIF]?.price ?? 0
  const rbtcPrice = prices[TokenSymbol.RBTC]?.price ?? 0

  const rifEarned = data[tokens.rif.address].earned
  const rbtcEarned = data[tokens.rbtc.address].earned

  const { rifAmount, rbtcAmount, rifFiatAmount, rbtcFiatAmount, totalFiatAmount } = useMemo(() => {
    const rifAmount = Object.values(rifEarned).reduce((acc, earned) => acc + earned, 0n)
    const rbtcAmount = Object.values(rbtcEarned).reduce((acc, earned) => acc + earned, 0n)

    const rifFiatAmount = getFiatAmount(rifAmount, rifPrice)
    const rbtcFiatAmount = getFiatAmount(rbtcAmount, rbtcPrice)
    const totalFiatAmount = rifFiatAmount.add(rbtcFiatAmount)

    return {
      rifAmount,
      rbtcAmount,
      rifFiatAmount,
      rbtcFiatAmount,
      totalFiatAmount,
    }
  }, [rifEarned, rbtcEarned, rifPrice, rbtcPrice])

  useHandleErrors({ error, title: 'Error loading rewards' })

  return (
    open && (
      <ClaimRewardsModalView
        onClose={onClose}
        selectedRewardType={selectedRewardType}
        onRewardTypeChange={setSelectedRewardType}
        rifAmount={rifAmount}
        rbtcAmount={rbtcAmount}
        rifFiatAmount={rifFiatAmount.toNumber()}
        rbtcFiatAmount={rbtcFiatAmount.toNumber()}
        totalFiatAmount={totalFiatAmount.toNumber()}
        onClaim={claimRewards}
        isClaimable={isClaimable}
        isLoading={isLoading}
        isTxPending={isPendingTx || isLoadingReceipt}
      />
    )
  )
}

export default ClaimRewardsModal
