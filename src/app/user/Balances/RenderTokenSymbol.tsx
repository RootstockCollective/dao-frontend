import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { tokenContracts, SupportedTokens } from '@/lib/contracts'
import { useWalletClient } from 'wagmi'

interface Props {
  symbol: SupportedTokens
}

export const RenderTokenSymbol = ({ symbol }: Props) => {
  const { balances } = useBalancesContext()
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

  return (
    <p onClick={onAdd} className="cursor-pointer">
      {balances[symbol].symbol}
    </p>
  )
}
