import { FC } from 'react'

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
  fiatAmount: string
}

/**
 * Card for displaying balance and corresponding (fiat) value.
 */
export const MetricsCard: FC<MetricsCardProps> = ({ title, amount, fiatAmount }) => {
  return (
    <div className="w-[16.8125rem] h-[7.5rem] p-4 border border-white border-opacity-40 rounded-lg flex flex-col justify-between">
      <p className="text-sm font-light">{title}</p>
      <div className="flex flex-col">
        <p className="font-semibold text-[2rem] leading-[2.5rem]">{amount}</p>
        <p className="text-[.8125rem] text-white text-opacity-80 leading-4">{fiatAmount}</p>
      </div>
    </div>
  )
}
