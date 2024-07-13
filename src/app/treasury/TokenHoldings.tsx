import { TreasurySymbolsSupported, useTreasuryContext } from '@/app/treasury/TreasuryContext'

interface TokenHoldingsProps {
  symbol: TreasurySymbolsSupported
}

export const TokenHoldings = ({ symbol }: TokenHoldingsProps) => {
  const { bucketsTotal } = useTreasuryContext()
  return (
    <p>
      {bucketsTotal[symbol]} {symbol}
    </p>
  )
}
