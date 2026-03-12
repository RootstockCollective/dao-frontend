'use client'

import { useAccount } from 'wagmi'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { RBTC } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useModal } from '@/shared/hooks/useModal'
import { showToast } from '@/shared/notification'

import { useCancelRequest } from '../../hooks/useCancelRequest'
import { useRequestById } from '../../hooks/useRequestById'
import { toRequestDetailDisplay } from '../../services/ui/mappers'
import { CancelRequestModal, TransactionDetailOops, TransactionDetailView } from './components'

interface TransactionDetailPageProps {
  id: string
}

export function TransactionDetailPage({ id }: TransactionDetailPageProps) {
  const { address, isConnected } = useAccount()
  const { data: request, isLoading, isError } = useRequestById(id)
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0
  const { isModalOpened, openModal, closeModal } = useModal()
  const { onCancelRequest, isRequesting: isCancelling } = useCancelRequest(request?.type ?? 'deposit')

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

  const handleConfirmCancel = async () => {
    // TODO(DAO-2071): VaultRequest.id is a UI string ("req-deposit-pending"), but the
    // contract expects a numeric requestId (uint256). Once useRequestById returns real
    // on-chain data, replace this with the actual numeric requestId field.
    const numericId = Number(request.epochId ?? request.batchRedeemId ?? '0')
    if (!Number.isFinite(numericId)) {
      closeModal()
      showToast({
        severity: 'error',
        title: 'Cancellation failed',
        content: 'Cannot determine on-chain request ID.',
      })
      return
    }

    try {
      await onCancelRequest(BigInt(numericId))
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
        onCancel={openModal}
      />
      {isModalOpened && (
        <CancelRequestModal onClose={closeModal} onConfirm={handleConfirmCancel} isLoading={isCancelling} />
      )}
    </>
  )
}
