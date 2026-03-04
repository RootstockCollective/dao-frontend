'use client'

import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { useActionEligibility } from '../hooks/useActionEligibility'

const PAUSE_BLOCK_REASON = 'Deposits are currently paused'
const ACTIVE_REQUEST_BLOCK_REASON = 'You already have an active request'

/** Block reason is an eligibility issue (KYB) — hide all actions. */
function isEligibilityBlock(reason: string): boolean {
  return reason.length > 0 && reason !== PAUSE_BLOCK_REASON && reason !== ACTIVE_REQUEST_BLOCK_REASON
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

  if (isEligibilityBlock(depositBlockReason)) return null

  const depositVisible = canDeposit || depositBlockReason === ACTIVE_REQUEST_BLOCK_REASON
  const withdrawVisible = canWithdraw || withdrawBlockReason === ACTIVE_REQUEST_BLOCK_REASON

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center w-full" data-testid="BtcVaultActions">
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
          className="text-sm font-medium underline underline-offset-2"
          data-testid="btc-vault-swap-link"
        >
          <Span variant="body-s">Swap to/from {RBTC} →</Span>
        </a>
      )}
    </div>
  )
}
