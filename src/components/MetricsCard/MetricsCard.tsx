import { FC } from 'react'
import { Label } from '../Typography'
import classNames from 'classnames'
import { Paragraph } from '../Typography/Paragraph'

interface MetricsCardProps {
  /**
   * The title of the card, usually indicating the type of balance.
   */
  title: string
  /**
   * The amount in tokens, e.g., `136.26 RIF`.
   */
  amount: string
  /**
   * The equivalent amount in fiat currency, e.g., `= $50.45`.
   */
  fiatAmount?: string

  /**
   * Whether the card should have a border or not.
   */
  borderless?: boolean
}

const DEFAULT_CLASSES =
  'h-[7.5rem] w-[16.8125rem] pt-[12px] px-[16px] pb-[21px] flex flex-col justify-between'

/**
 * Card for displaying balance and corresponding (fiat) value.
 */
export const MetricsCard: FC<MetricsCardProps> = ({ title, amount, fiatAmount, borderless = false }) => {
  const borderClasses = borderless ? '' : 'border border-white border-opacity-40 rounded-lg'
  return (
    <div className={classNames(DEFAULT_CLASSES, borderClasses)}>
      <Label className="text-sm text-[14px] tracking-wider">{title}</Label>
      <Paragraph variant="semibold" className="text-[2rem] leading-[2.5rem]">
        {amount}
      </Paragraph>
      <Label className="text-[13px] text-white text-opacity-80 leading-4">{fiatAmount}</Label>
    </div>
  )
}
