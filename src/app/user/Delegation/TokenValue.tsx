import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { SupportedTokens } from '@/lib/contracts'
import { Paragraph } from '@/components/Typography'
import { formatCurrency, toFixed } from '@/lib/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'

interface TokenValueProps {
  symbol: SupportedTokens
  amount: bigint | number
  shouldFormatBalance?: boolean
}

export const TokenValue = ({ symbol, amount, shouldFormatBalance = false }: TokenValueProps) => {
  const { prices } = useBalancesContext()
  const amountFormatted = shouldFormatBalance ? formatBalanceToHuman(amount) : amount
  const price = prices[symbol]?.price || 0
  const value = price * Number(amountFormatted)

  return (
    <>
      <Paragraph size="small">
        {toFixed(amountFormatted.toString())} {symbol}
      </Paragraph>
      {prices[symbol] && (
        <Paragraph size="small" className="text-zinc-500">
          = USD {formatCurrency(value) ?? 0}
        </Paragraph>
      )}
    </>
  )
}
