import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Typography, TypographyProps } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, HTMLAttributes, ReactNode } from 'react'
import { Address } from 'viem'
import { Tooltip, TooltipProps } from './Tooltip'

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

export type MetricsCardProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Whether the card should have a border or not.
   */
  borderless?: boolean

  /**
   * The address of the contract to link to.
   */
  contractAddress?: Address
  dataTestId?: string
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
  ...rest
}) => {
  const borderClasses = borderless ? '' : 'border border-white border-opacity-40 rounded-lg'
  return (
    <div
      className={cn(DEFAULT_CLASSES, borderClasses, className)}
      data-testid={dataTestId + '_MetricsCard'}
      {...rest}
    >
      {children}
    </div>
  )
}

export type MetricsCardTitleProps =
  | (Omit<TypographyProps, 'children'> & {
      title: string | ReactNode
      tooltip?: TooltipProps
      children?: ReactNode
      customLabel?: never
    })
  | (Omit<TypographyProps, 'children'> & {
      customLabel: ReactNode
      tooltip?: TooltipProps
      children?: ReactNode
      title?: never
    })

export const MetricsCardTitle: FC<MetricsCardTitleProps> = ({
  title,
  'data-testid': dataTestId,
  tooltip,
  className,
  customLabel,
  children,
  ...rest
}) => (
  <div className="flex gap-1">
    {customLabel ?? (
      <Typography
        tagVariant="label"
        className={cn(
          'text-[16px] font-normal tracking-wide overflow-hidden whitespace-nowrap text-ellipsis',
          className ?? '',
        )}
        data-testid={`${dataTestId}_MetricsCardTitle`}
        {...rest}
      >
        {title}
      </Typography>
    )}

    {tooltip && <Tooltip {...tooltip} />}
    {children}
  </div>
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
