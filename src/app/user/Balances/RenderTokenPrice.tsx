import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'

interface Props {
  symbol: string
}
export const RenderTokenPrice = ({ symbol }: Props) => {
  const { prices } = useBalancesContext()
  return <p>= $ {prices[symbol.toLowerCase()].price ?? 1}</p>
}
