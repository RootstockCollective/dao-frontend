import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'

interface Props {
  symbol: string
}

export const RenderTotalBalance = ({ symbol }: Props) => {
  const { balances, prices } = useBalancesContext()
  const token = balances[symbol.toLowerCase()]

  return (
    <div>
      <p>
        {token.balance} {token.symbol}
      </p>
      <p>= $ {prices[symbol]?.price ?? 0}</p>
    </div>
  )
}
