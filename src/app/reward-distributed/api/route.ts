import { NextRequest } from 'next/server'
import { fetchRewardDistributedLogs } from '@/app/collective-rewards/actions'
import { BackendEventByTopic0ResponseValue, CachedData, handleCachedGetRequest } from '@/shared/utils'

let cachedRewardDistributedLogs: CachedData = {
  lastUpdated: Date.now(),
  data: [] as BackendEventByTopic0ResponseValue[],
  isFetching: false,
  error: '',
  lastFromBlock: 0,
}

export async function GET(request: NextRequest) {
  return handleCachedGetRequest(cachedRewardDistributedLogs, request, fetchRewardDistributedLogs)
}
