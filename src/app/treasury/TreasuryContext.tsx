import { createContext, ReactNode, useContext, useMemo } from 'react'
import { usePricesContext, withPricesContextProvider } from '@/shared/context/PricesContext'
import { useGetTreasuryBucketBalance } from '@/app/treasury/hooks/useGetTreasuryBucketBalance'
import { currentEnvTreasuryContracts } from '@/lib/contracts'
import { Address } from 'viem'
import { GetPricesResult } from '@/app/user/types'
import { formatCurrency } from '@/lib/utils'

type BucketItem = {
  amount: string
  fiatAmount: string
}

type Bucket = {
  RIF: BucketItem
  rBTC: BucketItem
}

interface TreasuryContextProps {
  buckets: Bucket[]
  bucketsTotal: ReturnType<typeof getAllBucketsHoldings>
}

const getAllBucketsHoldings = (buckets: Bucket[]) => {
  const totalBalance = {
    RIF: 0,
    rBTC: 0,
  }

  buckets.forEach(bucket => {
    totalBalance.RIF += Number(bucket.RIF.amount)
    totalBalance.rBTC += Number(bucket.rBTC.amount)
  })
  return totalBalance
}

const TreasuryContext = createContext<TreasuryContextProps>({
  buckets: [],
  bucketsTotal: { RIF: 0, rBTC: 0 },
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
    fiatAmount: formatCurrency(Number(bucketBalance.RIF.balance) * (prices.RIF?.price ?? 0)),
  },
  rBTC: {
    amount: bucketBalance.rBTC.balance,
    fiatAmount: formatCurrency(Number(bucketBalance.rBTC.balance) * (prices.rBTC?.price ?? 0)),
  },
})

const TreasuryContextProvider = ({ children }: Props) => {
  const { prices } = usePricesContext()

  const bucketOneBalance = useGetTreasuryBucketBalance(currentEnvTreasuryContracts[0].address as Address)
  const bucketTwoBalance = useGetTreasuryBucketBalance(currentEnvTreasuryContracts[1].address as Address)
  const bucketThreeBalance = useGetTreasuryBucketBalance(currentEnvTreasuryContracts[2].address as Address)

  const bucketOne: Bucket = useMemo(
    () => getBucketBalance(bucketOneBalance, prices),
    [bucketOneBalance, prices],
  )

  const bucketTwo: Bucket = useMemo(
    () => getBucketBalance(bucketTwoBalance, prices),
    [bucketTwoBalance, prices],
  )

  const bucketThree: Bucket = useMemo(
    () => getBucketBalance(bucketThreeBalance, prices),
    [bucketThreeBalance, prices],
  )

  const bucketsTotal = useMemo(
    () => getAllBucketsHoldings([bucketOne, bucketTwo, bucketThree]),
    [bucketOne, bucketThree, bucketTwo],
  )

  const valueToUse = useMemo(
    () => ({ buckets: [bucketOne, bucketTwo, bucketThree], bucketsTotal }),
    [bucketOne, bucketThree, bucketTwo, bucketsTotal],
  )
  return <TreasuryContext.Provider value={valueToUse}>{children}</TreasuryContext.Provider>
}

export const useTreasuryContext = () => useContext(TreasuryContext)

export const TreasuryContextProviderWithPrices = withPricesContextProvider(TreasuryContextProvider)
