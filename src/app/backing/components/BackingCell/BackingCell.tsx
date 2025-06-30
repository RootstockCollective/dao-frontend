import { FC, ReactNode, useContext } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/TypographyNew/Typography'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils/formatter'
import { RIFToken } from '../RIFToken/RIFToken'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { Address } from 'viem'
import { usePricesContext } from '@/shared/context/PricesContext'
import { RIF } from '@/lib/constants'

type BackingCellState = 'activated' | 'changing' | 'deactivated'

type BackingCellProps = {
  className?: string
  title: ReactNode
  state?: BackingCellState
  builderAddress: Address
}

export const BackingCell: FC<BackingCellProps> = ({
  className,
  title,
  state = 'activated',
  builderAddress,
}) => {
  const { prices } = usePricesContext()
  const {
    state: { allocations },
  } = useContext(AllocationsContext)

  const amount = allocations[builderAddress] ?? 0n
  const rifPrice = prices[RIF]?.price ?? 0
  const formattedAmountOnly = formatSymbol(amount, 'stRIF')
  const usdAmount = getFiatAmount(amount, rifPrice)

  return (
    <div
      className={cn(
        'flex justify-end items-end gap-2',
        className,
      )}
      data-testid="BackingCell"
    >
      <div className="flex flex-col items-end gap-[-2px]">
        <Typography
          variant="h2"
          className={cn('leading-8', amount > 0n ? 'text-text-100' : 'text-bg-20')}
        >
          {formattedAmountOnly}
        </Typography>
        {amount > 0n && (
          <Typography
            variant="body"
            className="font-rootstock-sans font-medium text-sm leading-5 text-bg-0"
          >
            {usdAmount.toFixed(2)}
          </Typography>
        )}
      </div>
      <div className="flex flex-col justify-between items-end gap-2">
        <RIFToken size={20} textClassName="hidden" />
        <Typography
          variant="body"
          className="font-rootstock-sans font-medium text-sm leading-5 text-bg-0"
        >
          USD
        </Typography>
      </div>
    </div>
  )
}
