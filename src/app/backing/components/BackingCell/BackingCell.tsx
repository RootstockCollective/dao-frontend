import { FC, ReactNode, useContext } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/TypographyNew/Typography'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils/formatter'
import { RIFToken } from '../RIFToken/RIFToken'
import { Metric } from '@/components/Metric/Metric'
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
  const usdDisplay = `${usdAmount.toFixed(2)} USD`

  const getBackgroundStyle = () =>
    state === 'deactivated' ? 'bg-[var(--Background-60,#37322F)]' : 'bg-[var(--Background-80,#25211E)]'

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
            <Typography
              variant="body"
              className="self-stretch font-rootstock-sans font-medium text-sm leading-[20.3px] text-[var(--Background-0,#ACA39D)]"
            >
              {usdDisplay}
            </Typography>
          </div>
        }
      />
    </div>
  )
}
