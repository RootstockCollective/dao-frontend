'use client'

import { Button } from '@/components/Button'
import { SwapIcon } from '@/components/Icons'
import { Tooltip } from '@/components/Tooltip'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { useActionEligibility } from '../hooks/useActionEligibility'
import { ACTIVE_REQUEST_REASON, DEPOSIT_PAUSED_REASON, WITHDRAWAL_PAUSED_REASON } from '../services/constants'

/** Operational block reasons — these hide individual buttons, not the entire component. */
const OPERATIONAL_BLOCK_REASONS = new Set([
  DEPOSIT_PAUSED_REASON,
  WITHDRAWAL_PAUSED_REASON,
  ACTIVE_REQUEST_REASON,
])

/** True when the reason is an eligibility issue (e.g. KYB) rather than an operational pause. */
function isEligibilityBlock(reason: string): boolean {
  return reason.length > 0 && !OPERATIONAL_BLOCK_REASONS.has(reason)
}

interface Props {
  address: string | undefined
  onDeposit?: () => void
  onWithdraw?: () => void
}

/**
 * Renders Deposit/Withdraw buttons and a Swap link.
 * Buttons are hidden when the corresponding operation is paused, and the entire
 * component is hidden when the user fails eligibility (e.g. KYB not approved).
 * When an active request blocks an action, the button stays visible but disabled
 * with a tooltip showing the block reason.
 *
 * @param onDeposit - Called on Deposit click. No-op by default; wired by the deposit modal.
 * @param onWithdraw - Called on Withdraw click. No-op by default; wired by the withdraw modal.
 */
export const BtcVaultActions = ({ address, onDeposit, onWithdraw }: Props) => {
  const { data } = useActionEligibility(address)

  if (!data) return null

  const { canDeposit, canWithdraw, depositBlockReason, withdrawBlockReason } = data

  if (isEligibilityBlock(depositBlockReason) || isEligibilityBlock(withdrawBlockReason)) return null

  const depositVisible = canDeposit || depositBlockReason === ACTIVE_REQUEST_REASON
  const withdrawVisible = canWithdraw || withdrawBlockReason === ACTIVE_REQUEST_REASON

  return (
    <div
      className="flex flex-col gap-4 mt-4 md:flex-row md:items-center w-full"
      data-testid="btc-vault-actions"
    >
      {depositVisible && (
        <Tooltip text={depositBlockReason} disabled={canDeposit}>
          <Button
            variant="primary"
            disabled={!canDeposit}
            onClick={onDeposit}
            data-testid="btc-vault-deposit-button"
          >
            Deposit
          </Button>
        </Tooltip>
      )}

      {withdrawVisible && (
        <Tooltip text={withdrawBlockReason} disabled={canWithdraw}>
          <Button
            variant="secondary-outline"
            disabled={!canWithdraw}
            onClick={onWithdraw}
            data-testid="btc-vault-withdraw-button"
          >
            Withdraw
          </Button>
        </Tooltip>
      )}

      {(depositVisible || withdrawVisible) && (
        <a
          href="#"
          className="flex items-center gap-1 text-sm font-medium underline underline-offset-2"
          data-testid="btc-vault-swap-link"
        >
          <Span variant="body-s">Swap to/from {RBTC}</Span>
          <SwapIcon />
        </a>
      )}
    </div>
  )
}
