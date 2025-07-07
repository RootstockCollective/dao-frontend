import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/TypographyNew'

// FIXME: create the stories for this component
export const TokenAmount = ({
  amount,
  tokenSymbol,
  amountInFiat,
}: {
  amount: string
  tokenSymbol: string
  amountInFiat: string
}) => {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        <div>{amount}</div>
        <TokenImage symbol={tokenSymbol} size={16} />
        <Span>{tokenSymbol}</Span>
      </div>
      <Span variant="body-s" bold className="text-bg-0 mt-1">
        {amountInFiat}
      </Span>
    </div>
  )
}
