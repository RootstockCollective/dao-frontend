import { FC, useContext } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/TypographyNew/Typography'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils/formatter'
import { formatCurrency } from '@/lib/utils'
import { RIFToken } from '../RIFToken/RIFToken'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { Address } from 'viem'
import { usePricesContext } from '@/shared/context/PricesContext'
import { RIF } from '@/lib/constants'

type BackingCellProps = {
  className?: string
  builderAddress: Address
}

export const BackingCell: FC<BackingCellProps> = ({ className, builderAddress }) => {
  const { prices } = usePricesContext()
  const {
    state: { allocations },
  } = useContext(AllocationsContext)

  const amount = allocations[builderAddress] ?? 0n
  const rifPrice = prices[RIF]?.price ?? 0
  const formattedAmount = formatSymbol(amount, 'stRIF')
  const usdAmount = getFiatAmount(amount, rifPrice)
  const formattedUsdAmount = formatCurrency(usdAmount, { currency: 'USD' })

  return (
    <div className={cn('flex justify-end items-end gap-2', className)} data-testid="BackingCell">
      <div className="flex flex-col items-end gap-0.5">
        <Typography
          variant="body"
          className={cn(
            'font-rootstock-sans text-base font-normal leading-6 text-right',
            amount > 0n ? 'text-v3-text-100' : 'text-v3-bg-accent-20',
          )}
        >
          {formattedAmount}
        </Typography>
        {amount > 0n && (
          <Typography
            variant="body"
            className="font-rootstock-sans text-xs font-normal leading-[18px] text-right text-v3-bg-accent-0"
          >
            {formattedUsdAmount}
          </Typography>
        )}
      </div>
      <div className="flex flex-col items-start gap-0.5">
        <div className="flex w-4 h-4 p-[4.75px] justify-center items-center aspect-square rounded-full bg-brand-rif-blue flex-shrink-0">
          <RIFToken size={6.5} textClassName="hidden" />
        </div>
        <Typography
          variant="body"
          className="font-rootstock-sans text-xs font-normal leading-[18px] text-v3-bg-accent-0"
        >
          USD
        </Typography>
      </div>
    </div>
  )
}
