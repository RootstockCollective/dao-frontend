import { cn, shortAddress } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { Paragraph } from '../Typography/Paragraph'
import { Address } from 'viem'
import { BoxIcon } from 'lucide-react'
import { Span } from '../Typography'
import { EXPLORER_URL } from '@/lib/constants'

interface MetricsCardProps {
  /**
   * The title of the card, usually indicating the type of balance.
   */
  title: ReactNode
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

  /**
   * The address of the contract to link to.
   */
  contractAddress?: Address
}

const DEFAULT_CLASSES = 'h-[7.5rem] w-full py-[8px] px-[16px] flex flex-col'

/**
 * Card for displaying balance and corresponding (fiat) value.
 */
export const MetricsCard: FC<MetricsCardProps> = ({
  title,
  amount,
  fiatAmount,
  borderless = false,
  contractAddress,
}) => {
  const borderClasses = borderless ? '' : 'border border-white border-opacity-40 rounded-lg'
  return (
    <div className={cn(DEFAULT_CLASSES, borderClasses)}>
      {typeof title === 'string' ? (
        <div>
          <Paragraph
            variant="normal"
            className="text-[14px] tracking-wider overflow-hidden whitespace-nowrap text-ellipsis"
          >
            {title}
          </Paragraph>
        </div>
      ) : (
        title
      )}
      <div className="h-12 flex items-center">
        <Paragraph variant="semibold" className="text-[2rem] leading-none">
          {amount}
        </Paragraph>
      </div>
      <Paragraph variant="normal" className="text-[13px] text-white text-opacity-80 leading-4">
        {fiatAmount}
      </Paragraph>
      {contractAddress && (
        <a href={`${EXPLORER_URL}/address/${contractAddress}`} target="_blank">
          <BoxIcon size={20} className="inline-block mr-1" />
          <Span className="underline" size="small">
            {shortAddress(contractAddress)}
          </Span>
        </a>
      )}
    </div>
  )
}
