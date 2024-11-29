import { fetchProposalCreated } from '@/app/user/Balances/actions'
import { NextRequest } from 'next/server'
import { BackendEventByTopic0ResponseValue, CachedData, handleCachedGetRequest } from '@/shared/utils'

let cachedProposals: CachedData = {
  lastUpdated: Date.now(),
  data: [] as BackendEventByTopic0ResponseValue[],
  isFetching: false,
  error: '',
  lastFromBlock: 0,
}

export async function GET(request: NextRequest) {
  return handleCachedGetRequest(cachedProposals, request, fetchProposalCreated)
}
