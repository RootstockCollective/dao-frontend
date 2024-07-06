import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { useMemo } from 'react'
import { SupportedTokens } from '@/lib/contracts'

interface Props {
  symbol: SupportedTokens
}

export const RenderTokenSymbol = ({ symbol }: Props) => {
  const { balances } = useBalancesContext()
  return useMemo(() => balances[symbol].symbol, [balances, symbol])
}
