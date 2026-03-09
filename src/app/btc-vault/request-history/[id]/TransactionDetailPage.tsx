'use client'

import { useAccount } from 'wagmi'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { RBTC } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'

import { useRequestById } from '../../hooks/useRequestById'
import { toRequestDetailDisplay } from '../../services/ui/mappers'
import { TransactionDetailOops, TransactionDetailView } from './components'

interface TransactionDetailPageProps {
  id: string
}

export function TransactionDetailPage({ id }: TransactionDetailPageProps) {
  const { address, isConnected } = useAccount()
  const { data: request, isLoading, isError } = useRequestById(id)
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

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

  return <TransactionDetailView detail={detail} status={request.status} type={request.type} />
}
