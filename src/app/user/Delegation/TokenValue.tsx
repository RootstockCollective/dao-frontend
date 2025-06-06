import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { SupportedTokens } from '@/lib/contracts'
import { Paragraph } from '@/components/Typography'
import { formatCurrency, formatNumberWithCommas } from '@/lib/utils/utils'
import { TokenImage } from '@/components/TokenImage'
import Big, { round } from '@/lib/big'

interface TokenValueProps {
  symbol: SupportedTokens
  amount: string
}

export const TokenValue = ({ symbol, amount }: TokenValueProps) => {
  const { prices } = useBalancesContext()
  const price = Big(prices[symbol]?.price ?? 0)
  const value = price.mul(amount)

  return (
    <>
      <Paragraph size="small" className="flex flex-row" data-testid={`${symbol}_Balance`}>
        {formatNumberWithCommas(round(amount, undefined, Big.roundDown))} {symbol}
        <TokenImage symbol={symbol} className="ml-[8px]" />
      </Paragraph>
      {prices[symbol] && (
        <Paragraph size="small" className="text-zinc-500" data-testid={`${symbol}_USD`}>
          = USD {formatCurrency(value ?? 0)}
        </Paragraph>
      )}
    </>
  )
}
