import { CommonComponentProps } from '@/components/commonProps'
import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { RIF } from '@/lib/constants'
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
      className={cn('flex justify-end gap-2', showUsd ? 'items-end' : 'items-center', className)}
      data-testid="BackingCell"
    >
      <div className="flex flex-col items-end">
        <Span variant="body" className={cn('text-right')}>
          {formattedAmount}
        </Span>
        {showUsd && (
          <Span variant="body-xs" className="text-right text-v3-bg-accent-40">
            {formattedUsdAmount}
          </Span>
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
          <Span variant="body-xs" className="text-v3-bg-accent-40">
            USD
          </Span>
        )}
      </div>
    </div>
  )
}
