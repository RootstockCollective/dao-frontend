import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Header, Label } from '@/components/TypographyNew'

import { cn } from '@/lib/utils'
import { FC, HTMLAttributes, ReactNode } from 'react'
import { Address } from 'viem'
import { Tooltip, TooltipProps } from '@/components/Tooltip'

type MetricsCardRow = {
  amount: string
  fiatAmount?: string
  children?: ReactNode
}

export const TokenMetricsCardRow: FC<MetricsCardRow> = ({ amount, fiatAmount, children }) => (
  <MetricsCardRow>
    <div className="flex-1 min-w-0">
      <Header
        variant="h2"
        className="text-[24px] text-primary font-normal pb-[2px] pt-[10px]"
        data-testid="Amount"
      >
        {amount}
      </Header>
      {fiatAmount && (
        <Label
          variant="body-s"
          className="text-[14px] font-rootstock-sans text-disabled-primary"
          data-testid="FiatAmount"
        >
          {fiatAmount}
        </Label>
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
  | (Omit<React.ComponentProps<typeof Label>, 'children'> & {
      title: string | ReactNode
      tooltip?: TooltipProps
      children?: ReactNode
      customLabel?: never
    })
  | (Omit<React.ComponentProps<typeof Label>, 'children'> & {
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
      <Label
        variant="body"
        className={cn(
          'text-[16px] font-normal tracking-wide overflow-hidden whitespace-nowrap text-ellipsis',
          className ?? '',
        )}
        data-testid={`${dataTestId}_MetricsCardTitle`}
        {...rest}
      >
        {title}
      </Label>
    )}

    {tooltip && <Tooltip {...tooltip} />}
    {children}
  </div>
)

type MetricsCardContentProps = {
  children: ReactNode
}

export const MetricsCardContent: FC<MetricsCardContentProps> = ({ children }) => (
  <Header
    variant="h2"
    className="text-[48px] text-primary font-normal pb-[2px] pt-[10px]"
    data-testid="Content"
  >
    {children}
  </Header>
)

export const MetricsCardRow: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="flex flex-row w-full items-center">{children}</div>
)

export const MetricsCardWithSpinner = withSpinner(MetricsCard)
