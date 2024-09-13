import { TreasurySymbolsSupported, useTreasuryContext } from '@/app/treasury/TreasuryContext'
import { formatCurrency, toFixed } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'

interface TokenHoldingsProps {
  symbol: TreasurySymbolsSupported
}

export const TokenHoldings = ({ symbol }: TokenHoldingsProps) => {
  const { bucketsTotal } = useTreasuryContext()
  const { prices } = usePricesContext()

  return (
    <>
      <p>
        {toFixed(bucketsTotal[symbol])} {symbol}
      </p>
      {prices[symbol] && (
        <p className="text-zinc-500">
          = USD {formatCurrency(prices[symbol].price * Number(bucketsTotal[symbol]) ?? 0)}
        </p>
      )}
    </>
  )
}
