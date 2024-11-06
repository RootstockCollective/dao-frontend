import { cn, shortAddress } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { Address } from 'viem'
import { BoxIcon } from 'lucide-react'
import { EXPLORER_URL } from '@/lib/constants'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Span, Typography } from '@/components/Typography'

type MetricsCardRow = {
  amount: string
  fiatAmount?: string
}

type MetricsCardProps = {
  /**
   * The title of the card, usually indicating the type of balance.
   */
  title: ReactNode

  data: {
    [token: string]: MetricsCardRow
  }

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

export const MetricsCardRow: FC<MetricsCardRow> = ({ amount, fiatAmount }) => (
  <div>
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
)

/**
 * Card for displaying balance and corresponding (fiat) value.
 */
export const MetricsCard: FC<MetricsCardProps> = ({
  title,
  borderless = false,
  data: { rif, rbtc },
  contractAddress,
  'data-testid': dataTestId,
}) => {
  const borderClasses = borderless ? '' : 'border border-white border-opacity-40 rounded-lg'
  return (
    <div className={cn(DEFAULT_CLASSES, borderClasses)} data-testid={dataTestId || 'MetricsCard'}>
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
      <MetricsCardRow {...rif} />
      <MetricsCardRow {...rbtc} />
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
