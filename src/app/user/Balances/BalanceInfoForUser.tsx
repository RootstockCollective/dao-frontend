import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { SupportedTokens } from '@/lib/contracts'
import { BalanceInfo } from '@/components/BalanceInfo'
import Big from '@/lib/big'
import { formatCurrency } from '@/lib/utils'

interface Props {
  symbol: SupportedTokens
}

/**
 * Component to display balance information for a user.
 * It shows the total balance of a specific token, its price, and the equivalent USD value.
 * @param symbol
 * @constructor
 */
export const BalanceInfoForUser = ({ symbol }: Props) => {
  const { balances, prices } = useBalancesContext()

  const symbolToUse = balances[symbol]?.symbol
  const price = prices[symbol]?.price || 0
  const userBalance = Big(balances[symbol]?.balance || 0)
  const fiatAmount = formatCurrency(userBalance.mul(price), { showCurrency: true })

  return (
    <BalanceInfo
      title={symbolToUse}
      amount={balances[symbol]?.formattedBalance}
      symbol={symbolToUse}
      tooltipContent={`Token Price: ${formatCurrency(price)}`}
      fiatAmount={fiatAmount}
    />
  )
}
