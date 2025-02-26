import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography'
import { SupportedTokens } from '@/lib/contracts'
import { formatCurrency, formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'

interface Props {
  symbol: SupportedTokens
  context?: string
}

export const RenderTotalBalance = ({ symbol, context }: Props) => {
  const { balances, prices } = useBalancesContext()
  const token = balances[symbol]
  const tokenBalance = Big(token.balance)
  const tokenBalanceRounded = symbol === 'RBTC' ? tokenBalance.toFixed(8) : tokenBalance.floor()
  return (
    <>
      <Paragraph size="small" className="flex flex-row" data-testid={`${context}${token.symbol}_Balance`}>
        {formatNumberWithCommas(tokenBalanceRounded)} {token.symbol}
        <TokenImage symbol={token.symbol} className="ml-[8px]" />
      </Paragraph>
      {prices[symbol] && (
        <Paragraph size="small" className="text-zinc-500" data-testid={`${context}${token.symbol}_USD`}>
          = USD {formatCurrency(tokenBalance.mul(prices[symbol].price)) ?? 0}
        </Paragraph>
      )}
    </>
  )
}
