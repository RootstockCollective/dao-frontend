import { RBTC, RIF, USDRIF, WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadBackersManager } from '@/shared/hooks/contracts'
import Big from 'big.js'
import { Address, parseEther } from 'viem'
import { useMemo } from 'react'
import { calculateAbi } from './useGetABI'
import { useBackingContext } from '@/app/shared/context/BackingContext'

export const useGetBackerABI = (backer: Address) => {
  const {
    data: backingData,
    isLoading: isBackingDataLoading,
    error: isBackingDataError,
  } = useBackingContext()
  const {
    data: backerTotalAllocation,
    isLoading: backerTotalAllocationLoading,
    error: backerTotalAllocationError,
  } = useReadBackersManager({
    functionName: 'backerTotalAllocation',
    args: [backer],
  })
  const { prices } = usePricesContext()

  const abi = useMemo(() => {
    const rifPrice = prices[RIF]?.price ?? 0
    const rbtcPrice = prices[RBTC]?.price ?? 0
    const usdrifPrice = prices[USDRIF]?.price ?? 0
    const rifPriceInWei = parseEther(rifPrice.toString())
    const rbtcPriceInWei = parseEther(rbtcPrice.toString())
    const usdrifPriceInWei = parseEther(usdrifPrice.toString())

    const backerRewards = backingData.reduce((acc, { backerEstimatedRewards }) => {
      const { rif, rbtc, usdrif } = backerEstimatedRewards

      return (
        acc +
        (rif.amount.value * rifPriceInWei +
          rbtc.amount.value * rbtcPriceInWei +
          usdrif.amount.value * usdrifPriceInWei) /
          WeiPerEther
      )
    }, 0n)

    if (!backerTotalAllocation) {
      return Big(0)
    }

    const rewardsPerStRif = (backerRewards * WeiPerEther) / backerTotalAllocation

    return calculateAbi(Big(rewardsPerStRif.toString()), rifPrice)
  }, [backingData, backerTotalAllocation, prices])

  const isLoading = isBackingDataLoading || backerTotalAllocationLoading

  const error = isBackingDataError ?? backerTotalAllocationError

  return {
    data: abi,
    isLoading,
    error,
  }
}
