import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Typography, TypographyProps } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils'
import { FC, HTMLAttributes, ReactNode } from 'react'
import { Address } from 'viem'
import { Tooltip, TooltipProps } from './Tooltip'
import { TokenImage } from '@/components/TokenImage'

type MetricsCardRow = {
  amount: string
  fiatAmount?: string
  children?: ReactNode
}

export const TokenMetricsCardRow: FC<MetricsCardRow> = ({ amount, fiatAmount, children }) => (
  <MetricsCardRow>
    <div className="flex-1 min-w-0">
      <Typography
        variant="h2"
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
          variant="tag"
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

export const TokenMetricsCardRowV2: FC<MetricsCardRow & { symbol: string }> = ({
  amount,
  fiatAmount,
  symbol,
  children,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <Typography variant="h2" style={{ color: 'var(--Text-100, #FFF)' }} data-testid="Amount">
        {amount}
      </Typography>
      <div style={{ display: 'flex', padding: '1px 0px', alignItems: 'center', gap: 3, borderRadius: 4 }}>
        <TokenImage symbol={symbol} size={20} />
        <Typography variant="body-s" style={{ color: 'var(--Text-100, #FFF)', textAlign: 'right' }}>
          {symbol}
        </Typography>
      </div>
    </div>
    <span
      style={{
        alignSelf: 'stretch',
        color: 'var(--Background-0, #ACA39D)',
        fontFamily: 'Rootstock Sans',
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: '150%',
        marginLeft: 0,
        marginRight: 0,
      }}
      data-testid="FiatAmount"
    >
      {fiatAmount}
    </span>
    {children}
  </div>
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
  dataTestId = '',
  className,
  ...rest
}) => {
  const borderClasses = borderless ? '' : 'border border-white/40 rounded-lg'
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
  | (Omit<TypographyProps<'span'>, 'children'> & {
      title: string | ReactNode
      tooltip?: TooltipProps
      children?: ReactNode
      customLabel?: never
    })
  | (Omit<TypographyProps<'span'>, 'children'> & {
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
        variant="tag"
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
    variant="h2"
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
