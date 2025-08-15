import { useTreasuryContext } from '@/app/treasury/contexts/TreasuryContext'
import { useStRifHoldings } from '@/app/treasury/hooks/useStRifHoldings'
import { BalanceInfo } from '@/components/BalanceInfo'
import { Header } from '@/components/Typography'
import { formatCurrencyWithLabel } from '@/lib/utils'
import Big from '@/lib/big'
import { formatTokenBalance, getTokenBalance } from '@/app/user/Balances/balanceUtils'
import { RBTC, RIF, STRIF, USDRIF } from '@/lib/constants'
import { useGetAddressTokens } from '@/app/user/Balances/hooks/useGetAddressTokens'
import { useAccount } from 'wagmi'
import { useMemo } from 'react'
import { treasuryContracts } from '@/lib/contracts'

type BucketTokenSymbol = typeof RBTC | typeof RIF | typeof USDRIF
type BucketTokenType = 'amount' | 'fiatAmount'

export const CollectiveBalancesSection = () => {
  const { stRifBalance, stRifUsdBalance } = useStRifHoldings()
  const { buckets } = useTreasuryContext()
  const { chainId } = useAccount()

  // Get token data to determine the actual symbol using the GRANTS bucket address
  const { data: tokenData } = useGetAddressTokens(treasuryContracts.GRANTS.address, chainId as number)

  // Get the actual symbol for RIF
  const rifSymbol = useMemo(() => {
    if (tokenData) {
      const rifBalance = getTokenBalance(RIF, tokenData)
      return rifBalance.symbol || RIF
    }
    return RIF
  }, [tokenData])

  const calculateTotal = (symbol: BucketTokenSymbol, type: BucketTokenType) =>
    Object.values(buckets).reduce((total, bucket) => {
      const amount = bucket?.[symbol]?.[type]
      return total.add(amount || 0)
    }, Big(0))

  const rifTotal = calculateTotal(RIF, 'amount').ceil()
  const rifFiatTotal = calculateTotal(RIF, 'fiatAmount')
  const rbtcTotal = calculateTotal(RBTC, 'amount')
  const rbtcFiatTotal = calculateTotal(RBTC, 'fiatAmount').toFixed(2)
  const usdRifTotal = calculateTotal(USDRIF, 'amount')

  return (
    <div className="bg-bg-80 p-6 mt-2">
      <Header variant="h3">THE COLLECTIVE BALANCES</Header>
      <div className="flex flex-row flex-wrap gap-6 mt-10">
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title={`${rifSymbol} total`}
          amount={formatTokenBalance(rifTotal.toString(), RIF)}
          symbol={rifSymbol}
          fiatAmount={formatCurrencyWithLabel(rifFiatTotal)}
          tooltipContent={`This is the grand total of ${rifSymbol} in all parts of the Collective.`}
        />
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title="stRIF total"
          symbol={STRIF}
          amount={formatTokenBalance(stRifBalance.toString(), STRIF)}
          fiatAmount={formatCurrencyWithLabel(stRifUsdBalance)}
          tooltipContent={'This is the grand total of stRIF in all parts of the Collective.'}
        />
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title="USDRIF total"
          amount={formatTokenBalance(usdRifTotal.toString(), USDRIF)}
          symbol={USDRIF}
          fiatAmount={formatCurrencyWithLabel(usdRifTotal)}
          tooltipContent={'This is the grand total of USDRIF in all parts of the Collective.'}
        />
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title={`${RBTC} total`}
          symbol={RBTC}
          amount={formatTokenBalance(rbtcTotal.toString(), RBTC)}
          fiatAmount={formatCurrencyWithLabel(rbtcFiatTotal)}
          tooltipContent={'This is the grand total of rBTC in all parts of the Collective.'}
        />
      </div>
    </div>
  )
}
