'use client'

import { Button } from '@/components/Button'

import { useBtcVaultFinalizeSharesFlow } from '../hooks/useBtcVaultFinalizeSharesFlow'
import type { VaultRequest } from '../services/types'
import { BtcVaultFinalizeSharesBusyButton } from './BtcVaultFinalizeSharesBusyButton'

const buttonClassName = 'h-auto min-h-11 w-full shrink-0 py-0.5 px-4 md:min-h-0'

export interface BtcVaultRedeemSharesButtonProps {
  vaultRequest: VaultRequest | null
  onAfterRedeemRefetch?: () => void | Promise<void>
}

/**
 * Finalizes a claimable withdrawal (`claimRedeemNative`), same flow as transaction history “Claim rBTC” /
 * detail page claim. Shown only when the vault reports a claimable redeem for the user.
 */
export function BtcVaultRedeemSharesButton({
  vaultRequest,
  onAfterRedeemRefetch,
}: BtcVaultRedeemSharesButtonProps) {
  const { shouldRender, isBusy, handleFinalize } = useBtcVaultFinalizeSharesFlow({
    vaultRequest,
    expectedType: 'withdrawal',
    onAfterRefetch: onAfterRedeemRefetch,
  })

  if (!shouldRender) return null

  if (isBusy) {
    return (
      <BtcVaultFinalizeSharesBusyButton
        data-testid="btc-vault-redeem-shares-button"
        busyLabel="Redeeming..."
      />
    )
  }

  return (
    <Button
      variant="primary"
      className={buttonClassName}
      textClassName="text-sm"
      data-testid="btc-vault-redeem-shares-button"
      disabled={false}
      onClick={handleFinalize}
    >
      Claim rBTC
    </Button>
  )
}
