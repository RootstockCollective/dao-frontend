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
          variant="body"
          className={cn(
            'font-rootstock-sans text-base font-normal leading-6 text-right',
            amount > 0n ? 'text-text-100' : 'text-bg-20'
          )}
        >
          {formattedAmountOnly}
        </Typography>
        {amount > 0n && (
          <Typography
            variant="body"
            className="font-rootstock-sans text-xs font-normal leading-[18px] text-right text-bg-0"
          >
            {usdAmount.toFixed(2)}
          </Typography>
        )}
      </div>
      <div className="flex flex-col items-start gap-[2px]">
        <div className="flex w-4 h-4 p-[4.75px] justify-center items-center aspect-square rounded-[60px] bg-[#4B5CF0] flex-shrink-0">
          <RIFToken size={6.5} textClassName="hidden" />
        </div>
        <Typography
          variant="body"
          className="font-rootstock-sans text-xs font-normal leading-[18px] text-bg-0"
        >
          USD
        </Typography>
      </div>
    </div>
  )
}
