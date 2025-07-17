import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { tokenContracts, SupportedTokens } from '@/lib/contracts'
import { useWalletClient } from 'wagmi'
import { BalanceInfo } from '@/components/BalanceInfo'
import Big from '@/lib/big'
import { formatCurrency, formatNumberWithCommas } from '@/lib/utils'

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
  const { data: walletClient } = useWalletClient()

  const onAdd = () => {
    if (walletClient) {
      walletClient.watchAsset({
        type: 'ERC20',
        options: {
          address: tokenContracts[symbol],
          decimals: 18,
          symbol: balances[symbol].symbol,
        },
      })
    }
  }

  const symbolToUse = balances[symbol]?.symbol || ''

  const price = prices[symbol]?.price || 0

  const userBalance = Big(balances[symbol]?.balance || 0)
  const tokenBalanceRounded = symbol === 'RBTC' ? userBalance.toFixed(8) : userBalance.floor()

  const usd = formatCurrency(userBalance.mul(price)) ?? 0

  return (
    <BalanceInfo
      title={symbolToUse}
      amount={formatNumberWithCommas(tokenBalanceRounded)}
      symbol={symbolToUse}
      tooltipContent={`Token Price: ${price}`}
      fiatAmount={`${usd} USD`}
    />
  )
}
