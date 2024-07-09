import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { SupportedTokens } from '@/lib/contracts'

interface Props {
  symbol: SupportedTokens
}

export const RenderTotalBalance = ({ symbol }: Props) => {
  const { balances, prices } = useBalancesContext()
  const token = balances[symbol]
  return (
    <div>
      <p>
        {token.balance} {token.symbol}
      </p>
      <p>= $ {prices[symbol].price * Number(token.balance) ?? 0}</p>
    </div>
  )
}
