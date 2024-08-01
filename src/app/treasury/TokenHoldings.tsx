import { TreasurySymbolsSupported, useTreasuryContext } from '@/app/treasury/TreasuryContext'
import { toFixed } from '@/lib/utils'

interface TokenHoldingsProps {
  symbol: TreasurySymbolsSupported
}

export const TokenHoldings = ({ symbol }: TokenHoldingsProps) => {
  const { bucketsTotal } = useTreasuryContext()
  return (
    <p>
      {toFixed(bucketsTotal[symbol])} {symbol}
    </p>
  )
}
