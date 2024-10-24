import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { Paragraph } from '@/components/Typography'
import { SupportedTokens } from '@/lib/contracts'
import { formatCurrency, toFixed } from '@/lib/utils'

interface Props {
  symbol: SupportedTokens
}

export const RenderTotalBalance = ({ symbol }: Props) => {
  const { balances, prices } = useBalancesContext()
  const token = balances[symbol]
  return (
    <>
      <Paragraph size="small">
        {toFixed(token.balance)} {token.symbol}
      </Paragraph>
      {prices[symbol] && (
        <Paragraph size="small" className="text-zinc-500">
          = USD {formatCurrency(prices[symbol].price * Number(token.balance)) ?? 0}
        </Paragraph>
      )}
    </>
  )
}
