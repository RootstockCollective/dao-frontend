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
  'data-testid'?: string
}

const DEFAULT_CLASSES = 'h-min-[79px] w-full py-[12px] px-[12px] flex flex-col bg-foreground'

/**
 * Card for displaying balance and corresponding (fiat) value.
 */
export const MetricsCard: FC<MetricsCardProps> = ({
  title,
  amount,
  fiatAmount,
  borderless = false,
  contractAddress,
  'data-testid': dataTestId,
}) => {
  const borderClasses = borderless ? '' : 'border border-white border-opacity-40 rounded-lg'
  return (
    <div className={cn(DEFAULT_CLASSES, borderClasses)} data-testid={dataTestId || 'MetricsCard'}>
      {typeof title === 'string' ? (
        <div>
          <Paragraph
            variant="normal"
            className="text-[16px] tracking-wide overflow-hidden whitespace-nowrap text-ellipsis"
            fontFamily="rootstock-sans"
          >
            {title}
          </Paragraph>
        </div>
      ) : (
        title
      )}
      <div className="h-12 flex items-center">
        <Paragraph variant="semibold" className="text-[24px] leading-none text-primary" data-testid="Amount">
          {amount}
        </Paragraph>
      </div>
      {fiatAmount && (
        <Span variant="light" className="text-[13px] text-opacity-80 leading-4" data-testid="FiatAmount">
          {fiatAmount}
        </Span>
      )}
      {contractAddress && (
        <a href={`${EXPLORER_URL}/address/${contractAddress}`} target="_blank" className="mt-2">
          <BoxIcon size={20} className="inline-block mr-1" />
          <Span className="underline" size="small">
            {shortAddress(contractAddress)}
          </Span>
        </a>
      )}
    </div>
  )
}
