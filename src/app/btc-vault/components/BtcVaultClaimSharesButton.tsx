'use client'

import { Button } from '@/components/Button'

import { useBtcVaultFinalizeSharesFlow } from '../hooks/useBtcVaultFinalizeSharesFlow'
import type { VaultRequest } from '../services/types'
import { BtcVaultFinalizeSharesBusyButton } from './BtcVaultFinalizeSharesBusyButton'

const buttonClassName = 'h-auto min-h-11 w-full shrink-0 py-0.5 px-4 md:min-h-0'

export interface BtcVaultClaimSharesButtonProps {
  vaultRequest: VaultRequest | null
  onAfterClaimRefetch?: () => void | Promise<void>
}

export function BtcVaultClaimSharesButton({
  vaultRequest,
  onAfterClaimRefetch,
}: BtcVaultClaimSharesButtonProps) {
  const { shouldRender, isBusy, handleFinalize } = useBtcVaultFinalizeSharesFlow({
    vaultRequest,
    expectedType: 'deposit',
    onAfterRefetch: onAfterClaimRefetch,
  })

  if (!shouldRender) return null

  if (isBusy) {
    return (
      <BtcVaultFinalizeSharesBusyButton data-testid="btc-vault-claim-shares-button" busyLabel="Claiming..." />
    )
  }

  return (
    <Button
      variant="primary"
      className={buttonClassName}
      textClassName="text-sm"
      data-testid="btc-vault-claim-shares-button"
      disabled={false}
      onClick={handleFinalize}
    >
      Claim Shares
    </Button>
  )
}
