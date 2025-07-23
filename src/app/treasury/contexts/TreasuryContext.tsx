import { createContext, ReactNode, useContext, useMemo } from 'react'
import { usePricesContext, withPricesContextProvider } from '@/shared/context/PricesContext'
import { useGetTreasuryBucketBalance } from '@/app/treasury/hooks/useGetTreasuryBucketBalance'
import { treasuryContracts } from '@/lib/contracts'
import { GetPricesResult } from '@/app/user/types'
import Big from '@/lib/big'
import { Bucket } from '../types'

interface TreasuryContextProps {
  buckets: Partial<Record<keyof typeof treasuryContracts, ReturnType<typeof getBucketBalance>>>
  bucketsTotal: ReturnType<typeof getAllBucketsHoldings>
}

const getAllBucketsHoldings = (buckets: Bucket[]) => {
  const totalBalance = {
    RIF: Big(0),
    USDRIF: Big(0),
    RBTC: Big(0),
  }

  buckets.forEach(bucket => {
    totalBalance.RIF = totalBalance.RIF.plus(bucket.RIF.amount)
    totalBalance.USDRIF = totalBalance.USDRIF.plus(bucket.USDRIF.amount)
    totalBalance.RBTC = totalBalance.RBTC.plus(bucket.RBTC.amount)
  })
  return totalBalance
}

const TreasuryContext = createContext<TreasuryContextProps>({
  buckets: {},
  bucketsTotal: { RIF: Big(0), USDRIF: Big(0), RBTC: Big(0) },
})

interface Props {
  children: ReactNode
}

export type TreasurySymbolsSupported = keyof ReturnType<typeof useGetTreasuryBucketBalance>

const getBucketBalance = (
  bucketBalance: ReturnType<typeof useGetTreasuryBucketBalance>,
  prices: GetPricesResult,
) => ({
  RIF: {
    amount: bucketBalance.RIF.balance,
    fiatAmount: Big(bucketBalance.RIF.balance)
      .mul(prices.RIF?.price ?? 0)
      .toString(),
    formattedAmount: bucketBalance.RIF.formattedBalance,
  },
  USDRIF: {
    amount: bucketBalance.USDRIF.balance,
    fiatAmount: Big(bucketBalance.USDRIF.balance)
      .mul(prices.USDRIF?.price ?? 1) // Default to 1 if price is unavailable
      .toString(),
    formattedAmount: bucketBalance.USDRIF.formattedBalance,
  },
  RBTC: {
    amount: bucketBalance.RBTC.balance,
    fiatAmount: Big(bucketBalance.RBTC.balance)
      .mul(prices.RBTC?.price ?? 0)
      .toString(),
    formattedAmount: bucketBalance.RBTC.formattedBalance,
  },
})

const TreasuryContextProvider = ({ children }: Props) => {
  const { prices } = usePricesContext()

  const bucketOneBalance = useGetTreasuryBucketBalance(treasuryContracts['GRANTS'].address)
  const bucketTwoBalance = useGetTreasuryBucketBalance(treasuryContracts['GRANTS_ACTIVE'].address)
  const bucketThreeBalance = useGetTreasuryBucketBalance(treasuryContracts['GROWTH'].address)
  const bucketFourBalance = useGetTreasuryBucketBalance(treasuryContracts['GROWTH_REWARDS'].address)
  const bucketFiveBalance = useGetTreasuryBucketBalance(treasuryContracts['GENERAL'].address)

  // Create the buckets array
  const buckets = useMemo<Record<keyof typeof treasuryContracts, ReturnType<typeof getBucketBalance>>>(
    () => ({
      GRANTS: getBucketBalance(bucketOneBalance, prices),
      GRANTS_ACTIVE: getBucketBalance(bucketTwoBalance, prices),
      GROWTH: getBucketBalance(bucketThreeBalance, prices),
      GROWTH_REWARDS: getBucketBalance(bucketFourBalance, prices),
      GENERAL: getBucketBalance(bucketFiveBalance, prices),
    }),
    [bucketOneBalance, bucketTwoBalance, bucketThreeBalance, bucketFourBalance, bucketFiveBalance, prices],
  )

  const bucketsTotal = useMemo(() => getAllBucketsHoldings(Object.values(buckets)), [buckets])

  const valueToUse = useMemo(() => ({ buckets, bucketsTotal }), [buckets, bucketsTotal])
  return <TreasuryContext.Provider value={valueToUse}>{children}</TreasuryContext.Provider>
}

export const useTreasuryContext = () => useContext(TreasuryContext)

export const TreasuryContextProviderWithPrices = withPricesContextProvider(TreasuryContextProvider)
