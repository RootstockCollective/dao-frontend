import { FC } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/TypographyNew/Typography'
import { formatFiatAmount, getFiatAmount } from '@/app/collective-rewards/rewards/utils/formatter'
import { BigSource } from 'big.js'

type AvailableBackingUSDProps = {
  className?: string
  amount: bigint
  price: BigSource
}

export const AvailableBackingUSD: FC<AvailableBackingUSDProps> = ({ 
  className, 
  amount, 
  price 
}) => {
  const fiatAmount = getFiatAmount(amount, price)
  const formattedFiatAmount = formatFiatAmount(fiatAmount, 'USD')

  return (
    <Typography 
      variant="body-xs" 
      className={cn('text-v3-text-60', className)}
    >
      {formattedFiatAmount}
    </Typography>
  )
} 