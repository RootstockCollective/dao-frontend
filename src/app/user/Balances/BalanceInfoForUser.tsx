import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { BalanceInfo } from '@/components/BalanceInfo'
import { Button } from '@/components/Button'
import { Paragraph } from '@/components/Typography'
import Big from '@/lib/big'
import { NativeCurrency, RBTC, Token, TOKENS, type TokenSymbol } from '@/lib/tokens'
import { formatCurrency, formatCurrencyWithLabel } from '@/lib/utils'
import { requestProviderToAddToken } from '@/shared/utils'
import { HTMLAttributes, useState } from 'react'

interface TooltipComponentProps {
  text: string
  token: Omit<Token, 'abi'> | NativeCurrency
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
    <div className="p-1" data-testid="TokenPriceTooltip">
      <Paragraph variant="body-s">{text}</Paragraph>
      {!error && !isRBTC ? (
        <Button
          className="mt-2 border-[1px] border-solid border-bg-100"
          variant="transparent"
          onClick={addTokenToWallet}
          textClassName="text-bg-100"
          data-testid="AddToWalletButton"
        >
          Add to wallet
        </Button>
      ) : (
        <Paragraph variant="body-s">{error}</Paragraph>
      )}
    </div>
  )
}

interface Props {
  symbol: TokenSymbol
  className?: HTMLAttributes<HTMLDivElement>['className']
}

/**
 * Component to display balance information for a user.
 * It shows the total balance of a specific token, its price, and the equivalent USD value.
 * @param symbol
 * @constructor
 */
export const BalanceInfoForUser = ({ symbol, className }: Props) => {
  const { balances, prices } = useBalancesContext()

  const symbolToUse = balances[symbol]?.symbol as TokenSymbol
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
          token={{ symbol: symbolToUse, decimals: 18, address: TOKENS[symbol].address }}
          isRBTC={symbol === RBTC}
        />
      }
      fiatAmount={fiatAmount}
      className={className}
    />
  )
}
