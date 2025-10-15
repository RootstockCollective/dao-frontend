import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import Big from '@/lib/big'
import { TokenSymbol } from '@/lib/tokens'
import { formatNumberWithCommas } from '@/lib/utils'

interface Props {
  label: string
  amount: string
  tokenSymbol: TokenSymbol
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
  const formattedBalance = balance ? formatNumberWithCommas(Big(balance).toFixedNoTrailing(8)) : undefined

  return (
    <TokenAmountDisplay
      className={className}
      label={label}
      amount={formattedAmount}
      tokenSymbol={tokenSymbol}
      amountInCurrency={amountInCurrency}
      balance={formattedBalance}
      isFlexEnd={isFlexEnd}
    />
  )
}
