'use client'

import { useAccount } from 'wagmi'

import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/Typography'
import { useModal } from '@/shared/hooks/useModal'
import { showToast } from '@/shared/notification'

import { useRequestById } from '../../hooks/useRequestById'
import { MOCK_RBTC_USD_PRICE } from '../../services/ui/formatters'
import { toRequestDetailDisplay } from '../../services/ui/mappers'
import {
  CancelRequestModal,
  RequestDetailGrid,
  RequestStatusStepper,
  TransactionDetailOops,
} from './components'

interface TransactionDetailPageProps {
  id: string
}

export function TransactionDetailPage({ id }: TransactionDetailPageProps) {
  const { address, isConnected } = useAccount()

  if (!address || !isConnected) {
    return <TransactionDetailOops variant="not-connected" />
  }

  return <TransactionDetailContent id={id} address={address} />
}

function TransactionDetailContent({ id, address }: { id: string; address: string }) {
  const { isModalOpened, openModal, closeModal } = useModal()
  const { data: request, isLoading, isError } = useRequestById(id)

  const handleConfirmCancel = () => {
    closeModal()
    showToast({
      severity: 'success',
      title: 'Request canceled',
      content: 'Your request has been canceled successfully.',
    })
    // TODO(DAO-XXXX): Wire up contract cancellation logic here
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !request) {
    return <TransactionDetailOops variant="not-found" />
  }

  const detail = toRequestDetailDisplay(request, null, MOCK_RBTC_USD_PRICE, address)

  return (
    <>
      <div data-testid="transaction-detail-page" className="flex flex-col items-start w-full gap-6">
        <Header variant="h2" caps className="text-100">
          {detail.typeLabel.toUpperCase()} REQUEST
        </Header>
        <div className="bg-bg-80 rounded py-8 px-4 md:p-6 w-full flex flex-col gap-6">
          <RequestStatusStepper status={request.status} type={request.type} />
          <RequestDetailGrid detail={detail} />
          {detail.canCancel && (
            <Button variant="secondary-outline" data-testid="cancel-request-button" onClick={openModal}>
              Cancel request
            </Button>
          )}
        </div>
      </div>
      {isModalOpened && <CancelRequestModal onClose={closeModal} onConfirm={handleConfirmCancel} />}
    </>
  )
}
