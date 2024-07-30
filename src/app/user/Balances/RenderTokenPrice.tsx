import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { SupportedTokens } from '@/lib/contracts'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'

interface Props {
  symbol: SupportedTokens
  contextToUse?: 'balances' | 'prices'
}

const CONTEXT_TO_USE = {
  balances: useBalancesContext,
  prices: usePricesContext,
}

export const RenderTokenPrice = ({ symbol, contextToUse = 'balances' }: Props) => {
  const { prices } = CONTEXT_TO_USE[contextToUse]()
  if (!prices[symbol]) {
    return <p>—</p>
  }
  return <p className="text-nowrap">{formatCurrency(prices[symbol]?.price ?? 0)}</p>
}
