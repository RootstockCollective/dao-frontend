import { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/TypographyNew/Typography'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils/formatter'
import { BigSource } from 'big.js'
import { AvailableBackingUSD } from '../AvailableBackingUSD/AvailableBackingUSD'
import { StRIFToken } from '../StRIFToken/StRIFToken'
import { Metric } from '@/components/Metric/Metric'

type BackingCellProps = {
  className?: string
  amount: bigint
  price: BigSource
  title: ReactNode
}

export const BackingCell: FC<BackingCellProps> = ({ className, amount, price, title }) => {
  const formattedAmountOnly = formatSymbol(amount, 'stRIF')

  return (
    <div
      className={cn(
        'flex flex-col items-end gap-4 flex-1 py-3 px-2',
        'rounded bg-[var(--Background-80,#25211E)]',
        className,
      )}
      data-testid="BackingCell"
    >
      <Metric
        title={title}
        content={
          <div className="flex flex-col items-start gap-[-2px] self-stretch">
            <div className="flex h-10 items-center gap-1 self-stretch">
              <div className="flex w-[154px] gap-2">
                <div className="w-[76px]">
                  <Typography variant="h2" className="leading-[30px] text-[var(--Text-100,#FFF)]">
                    {formattedAmountOnly}
                  </Typography>
                </div>
                <div className="w-[76px]"></div>
              </div>
              <StRIFToken size={20} variant="body" bold={false} />
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
