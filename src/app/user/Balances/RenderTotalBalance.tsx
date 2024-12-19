import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography'
import { SupportedTokens } from '@/lib/contracts'
import { formatCurrency, toFixed } from '@/lib/utils'

interface Props {
  symbol: SupportedTokens
}

export const RenderTotalBalance = ({ symbol }: Props) => {
  const { balances, prices } = useBalancesContext()
  const token = balances[symbol]
  return (
    <>
      <Paragraph size="small" className="flex flex-row" data-testid={`${token.symbol}_Balance`}>
        {toFixed(token.balance)} {token.symbol}
        <TokenImage symbol={token.symbol} className="ml-[8px]" />
      </Paragraph>
      {prices[symbol] && (
        <Paragraph size="small" className="text-zinc-500" data-testid={`${token.symbol}_USD`}>
          = USD {formatCurrency(prices[symbol].price * Number(token.balance)) ?? 0}
        </Paragraph>
      )}
    </>
  )
}
