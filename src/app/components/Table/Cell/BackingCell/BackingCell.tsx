import { CommonComponentProps } from '@/components/commonProps'
import { TokenImage } from '@/components/TokenImage'
import { Typography } from '@/components/TypographyNew/Typography'
import { RIF } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export interface BackingCellProps extends CommonComponentProps {
  amount: bigint
  formattedAmount: string
  formattedUsdAmount: string
}

export const BackingCell = ({
  className,
  amount,
  formattedAmount,
  formattedUsdAmount,
}: BackingCellProps): ReactNode => {
  if (amount === 0n) {
    return null
  }

  return (
    <div className={cn('flex justify-end items-end gap-2', className)} data-testid="BackingCell">
      <div className="flex flex-col items-end">
        <Typography
          variant="body"
          className={cn('font-rootstock-sans text-base font-normal leading-6 text-right')}
        >
          {formattedAmount}
        </Typography>
        <Typography
          variant="body"
          className="font-rootstock-sans text-xs font-normal leading-[18px] text-right text-v3-bg-accent-40"
        >
          {formattedUsdAmount}
        </Typography>
      </div>
      <div className="flex flex-col items-start gap-1">
        <div className="flex justify-center items-center aspect-square">
          <TokenImage symbol={RIF} />
        </div>
        <Typography
          variant="body"
          className="font-rootstock-sans text-xs font-normal leading-[18px] text-v3-bg-accent-40"
        >
          USD
        </Typography>
      </div>
    </div>
  )
}
