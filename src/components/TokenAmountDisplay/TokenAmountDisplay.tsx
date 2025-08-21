import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
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
  actions?: ReactNode // TODO: @analyse could be children
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
        <Label variant="tag" className="text-bg-0" data-testid={`${label}Label`}>
          {label}
        </Label>
      )}
      <div className="flex items-center gap-2 mt-2">
        <Header variant="h1" className="font-bold" data-testid={`${label}Amount`}>
          {amount}
        </Header>
        <TokenImage symbol={tokenSymbol} size={24} />
        <Span variant="body-l" bold data-testid={`${label}Symbol`}>
          {tokenSymbol}
        </Span>
        {actions}
      </div>
      {amountInCurrency ? (
        <Span variant="body-s" bold className="text-bg-0 mt-1" data-testid={`${label}Currency`}>
          {amountInCurrency}
        </Span>
      ) : (
        <br />
      )}
      {balance && (
        <div className="flex items-center gap-2 mt-4">
          <TokenImage symbol={tokenSymbol} size={12} />
          <Paragraph variant="body-s" className="text-bg-0" data-testid={`${label}Balance`}>
            {tokenSymbol} Balance: {balance}
          </Paragraph>
        </div>
      )}
    </div>
  )
}
