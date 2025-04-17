import { useMemo } from 'react'
import Big from '@/lib/big'
import { formatEther } from 'viem'
import { useReadContract } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useTreasuryContext } from '@/app/treasury/TreasuryContext'

/**
 * Fetches and calculates the stRIF token balance, its USD value,
 * total funding in USD, and the total value locked (TVL).
 */
export function useStRifHoldings() {
  const { buckets } = useTreasuryContext()
  const { prices } = usePricesContext()
  const { data } = useReadContract({
    abi: StRIFTokenAbi,
    address: tokenContracts.stRIF,
    functionName: 'totalSupply',
  })
  return useMemo(() => {
    const balance = Big(formatEther(data ?? 0n))
    const usdBalance = Big(prices.stRIF?.price ?? 0).mul(balance)
    const totalFunding = Object.values(buckets).reduce(
      (acc, { RIF, RBTC }) => acc.add(RIF.fiatAmount).add(RBTC.fiatAmount),
      Big(0),
    )
    return {
      stRifBalance: balance.ceil().toString(),
      stRifUsdBalance: usdBalance.toFixed(2),
      totalFundingUsd: totalFunding.toFixed(2),
      tvlUsd: usdBalance.add(totalFunding).toFixed(2),
    }
  }, [data, prices.stRIF?.price, buckets])
}
