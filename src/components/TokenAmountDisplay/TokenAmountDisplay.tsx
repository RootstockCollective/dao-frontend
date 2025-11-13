import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { HourglassAnimatedIcon } from '@/components/Icons/HourglassAnimatedIcon'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'

interface Props {
  label?: string
  amount: string
  tokenSymbol: string
  amountInCurrency?: string
  className?: string
  isFlexEnd?: boolean
  balance?: string
  actions?: ReactNode // TODO: @analyse could be children
  status?: 'pending' | 'increasing' | 'decreasing'
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
  status,
}: Props) => {
  const isDesktop = useIsDesktop()
  return (
    <div className={cn('flex-1', isFlexEnd ? 'flex-col md:items-end' : 'mb-4 md:mb-0', className)}>
      {label && (
        <Label variant="tag" className="flex items-center gap-1 text-bg-0" data-testid={`${label}Label`}>
          {label} {status === 'pending' && isDesktop && <HourglassAnimatedIcon color="var(--color-bg-0)" />}
        </Label>
      )}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mt-1">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Header variant={isDesktop ? 'h1' : 'h3'} data-testid={`${label}Amount`}>
                {amount}
              </Header>
              {status === 'pending' && !isDesktop && <HourglassAnimatedIcon color="var(--color-bg-0)" />}
              {status === 'increasing' && <ArrowUpIcon size={16} color="var(--color-success)" />}
              {status === 'decreasing' && <ArrowDownIcon size={16} color="var(--color-error)" />}
            </div>
            <TokenImage symbol={tokenSymbol} size={isDesktop ? 24 : 16} />
            <Span variant={isDesktop ? 'body-l' : 'body-s'} bold data-testid={`${label}Symbol`}>
              {tokenSymbol}
            </Span>
          </div>
          {amountInCurrency && (
            <Span
              variant={isDesktop ? 'body-s' : 'body-xs'}
              bold
              className="text-bg-0"
              data-testid={`${label}Currency`}
            >
              {amountInCurrency}
            </Span>
          )}
        </div>
        {actions}
      </div>
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
