import { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/TypographyNew/Typography'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils/formatter'
import { BigSource } from 'big.js'
import { AvailableBackingUSD } from '../AvailableBackingUSD/AvailableBackingUSD'
import { StRIFToken } from '../StRIFToken/StRIFToken'

type BackingCellProps = {
  className?: string
  amount: bigint
  price: BigSource
  metric: ReactNode
}

export const BackingCell: FC<BackingCellProps> = ({ className, amount, price, metric }) => {
  const formattedAmountOnly = formatSymbol(amount, 'stRIF')

  return (
    <div
      className={cn(
        'flex flex-wrap items-start content-start gap-3 self-stretch p-3',
        'rounded-b-[4px] border border-solid border-[var(--color-v3-bg-accent-40)]',
        className,
      )}
      data-testid="BackingCell"
    >
      <div className="flex flex-col items-start gap-[-2px] self-stretch">
        <div className="flex h-10 items-center gap-1 self-stretch rounded-[4px]">
          <Typography variant="body" className="font-medium">
            {formattedAmountOnly}
          </Typography>
          <StRIFToken size={20} variant="body" bold={false} />
        </div>
        <AvailableBackingUSD amount={amount} price={price} />
      </div>
    </div>
  )
}
