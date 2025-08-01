import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { SupportedTokens, tokenContracts } from '@/lib/contracts'
import { BalanceInfo } from '@/components/BalanceInfo'
import Big from '@/lib/big'
import { formatCurrency, formatCurrencyWithLabel } from '@/lib/utils'
import { Paragraph } from '@/components/TypographyNew'
import { Button } from '@/components/ButtonNew'
import { useState } from 'react'
import { requestProviderToAddToken } from '@/shared/utils'

interface TooltipComponentProps {
  text: string
  token: {
    address: string
    symbol: string
    decimals: number
  }
  isRBTC: boolean
  error?: string
}

const TooltipComponent = ({ text, token, isRBTC }: TooltipComponentProps) => {
  const [error, setError] = useState<string | null>(null)

  const addTokenToWallet = async () => {
    try {
      const { address, symbol, decimals } = token
      await requestProviderToAddToken({ address, symbol, decimals, tokenType: 'ERC20' })
    } catch (err) {
      console.log('ERROR', err)
      setError('Cannot add token to the wallet')
    }
  }

  return (
    <div className="p-6">
      <Paragraph variant="body-s">{text}</Paragraph>
      {!error && !isRBTC ? (
        <Button
          className="mt-2 border-[1px] border-solid border-bg-100"
          variant="transparent"
          onClick={addTokenToWallet}
          textClassName="text-bg-100"
        >
          {'Add to wallet'}
        </Button>
      ) : (
        <Paragraph variant="body-s">{error}</Paragraph>
      )}
    </div>
  )
}

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
  const fiatAmount = formatCurrencyWithLabel(userBalance.mul(price))

  return (
    <BalanceInfo
      title={symbolToUse}
      amount={balances[symbol]?.formattedBalance}
      symbol={symbolToUse}
      tooltipContent={
        <TooltipComponent
          text={`Token Price: ${formatCurrency(price)}`}
          token={{ symbol: symbolToUse, decimals: 18, address: tokenContracts[symbol] }}
          isRBTC={symbol === 'RBTC'}
        />
      }
      fiatAmount={fiatAmount}
    />
  )
}
