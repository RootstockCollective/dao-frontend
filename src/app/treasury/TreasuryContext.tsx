import { createContext, ReactNode, useContext, useMemo } from 'react'
import { usePricesContext, withPricesContextProvider } from '@/shared/context/PricesContext'
import { useGetTreasuryBucketBalance } from '@/app/treasury/hooks/useGetTreasuryBucketBalance'
import { currentEnvTreasuryContracts } from '@/lib/contracts'
import { Address } from 'viem'

type BucketItem = {
  amount: string
  fiatAmount: number
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

const TreasuryContextProvider = ({ children }: Props) => {
  const { prices } = usePricesContext()

  const bucketOneBalance = useGetTreasuryBucketBalance(currentEnvTreasuryContracts[0].address as Address)

  const bucketOne: Bucket = useMemo(
    () => ({
      RIF: {
        amount: bucketOneBalance.RIF.balance,
        fiatAmount: Number(bucketOneBalance.RIF.balance) * prices.RIF.price,
      },
      rBTC: {
        amount: bucketOneBalance.rBTC.balance,
        fiatAmount: Number(bucketOneBalance.rBTC.balance) * prices.rBTC.price,
      },
    }),
    [bucketOneBalance.RIF.balance, bucketOneBalance.rBTC.balance, prices.RIF.price, prices.rBTC.price],
  )

  const bucketsTotal = useMemo(() => getAllBucketsHoldings([bucketOne]), [bucketOne])

  const valueToUse = useMemo(() => ({ buckets: [bucketOne], bucketsTotal }), [bucketOne, bucketsTotal])
  return <TreasuryContext.Provider value={valueToUse}>{children}</TreasuryContext.Provider>
}

export const useTreasuryContext = () => useContext(TreasuryContext)

export const TreasuryContextProviderWithPrices = withPricesContextProvider(TreasuryContextProvider)
