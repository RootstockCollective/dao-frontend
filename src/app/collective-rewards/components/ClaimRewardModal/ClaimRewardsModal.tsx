import { useBackerRewardsContext } from '@/app/collective-rewards/rewards/backers'
import { getFiatAmount } from '@/app/shared/formatter'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { TOKENS, REWARD_TOKEN_KEYS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context'
import { useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { ReactElement, ReactNode, useMemo, useState, useEffect } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { useClaimBackerRewards } from '../../rewards/backers/hooks/useClaimBackerRewards'
import { useClaimBuilderRewards } from '../../rewards/builders/hooks/useClaimBuilderRewards'
import { ClaimRewardsModalView } from './ClaimRewardsModalView'
import { ClaimRewardType } from './types'

const getRewardTokenAddress = (value: ClaimRewardType) => {
  switch (value) {
    case 'all':
      return undefined // Claim all rewards
    default:
      return TOKENS[value as keyof typeof TOKENS]?.address
  }
}

const ClaimBackerRewardsModal = ({ open, onClose }: Omit<ClaimRewardsModalProps, 'isBacker'>): ReactNode => {
  const [selectedRewardType, setSelectedRewardType] = useState<ClaimRewardType>('all')

  const { claimRewards, isClaimable, isLoadingReceipt, isPendingTx, isSuccess } = useClaimBackerRewards(
    getRewardTokenAddress(selectedRewardType),
  )

  const { data: backerRewards, isLoading, error } = useBackerRewardsContext()
  useHandleErrors({ error, title: 'Error loading rewards' })

  const { prices } = usePricesContext()

  useEffect(() => {
    if (isSuccess) {
      onClose()
    }
  }, [isSuccess, onClose])

  const { tokenAmounts, tokenFiatAmounts, totalFiatAmount } = useMemo(() => {
    const tokenAmounts: Record<string, bigint> = {}
    const tokenFiatAmounts: Record<string, number> = {}
    let totalFiatAmount = 0

    // Calculate amounts and fiat values for each token
    REWARD_TOKEN_KEYS.forEach(tokenKey => {
      const tokenInfo = TOKENS[tokenKey as keyof typeof TOKENS]
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

const ClaimBuilderRewardsModal = ({ open, onClose }: Omit<ClaimRewardsModalProps, 'isBacker'>): ReactNode => {
  const { address: builderAddress } = useAccount()
  const { prices } = usePricesContext()
  const {
    data: buildersGauge,
    isLoading: isLoadingGauge,
    error: errorGauge,
  } = useReadBuilderRegistry(
    {
      functionName: 'builderToGauge',
      args: [builderAddress as Address],
    },
    {
      enabled: !!builderAddress,
    },
  )
  const [selectedRewardType, setSelectedRewardType] = useState<ClaimRewardType>('all')

  const {
    data: rifRewards,
    isLoading: isLoadingRif,
    error: errorRif,
  } = useReadGauge(
    { address: buildersGauge as Address, functionName: 'builderRewards', args: [TOKENS.rif.address] },
    {
      enabled: !!buildersGauge,
      initialData: 0n,
    },
  )
  const {
    data: rbtcRewards,
    isLoading: isLoadingRbtc,
    error: errorRbtc,
  } = useReadGauge(
    { address: buildersGauge as Address, functionName: 'builderRewards', args: [TOKENS.rbtc.address] },
    {
      enabled: !!buildersGauge,
      initialData: 0n,
    },
  )

  const {
    data: usdrifRewards,
    isLoading: isLoadingUsdrif,
    error: errorUsdrif,
  } = useReadGauge(
    { address: buildersGauge as Address, functionName: 'builderRewards', args: [TOKENS.usdrif.address] },
    {
      enabled: !!buildersGauge,
      initialData: 0n,
    },
  )

  const { tokenAmounts, tokenFiatAmounts, totalFiatAmount } = useMemo(() => {
    const tokenAmounts: Record<string, bigint> = {
      rif: rifRewards ?? 0n,
      rbtc: rbtcRewards ?? 0n,
      usdrif: usdrifRewards ?? 0n,
    }
    const tokenFiatAmounts: Record<string, number> = {
      rif: getFiatAmount(rifRewards ?? 0n, prices[TOKENS.rif.symbol]?.price ?? 0).toNumber(),
      rbtc: getFiatAmount(rbtcRewards ?? 0n, prices[TOKENS.rbtc.symbol]?.price ?? 0).toNumber(),
      usdrif: getFiatAmount(usdrifRewards ?? 0n, prices[TOKENS.usdrif.symbol]?.price ?? 0).toNumber(),
    }
    const totalFiatAmount = tokenFiatAmounts.rif + tokenFiatAmounts.rbtc + tokenFiatAmounts.usdrif

    return {
      tokenAmounts,
      tokenFiatAmounts,
      totalFiatAmount,
    }
  }, [rifRewards, rbtcRewards, usdrifRewards, prices])

  const {
    claimRewards,
    isClaimable,
    isLoadingReceipt,
    isPendingTx,
    isSuccess,
    error: errorClaim,
  } = useClaimBuilderRewards(builderAddress as Address, buildersGauge as Address)

  useHandleErrors({ error: errorGauge, title: 'Error fetching builder gauge' })
  useHandleErrors({ error: errorRif, title: 'Error fetching builder rewards' })
  useHandleErrors({ error: errorRbtc, title: 'Error fetching builder rewards' })
  useHandleErrors({ error: errorUsdrif, title: 'Error fetching builder rewards' })
  useHandleErrors({ error: errorClaim, title: 'Error claiming rewards' })

  // Close modal when transaction is successful
  useEffect(() => {
    if (isSuccess) {
      onClose()
    }
  }, [isSuccess, onClose])

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
        isLoading={isLoadingRif || isLoadingRbtc || isLoadingUsdrif || isLoadingGauge}
        isTxPending={isPendingTx || isLoadingReceipt}
      />
    )
  )
}

interface ClaimRewardsModalProps {
  open: boolean
  onClose: () => void
  isBacker: boolean
}

export default function ClaimRewardsModal({ open, onClose, isBacker }: ClaimRewardsModalProps): ReactElement {
  if (isBacker) {
    return <ClaimBackerRewardsModal open={open} onClose={onClose} />
  }

  return <ClaimBuilderRewardsModal open={open} onClose={onClose} />
}
