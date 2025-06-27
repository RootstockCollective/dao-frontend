import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import Big from '@/lib/big'
import { cn, formatNumberWithCommas } from '@/lib/utils'

interface Props {
  label: string
  amount: string
  tokenSymbol: string
  amountInCurrency?: string
  balance?: string
  className?: string
  isFlexEnd?: boolean
}

export const StakeTokenAmountDisplay = ({
  label,
  amount,
  tokenSymbol,
  amountInCurrency,
  balance,
  className = '',
  isFlexEnd = false,
}: Props) => {
  const formattedAmount = formatNumberWithCommas(Big(amount).toFixedNoTrailing(8))

  const footer = balance ? (
    <div className="flex items-center gap-2 mt-4">
      <TokenImage symbol={tokenSymbol} size={12} />
      <Paragraph variant="body-s" className="text-bg-0">
        {tokenSymbol} Balance: {formatNumberWithCommas(Big(balance).toFixedNoTrailing(8))}
      </Paragraph>
    </div>
  ) : null

  return (
    <TokenAmountDisplay
      className={className}
      label={label}
      amount={formattedAmount}
      tokenSymbol={tokenSymbol}
      amountInCurrency={amountInCurrency}
      footer={footer}
      isFlexEnd={isFlexEnd}
    />
  )
}
