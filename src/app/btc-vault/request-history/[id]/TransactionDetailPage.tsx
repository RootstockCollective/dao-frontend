'use client'

import { useAccount } from 'wagmi'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { RBTC } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useModal } from '@/shared/hooks/useModal'
import { showToast } from '@/shared/notification'

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

  const handleClaim = async () => {
    try {
      await claim()
      invalidateAfterAction(id)
      showToast({
        severity: 'success',
        title: request.type === 'deposit' ? 'Shares claimed' : 'rBTC claimed',
        content: 'Your claim transaction has been submitted.',
      })
    } catch (error) {
      showToast({
        severity: 'error',
        title: 'Claim failed',
        content: error instanceof Error ? error.message : 'Something went wrong.',
      })
    }
  }

  const handleConfirmCancel = async () => {
    try {
      await onCancelRequest()
      invalidateAfterAction(id)
      closeModal()
      showToast({
        severity: 'success',
        title: 'Request canceled',
        content: 'Your request has been canceled successfully.',
      })
    } catch (error) {
      closeModal()
      showToast({
        severity: 'error',
        title: 'Cancellation failed',
        content: error instanceof Error ? error.message : 'Something went wrong.',
      })
    }
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
