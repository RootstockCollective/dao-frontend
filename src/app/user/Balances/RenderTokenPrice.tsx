import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { SupportedTokens } from '@/lib/contracts'

interface Props {
  symbol: SupportedTokens
}

export const RenderTokenPrice = ({ symbol }: Props) => {
  const { prices } = useBalancesContext()
  return <p>= $ {prices[symbol]?.price ?? 0}</p>
}
