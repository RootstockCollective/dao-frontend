import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import Big from '@/lib/big'
import { cn, formatNumberWithCommas } from '@/lib/utils'

interface TokenAmountDisplayProps {
  label: string
  amount: string
  tokenSymbol: string
  amountInCurrency?: string
  balance?: string
  className?: string
  isFlexEnd?: boolean
}

export const TokenAmountDisplay = ({
  label,
  amount,
  tokenSymbol,
  amountInCurrency,
  balance,
  className = '',
  isFlexEnd = false,
}: TokenAmountDisplayProps) => {
  return (
    <div className={cn('flex-1', isFlexEnd ? 'flex-col md:items-end' : 'mb-4 md:mb-0', className)}>
      <Label variant="tag" className="text-bg-0">
        {label}
      </Label>
      <div className="flex items-center gap-2 mt-2">
        <Header variant="h1" className="font-bold">
          {formatNumberWithCommas(Big(amount).toFixedNoTrailing(8))}
        </Header>
        <TokenImage symbol={tokenSymbol} size={24} />
        <Span variant="body-l" bold>
          {tokenSymbol}
        </Span>
      </div>
      {amountInCurrency ? (
        <Span variant="body-s" bold className="text-bg-0 mt-1">
          {amountInCurrency}
        </Span>
      ) : (
        <br />
      )}
      {balance && (
        <div className="flex items-center gap-2 mt-4">
          <TokenImage symbol={tokenSymbol} size={12} />
          <Paragraph variant="body-s" className="text-bg-0">
            Balance: {formatNumberWithCommas(Big(balance).toFixedNoTrailing(8))}
          </Paragraph>
        </div>
      )}
    </div>
  )
}
