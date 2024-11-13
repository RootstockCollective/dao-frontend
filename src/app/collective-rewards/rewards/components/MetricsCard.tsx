import { cn } from '@/lib/utils'
import { FC, HTMLAttributes, ReactNode } from 'react'
import { Address } from 'viem'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Typography } from '@/components/Typography'

type MetricsCardRow = {
  amount: string
  fiatAmount?: string
  children?: ReactNode
}

export const TokenMetricsCardRow: FC<MetricsCardRow> = ({ amount, fiatAmount, children }) => (
  <MetricsCardRow>
    <div className="flex-1 min-w-0">
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
      {fiatAmount && (
        <Typography
          tagVariant="label"
          className="text-[14px] font-rootstock-sans text-disabled-primary"
          lineHeight="14px"
          data-testid="FiatAmount"
        >
          {fiatAmount}
        </Typography>
      )}
    </div>
    {children}
  </MetricsCardRow>
)

type MetricsCardProps = {
  /**
   * Whether the card should have a border or not.
   */
  borderless?: boolean

  /**
   * The address of the contract to link to.
   */
  contractAddress?: Address
  dataTestId?: string

  /**
   * The children of the card. Usually a MetricsCardRow.
   */
  children?: ReactNode

  /**
   * Additional classes to apply to the card.
   */
  className?: HTMLAttributes<HTMLDivElement>['className']
}

const DEFAULT_CLASSES = 'h-min-[79px] w-full py-[12px] px-[12px] flex flex-col bg-foreground'

/**
 * Card for displaying balance and corresponding (fiat) value.
 */
export const MetricsCard: FC<MetricsCardProps> = ({
  borderless = false,
  children,
  dataTestId,
  className,
}) => {
  const borderClasses = borderless ? '' : 'border border-white border-opacity-40 rounded-lg'
  return (
    <div className={cn(DEFAULT_CLASSES, borderClasses, className)} data-testid={dataTestId + '_MetricsCard'}>
      {children}
    </div>
  )
}

export const MetricsCardTitle: FC<{ title: string; 'data-testid': string }> = ({
  title,
  'data-testid': dataTestId,
}) => (
  <Typography
    tagVariant="label"
    className="text-[16px] font-normal tracking-wide overflow-hidden whitespace-nowrap text-ellipsis"
    data-testid={`${dataTestId}_MetricsCardTitle`}
  >
    {title}
  </Typography>
)

type MetricsCardContentProps = {
  children: ReactNode
}

export const MetricsCardContent: FC<MetricsCardContentProps> = ({ children }) => (
  <Typography
    tagVariant="h2"
    paddingBottom="2px"
    paddingTop="10px"
    lineHeight="28.8px"
    fontFamily="kk-topo"
    className="text-[48px] text-primary font-normal"
    data-testid="Content"
  >
    {children}
  </Typography>
)

export const MetricsCardRow: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="flex flex-row w-full items-center">{children}</div>
)

export const MetricsCardWithSpinner = withSpinner(MetricsCard)
