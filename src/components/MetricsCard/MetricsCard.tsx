import { cn, shortAddress } from '@/lib/utils'
import { FC, HTMLProps, ReactNode } from 'react'
import { Address } from 'viem'
import { BoxIcon } from 'lucide-react'
import { Span, Typography } from '../Typography'
import { EXPLORER_URL } from '@/lib/constants'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'

interface MetricsCardProps extends Omit<HTMLProps<HTMLDivElement>, 'title'> {
  /**
   * The title of the card, usually indicating the type of balance.
   */
  title: ReactNode
  /**
   * The amount in tokens, e.g., `136.26 RIF`.
   */
  amount: ReactNode
  /**
   * The equivalent amount in fiat currency, e.g., `= $50.45`.
   */
  fiatAmount?: ReactNode

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

const DEFAULT_CLASSES = 'h-min-[79px] w-full py-[12px] px-[12px] flex flex-col bg-foreground overflow-hidden'

/**
 * Card for displaying balance and corresponding (fiat) value.
 * @deprecated
 */
export const MetricsCard: FC<MetricsCardProps> = ({
  title,
  amount,
  fiatAmount,
  borderless = false,
  contractAddress,
  'data-testid': dataTestId,
  className,
  ...props
}) => {
  const borderClasses = borderless ? '' : 'border border-white/40 rounded-lg'
  return (
    <div
      {...props}
      className={cn(DEFAULT_CLASSES, borderClasses, className)}
      data-testid={dataTestId || 'MetricsCard'}
    >
      {typeof title === 'string' ? (
        <div>
          <Typography
            tagVariant="label"
            className="text-[16px] font-normal tracking-wide overflow-hidden whitespace-nowrap text-ellipsis"
          >
            {title}
          </Typography>
        </div>
      ) : (
        title
      )}
      <div className="flex items-center">
        {typeof amount === 'string' ? (
          <Typography
            tagVariant="h2"
            paddingBottom="2px"
            paddingTop="10px"
            lineHeight="28.8px"
            fontFamily="kk-topo"
            className="text-[24px] text-primary font-normal"
            data-testid="Amount"
          >
            {amount}
          </Typography>
        ) : (
          amount
        )}
      </div>
      {typeof fiatAmount === 'string' ? (
        <Typography
          tagVariant="label"
          className="text-[14px] font-normal font-rootstock-sans text-disabled-primary leading-none"
          data-testid="FiatAmount"
        >
          {fiatAmount}
        </Typography>
      ) : (
        fiatAmount
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

export const MetricsCardWithSpinner = withSpinner(MetricsCard)
