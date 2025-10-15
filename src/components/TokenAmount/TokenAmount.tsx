import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { TokenSymbol } from '@/lib/tokens'

export const TokenAmount = ({
  amount,
  tokenSymbol,
  amountInFiat,
}: {
  amount: string
  tokenSymbol: TokenSymbol
  amountInFiat: string
}) => {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        <div className="text-xl">{amount}</div>
        <div className="flex items-center gap-[0.1875rem]">
          <TokenImage symbol={tokenSymbol} size={16} />
          <Span className="text-sm">{tokenSymbol}</Span>
        </div>
      </div>
      <Span variant="body-xs" bold className="text-bg-0">
        {amountInFiat}
      </Span>
    </div>
  )
}
