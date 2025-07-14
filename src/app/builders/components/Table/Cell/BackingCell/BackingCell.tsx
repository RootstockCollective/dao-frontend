import { CommonComponentProps } from '@/components/commonProps'
import { TokenImage } from '@/components/TokenImage'
import { Typography } from '@/components/TypographyNew/Typography'
import { RIF } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { FC } from 'react'

export interface BackingCellProps extends CommonComponentProps {
  amount: bigint
  formattedAmount: string
  formattedUsdAmount: string
}

export const BackingCell: FC<BackingCellProps> = ({
  className,
  amount,
  formattedAmount,
  formattedUsdAmount,
}) => {
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
