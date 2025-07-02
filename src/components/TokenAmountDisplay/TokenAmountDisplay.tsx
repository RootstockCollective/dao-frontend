import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Span, Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface Props {
  label?: string
  amount: string
  tokenSymbol: string
  amountInCurrency?: string
  className?: string
  isFlexEnd?: boolean
  balance?: string
  actions?: ReactNode
}

export const TokenAmountDisplay = ({
  label,
  amount,
  tokenSymbol,
  amountInCurrency,
  className = '',
  isFlexEnd = false,
  balance,
  actions,
}: Props) => {
  return (
    <div className={cn('flex-1', isFlexEnd ? 'flex-col md:items-end' : 'mb-4 md:mb-0', className)}>
      {label && (
        <Label variant="tag" className="text-bg-0">
          {label}
        </Label>
      )}
      <div className="flex items-center gap-2 mt-2">
        <Header variant="h1" className="font-bold">
          {amount}
        </Header>
        <TokenImage symbol={tokenSymbol} size={24} />
        <Span variant="body-l" bold>
          {tokenSymbol}
        </Span>
        {actions}
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
            {tokenSymbol} Balance: {balance}
          </Paragraph>
        </div>
      )}
    </div>
  )
}
