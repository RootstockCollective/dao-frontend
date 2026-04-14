'use client'

import { useAccount } from 'wagmi'

import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'

import { REQUEST_SUBMITTING_REASON } from '../services/constants'

const buttonClassName = 'h-auto min-h-11 w-full shrink-0 py-0.5 px-4 md:min-h-0'

export interface BtcVaultRedeemSharesButtonProps {
  hasVaultShares: boolean
  canWithdraw: boolean
  withdrawBlockReason: string
  isActionEligibilityLoading: boolean
  isAnyVaultActionSubmitting: boolean
  onOpenWithdrawModal: () => void
}

/**
 * Primary CTA under Wallet metrics; opens the shared withdraw modal when the user holds vault shares.
 */
export function BtcVaultRedeemSharesButton({
  hasVaultShares,
  canWithdraw,
  withdrawBlockReason,
  isActionEligibilityLoading,
  isAnyVaultActionSubmitting,
  onOpenWithdrawModal,
}: BtcVaultRedeemSharesButtonProps) {
  const { address } = useAccount()

  if (!address) return null
  if (isActionEligibilityLoading || !hasVaultShares) return null

  const redeemDisabled = !canWithdraw || isAnyVaultActionSubmitting
  const tooltipText = isAnyVaultActionSubmitting ? REQUEST_SUBMITTING_REASON : withdrawBlockReason

  return (
    <Tooltip text={tooltipText} disabled={!redeemDisabled || !tooltipText}>
      <Button
        variant="primary"
        className={buttonClassName}
        textClassName="text-sm"
        data-testid="btc-vault-redeem-shares-button"
        disabled={redeemDisabled}
        onClick={onOpenWithdrawModal}
      >
        Redeem Shares
      </Button>
    </Tooltip>
  )
}
