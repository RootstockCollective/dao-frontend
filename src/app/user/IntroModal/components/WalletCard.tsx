import { Paragraph, Span } from '@/components/Typography'
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
  needsGas: boolean
  className?: string
}

/**
 * What is still missing, in the user's own words. Both flags matter: keying only off
 * `needsRif` let the most prominent line on the screen say "Ready to stake" to someone the
 * summary step was simultaneously telling they had no gas.
 */
const getStatusLabel = (needsRif: boolean, needsGas: boolean) => {
  if (needsRif && needsGas) {
    return 'You need RIF and a little rBTC'
  }
  if (needsRif) {
    return 'You need RIF to stake'
  }
  if (needsGas) {
    return 'You need rBTC to cover fees'
  }
  return 'Ready to stake'
}

/**
 * Live snapshot of what the user holds, sitting on the gradient panel.
 *
 * Reads current balances rather than a snapshot on purpose: the whole flow sends people off to
 * a DEX in another tab, and watching `0 RIF` turn into a real balance when they come back is
 * the reward for having gone.
 */
export const WalletCard = ({ rifBalance, rbtcBalance, needsRif, needsGas, className }: WalletCardProps) => (
  <div className={cn('p-4', GLASS_STYLE, className)} data-testid="wallet-info">
    {/* Heading typography without heading semantics: a balance is data, not a section title,
        and as an <h1> it outranked the step title and became the dialog's first heading. */}
    <Span variant="h1" caps className="text-text-100 flex flex-row items-end gap-2">
      {formatNumberWithCommas(Big(rifBalance).toFixedNoTrailing(2))}
      <Span variant="body" bold className="text-text-100 pb-1">
        RIF
      </Span>
    </Span>

    <Paragraph variant="body-s" className="text-text-100 mt-1" data-testid="wallet-status">
      {getStatusLabel(needsRif, needsGas)}
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
