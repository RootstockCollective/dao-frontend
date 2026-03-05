'use client'

import { useAccount } from 'wagmi'

import { Header } from '@/components/Typography'

import { useRequestById } from '../../hooks/useRequestById'
import { MOCK_RBTC_USD_PRICE } from '../../services/ui/formatters'
import { toRequestDetailDisplay } from '../../services/ui/mappers'
import {
  CancelRequestButton,
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
  const { data: request, isLoading, isError } = useRequestById(id)

  if (isLoading) {
    return (
      <div data-testid="transaction-detail-loading" className="flex items-center justify-center py-16">
        <span className="text-bg-0">Loading...</span>
      </div>
    )
  }

  if (isError || !request) {
    return <TransactionDetailOops variant="not-found" />
  }

  const detail = toRequestDetailDisplay(request, null, MOCK_RBTC_USD_PRICE, address)

  return (
    <div data-testid="transaction-detail-page" className="flex flex-col items-start w-full gap-6 rounded-sm">
      <Header variant="h2" caps className="text-100">
        {detail.typeLabel.toUpperCase()} REQUEST
      </Header>
      <RequestStatusStepper status={request.status} type={request.type} />
      <RequestDetailGrid detail={detail} />
      {detail.canCancel && <CancelRequestButton />}
    </div>
  )
}
