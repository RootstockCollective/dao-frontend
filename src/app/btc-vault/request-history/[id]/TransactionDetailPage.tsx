'use client'

import { useAccount } from 'wagmi'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { RBTC } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useModal } from '@/shared/hooks/useModal'
import { executeTxFlow } from '@/shared/notification'

import { useBtcVaultInvalidation } from '../../hooks/useBtcVaultInvalidation'
import { useCancelBtcVaultRequest } from '../../hooks/useCancelRequest'
import { useClaimRequest } from '../../hooks/useClaimRequest'
import { useRequestById } from '../../hooks/useRequestById'
import { toRequestDetailDisplay } from '../../services/ui/mappers'
import { CancelRequestModal, TransactionDetailOops, TransactionDetailView } from './components'

interface TransactionDetailPageProps {
  id: string
}

export function TransactionDetailPage({ id }: TransactionDetailPageProps) {
  const { address, isConnected } = useAccount()
  const { data: request, isLoading, isError } = useRequestById(id, address ?? undefined)
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0
  const { isModalOpened, openModal, closeModal } = useModal()
  const { invalidateAfterAction } = useBtcVaultInvalidation()
  const { onCancelRequest, isRequesting: isCancelling } = useCancelBtcVaultRequest(request?.type ?? 'deposit')
  const {
    claim,
    canClaim,
    isRequesting: isClaiming,
    isTxPending: isClaimTxPending,
  } = useClaimRequest(request ?? null)

  if (!address || !isConnected) {
    return <TransactionDetailOops variant="not-connected" />
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !request) {
    return <TransactionDetailOops variant="not-found" />
  }

  const detail = toRequestDetailDisplay(request, null, rbtcPrice, address)
  const isClaimPending = isClaiming || isClaimTxPending

  const BACKEND_INDEX_DELAY_MS = 3000

  const handleClaim = async () => {
    await executeTxFlow({
      action: 'btcVaultClaim',
      onRequestTx: () => claim(),
      onSuccess: async () => {
        await new Promise(resolve => setTimeout(resolve, BACKEND_INDEX_DELAY_MS))
        invalidateAfterAction(id)
      },
    })
  }

  const handleConfirmCancel = async () => {
    await executeTxFlow({
      action: 'btcVaultCancel',
      onRequestTx: () => onCancelRequest(),
      onSuccess: async () => {
        await new Promise(resolve => setTimeout(resolve, BACKEND_INDEX_DELAY_MS))
        invalidateAfterAction(id)
        closeModal()
      },
      onError: () => closeModal(),
    })
  }

  return (
    <>
      <TransactionDetailView
        detail={detail}
        status={request.status}
        type={request.type}
        displayStatus={request.displayStatus}
        onClaim={canClaim ? handleClaim : undefined}
        isClaimPending={isClaimPending}
        onCancel={openModal}
      />
      {isModalOpened && (
        <CancelRequestModal onClose={closeModal} onConfirm={handleConfirmCancel} isLoading={isCancelling} />
      )}
    </>
  )
}
