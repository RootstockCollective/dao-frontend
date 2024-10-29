import { TreasurySymbolsSupported, useTreasuryContext } from '@/app/treasury/TreasuryContext'
import { Paragraph } from '@/components/Typography'
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
      <Paragraph size="small">
        {Math.ceil(Number(bucketsTotal[symbol]))} {symbol}
      </Paragraph>
      {prices[symbol] && (
        <Paragraph size="small" className="text-zinc-500">
          = USD {formatCurrency(prices[symbol].price * Number(bucketsTotal[symbol])) ?? 0}
        </Paragraph>
      )}
    </>
  )
}
