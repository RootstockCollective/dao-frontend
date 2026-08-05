import { Header, Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { cn, formatNumberWithCommas } from '@/lib/utils'

/**
 * Dark glass, not light. The card sits on the bright part of the gradient, so a white overlay
 * washes out and the white text loses contrast — it has to darken what is behind it.
 */
const GLASS_STYLE =
  'rounded-2xl bg-bg-100/65 shadow-[inset_0px_0px_14px_0px_rgba(255,255,255,0.12)] backdrop-blur-md'

interface WalletCardProps {
  rifBalance: string
  rbtcBalance: string
  needsRif: boolean
  className?: string
}

/**
 * Live snapshot of what the user holds, sitting on the gradient panel.
 *
 * Reads current balances rather than a snapshot on purpose: the whole flow sends people off to
 * a DEX in another tab, and watching `0 RIF` turn into a real balance when they come back is
 * the reward for having gone.
 */
export const WalletCard = ({ rifBalance, rbtcBalance, needsRif, className }: WalletCardProps) => (
  <div className={cn('p-4', GLASS_STYLE, className)} data-testid="wallet-info">
    <Header variant="h1" className="text-text-100 flex flex-row items-end gap-2" caps>
      {formatNumberWithCommas(Big(rifBalance).toFixedNoTrailing(2))}
      <Span variant="body" bold className="text-text-100 pb-1">
        RIF
      </Span>
    </Header>

    <Paragraph variant="body-s" className="text-text-100 mt-1">
      {needsRif ? 'You need RIF to stake' : 'Ready to stake'}
    </Paragraph>

    <div className="border-text-100/30 mt-4 flex flex-row items-center justify-between border-t pt-3">
      <Paragraph variant="body-s" className="text-text-100">
        rBTC · gas
      </Paragraph>
      <Paragraph variant="body-s" className="text-text-100">
        {formatNumberWithCommas(Big(rbtcBalance).toFixedNoTrailing(6))}
      </Paragraph>
    </div>
  </div>
)
