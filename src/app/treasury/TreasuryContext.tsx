import { createContext, ReactNode, useContext, useMemo } from 'react'
import { usePricesContext, withPricesContextProvider } from '@/shared/context/PricesContext'
import { useGetTreasuryBucketBalance } from '@/app/treasury/hooks/useGetTreasuryBucketBalance'
import { treasuryContracts } from '@/lib/contracts'
import { GetPricesResult } from '@/app/user/types'
import { formatCurrency } from '@/lib/utils'
import Big from '@/lib/big'

type BucketItem = {
  amount: string
  fiatAmount: string
}

type Bucket = {
  RIF: BucketItem
  RBTC: BucketItem
}

interface TreasuryContextProps {
  buckets: Bucket[]
  bucketsTotal: ReturnType<typeof getAllBucketsHoldings>
}

const getAllBucketsHoldings = (buckets: Bucket[]) => {
  const totalBalance = {
    RIF: Big(0),
    RBTC: Big(0),
  }

  buckets.forEach(bucket => {
    totalBalance.RIF = totalBalance.RIF.plus(bucket.RIF.amount)
    totalBalance.RBTC = totalBalance.RBTC.plus(bucket.RBTC.amount)
  })
  return totalBalance
}

const TreasuryContext = createContext<TreasuryContextProps>({
  buckets: [],
  bucketsTotal: { RIF: Big(0), RBTC: Big(0) },
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
    fiatAmount: formatCurrency(
      Big(bucketBalance.RIF.balance)
        .mul(prices.RIF?.price ?? 0)
        .toNumber(),
    ),
  },
  RBTC: {
    amount: bucketBalance.RBTC.balance,
    fiatAmount: formatCurrency(
      Big(bucketBalance.RBTC.balance)
        .mul(prices.RBTC?.price ?? 0)
        .toNumber(),
    ),
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
  const buckets = useMemo(
    () => [
      getBucketBalance(bucketOneBalance, prices),
      getBucketBalance(bucketTwoBalance, prices),
      getBucketBalance(bucketThreeBalance, prices),
      getBucketBalance(bucketFourBalance, prices),
      getBucketBalance(bucketFiveBalance, prices),
    ],
    [bucketOneBalance, bucketTwoBalance, bucketThreeBalance, bucketFourBalance, bucketFiveBalance, prices],
  )

  const bucketsTotal = useMemo(() => getAllBucketsHoldings(buckets), [buckets])

  const valueToUse = useMemo(() => ({ buckets, bucketsTotal }), [buckets, bucketsTotal])
  return <TreasuryContext.Provider value={valueToUse}>{children}</TreasuryContext.Provider>
}

export const useTreasuryContext = () => useContext(TreasuryContext)

export const TreasuryContextProviderWithPrices = withPricesContextProvider(TreasuryContextProvider)
