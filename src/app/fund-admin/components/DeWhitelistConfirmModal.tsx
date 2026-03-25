'use client'

import { useCallback, useMemo } from 'react'
import { Address, getAddress, isAddress } from 'viem'

import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { Modal } from '@/components/Modal'
import { Paragraph } from '@/components/Typography'
import { shortAddress } from '@/lib/utils'
import { executeTxFlow } from '@/shared/notification'

import { useRevokeWhitelistedUserRole } from '../hooks/useRevokeWhitelistedUserRole'

interface DeWhitelistConfirmModalProps {
  fullAddress: string
  onClose: () => void
  onSuccess?: () => void
}

export function DeWhitelistConfirmModal({ fullAddress, onClose, onSuccess }: DeWhitelistConfirmModalProps) {
  const account = useMemo(() => (isAddress(fullAddress) ? getAddress(fullAddress) : null), [fullAddress])

  const { onRequestTransaction, isRequesting, isTxPending, canSubmit } = useRevokeWhitelistedUserRole(account)

  const isBusy = isRequesting || isTxPending

  const handleConfirm = useCallback(() => {
    if (!canSubmit) return
    void executeTxFlow({
      action: 'btcVaultDeWhitelist',
      onRequestTx: onRequestTransaction,
      onSuccess: () => {
        onClose()
        onSuccess?.()
      },
    })
  }, [canSubmit, onClose, onRequestTransaction, onSuccess])

  const confirmLabel = isRequesting ? 'Signing...' : isTxPending ? 'Confirming...' : 'Yes, de-whitelist'

  return (
    <Modal onClose={onClose} data-testid="DeWhitelistConfirmModal" className="md:max-w-[688px]">
      <div className="p-6 pt-16 flex flex-col gap-14">
        <div className="flex flex-col gap-6">
          <Paragraph variant="body-l">
            Are you sure you want to de-whitelist {shortAddress(fullAddress as Address)}?
          </Paragraph>
          <Paragraph>De-whitelisting will prevent this address from creating new transactions.</Paragraph>
        </div>

        <div className="flex flex-col gap-6">
          <Divider className="mb-0" />

          <div className="flex flex-wrap justify-end gap-4">
            <Button variant="secondary-outline" onClick={onClose} data-testid="Nevermind" disabled={isBusy}>
              Nevermind
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              data-testid="Yes, de-whitelist"
              textClassName="text-black"
              disabled={!canSubmit || isBusy}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
