'use client'

import { useRef } from 'react'
import { useAccount } from 'wagmi'

import { ConditionalTooltip } from '@/app/components/Tooltip/ConditionalTooltip'
import { Button } from '@/components/Button'
import { executeTxFlow } from '@/shared/notification'

import { BTC_VAULT_BACKEND_INDEX_DELAY_MS, BTC_VAULT_CLAIM_IN_PROGRESS_MESSAGE } from '../constants'
import { useBtcVaultInvalidation } from '../hooks/useBtcVaultInvalidation'
import { useClaimRequest } from '../hooks/useClaimRequest'
import type { VaultRequest } from '../services/types'

const buttonClassName = 'h-auto min-h-11 w-full shrink-0 py-0.5 px-4 md:min-h-0'

export interface BtcVaultRedeemSharesButtonProps {
  vaultRequest: VaultRequest | null
  onAfterRedeemRefetch?: () => void
}

/**
 * Finalizes a claimable withdrawal (`claimRedeemNative`), same flow as transaction history “Claim rBTC” /
 * detail page claim. Shown only when the vault reports a claimable redeem for the user.
 */
export function BtcVaultRedeemSharesButton({
  vaultRequest,
  onAfterRedeemRefetch,
}: BtcVaultRedeemSharesButtonProps) {
  const { address } = useAccount()
  const claimFlowLock = useRef(false)
  const { invalidateAfterAction } = useBtcVaultInvalidation()
  const { claim, canClaim, isRequesting, isTxPending, isReadingAmount, isReadingError } =
    useClaimRequest(vaultRequest)

  if (!address) return null
  if (!vaultRequest || vaultRequest.type !== 'withdrawal' || vaultRequest.status !== 'claimable') {
    return null
  }

  if (isReadingAmount || isReadingError) {
    return null
  }

  const isClaimPending = isRequesting || isTxPending

  if (!canClaim && !isClaimPending) {
    return null
  }

  const handleFinalize = async () => {
    if (claimFlowLock.current) return
    claimFlowLock.current = true
    try {
      await executeTxFlow({
        action: 'btcVaultClaim',
        onRequestTx: () => claim(),
        onSuccess: async () => {
          await new Promise(resolve => setTimeout(resolve, BTC_VAULT_BACKEND_INDEX_DELAY_MS))
          invalidateAfterAction(vaultRequest.id)
          onAfterRedeemRefetch?.()
        },
      })
    } finally {
      claimFlowLock.current = false
    }
  }

  if (isClaimPending) {
    return (
      <ConditionalTooltip
        supportMobileTap
        className="w-full p-0"
        conditionPairs={[
          {
            condition: () => true,
            lazyContent: () => BTC_VAULT_CLAIM_IN_PROGRESS_MESSAGE,
          },
        ]}
      >
        <Button
          variant="primary"
          className={buttonClassName}
          textClassName="text-sm"
          data-testid="btc-vault-redeem-shares-button"
          disabled={false}
          onClick={() => {}}
        >
          Redeeming...
        </Button>
      </ConditionalTooltip>
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
      Redeem Shares
    </Button>
  )
}
