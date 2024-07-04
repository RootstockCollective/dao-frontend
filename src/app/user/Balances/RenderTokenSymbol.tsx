import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { getActualUsedSymbol, SymbolsEquivalentKeys } from '@/app/user/Balances/balanceUtils'
import { useMemo } from 'react'

interface Props {
  symbol: SymbolsEquivalentKeys
}

export const RenderTokenSymbol = ({ symbol }: Props) => {
  const { balances } = useBalancesContext()
  return useMemo(() => getActualUsedSymbol(symbol, balances), [symbol])
}
