import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils/formatter'
import { CommonComponentProps } from '@/components/commonProps'
import { TokenImage } from '@/components/TokenImage'
import { Typography } from '@/components/TypographyNew/Typography'
import { RIF } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC, useContext } from 'react'
import { Address } from 'viem'

export interface BackingCellProps extends CommonComponentProps {
  builderAddress: Address
}

export const BackingCell: FC<BackingCellProps> = ({ builderAddress, className }) => {
  const { prices } = usePricesContext()
  const {
    state: { allocations },
  } = useContext(AllocationsContext)

  const amount = allocations[builderAddress] ?? 0n
  const rifPrice = prices[RIF]?.price ?? 0
  const formattedAmount = formatSymbol(amount, 'stRIF')
  const formattedUsdAmount = formatCurrency(getFiatAmount(amount, rifPrice), { currency: 'USD' })

  return (
    <div className={cn('flex justify-end items-end gap-2', className)} data-testid="BackingCell">
      <div className="flex flex-col items-end">
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
      <div className="flex flex-col items-start gap-1">
        <div className="flex justify-center items-center aspect-square">
          <TokenImage symbol={RIF} />
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
