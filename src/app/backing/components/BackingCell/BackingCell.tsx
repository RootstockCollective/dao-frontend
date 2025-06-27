import { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/TypographyNew/Typography'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils/formatter'
import { BigSource } from 'big.js'
import { AvailableBackingUSD } from '../AvailableBackingUSD/AvailableBackingUSD'
import { RIFToken } from '../RIFToken/RIFToken'
import { Metric } from '@/components/Metric/Metric'

type BackingCellState = 'activated' | 'changing' | 'deactivated'

type BackingCellProps = {
  className?: string
  amount: bigint
  price: BigSource
  title: ReactNode
  state?: BackingCellState
}

export const BackingCell: FC<BackingCellProps> = ({
  className,
  amount,
  price,
  title,
  state = 'activated',
}) => {
  const formattedAmountOnly = formatSymbol(amount, 'stRIF')

  const getBackgroundStyle = () => {
    switch (state) {
      case 'deactivated':
        return 'bg-[var(--Background-60,#37322F)]'
      case 'activated':
      case 'changing':
      default:
        return 'bg-[var(--Background-80,#25211E)]'
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-end gap-4 flex-1 py-3 px-2',
        'rounded',
        getBackgroundStyle(),
        className,
      )}
      data-testid="BackingCell"
    >
      <Metric
        title={title}
        content={
          <div className="flex flex-col items-start gap-[-2px] self-stretch">
            <div className="flex h-10 items-baseline self-stretch">
              <div className="w-[76px] flex">
                <Typography variant="h2" className="leading-[30px] text-[var(--Text-100,#FFF)]">
                  {formattedAmountOnly}
                </Typography>
              </div>
              <div className="w-[76px]"></div>
              <div className="flex">
                <RIFToken size={20} textClassName="text-base text-white font-normal" />
              </div>
            </div>
            <AvailableBackingUSD
              amount={amount}
              price={price}
              className="self-stretch font-rootstock-sans font-medium text-sm leading-[20.3px] text-[var(--Background-0,#ACA39D)]"
            />
          </div>
        }
      />
    </div>
  )
}
