import { CommonComponentProps } from '@/components/commonProps'
import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography/Span'
import { BaseTypography } from '@/components/Typography/Typography'
import { RIF } from '@/lib/tokens'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export interface BackingCellProps extends CommonComponentProps {
  amount: bigint
  formattedAmount: string
  formattedUsdAmount: string
  emptyPlaceholder?: ReactNode
  showUsd?: boolean
  showTokenLabel?: boolean
}

export const BackingCell = ({
  className,
  amount,
  formattedAmount,
  formattedUsdAmount,
  emptyPlaceholder = null,
  showUsd = true,
  showTokenLabel = false,
}: BackingCellProps): ReactNode => {
  if (amount === 0n) {
    return emptyPlaceholder
  }

  return (
    <div
      className={cn('flex justify-end gap-2', showUsd ? 'items-end' : 'items-center')}
      data-testid="BackingCell"
    >
      <div className="flex flex-col items-end">
        <BaseTypography
          variant="body"
          className={cn('font-rootstock-sans text-base font-normal leading-6 text-right')}
        >
          {formattedAmount}
        </BaseTypography>
        {showUsd && (
          <BaseTypography
            variant="body"
            className="font-rootstock-sans text-xs font-normal leading-[18px] text-right text-v3-bg-accent-40"
          >
            {formattedUsdAmount}
          </BaseTypography>
        )}
      </div>
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-1">
          <div className="flex justify-center items-center aspect-square">
            <TokenImage symbol={RIF} />
          </div>
          {showTokenLabel && <Span variant="body-s">stRIF</Span>}
        </div>
        {showUsd && (
          <BaseTypography
            variant="body"
            className="font-rootstock-sans text-xs font-normal leading-[18px] text-v3-bg-accent-40"
          >
            USD
          </BaseTypography>
        )}
      </div>
    </div>
  )
}
