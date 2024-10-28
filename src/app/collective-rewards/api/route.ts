import { BackendEventByTopic0ResponseValue } from '@/app/user/Balances/actions'
import { NextRequest } from 'next/server'
import { fetchRewardDistributedLogs } from '../actions'

let cachedRewardDistributed = {
  lastUpdated: Date.now(),
  data: [] as BackendEventByTopic0ResponseValue[],
  isFetching: false,
  error: '',
  lastFromBlock: 0,
}

const shouldAddRowToDataArray = (newTransaction: { blockNumber: string }) => {
  const indexFound = cachedRewardDistributed.data.findIndex(i => i.blockNumber === newTransaction.blockNumber)
  return indexFound === -1
}

function fetchRewardDistributed() {
  cachedRewardDistributed.isFetching = true
  fetchRewardDistributedLogs(cachedRewardDistributed.lastFromBlock)
    .then(({ data }) => {
      if (Array.isArray(data) && data.length > 0) {
        const dataToBeAdded = data.filter(shouldAddRowToDataArray)
        if (dataToBeAdded.length > 0) {
          cachedRewardDistributed.data.push(...dataToBeAdded)
        }
        cachedRewardDistributed.error = ''
        cachedRewardDistributed.lastFromBlock = Number(data[data.length - 1].blockNumber) + 1 // Update lastFromBlock based on last reward distributed
      } else {
        cachedRewardDistributed.error = JSON.stringify(data)
      }
      cachedRewardDistributed.lastUpdated = Date.now()
    })
    .catch(err => {
      cachedRewardDistributed.error = err.toString()
    })
    .finally(() => (cachedRewardDistributed.isFetching = false))
}

const SECONDS_INTERVAL = 10

export async function GET(request: NextRequest) {
  const shouldRestartFromBlock = request.nextUrl.searchParams.get('restartBlock')
  if (shouldRestartFromBlock === '1') {
    cachedRewardDistributed.lastFromBlock = 0
  }
  const currentTime = Date.now()
  const timeElapsed = (currentTime - cachedRewardDistributed.lastUpdated) / 1000 // Time elapsed in seconds

  if (
    (cachedRewardDistributed.data.length === 0 || timeElapsed > SECONDS_INTERVAL) &&
    !cachedRewardDistributed.isFetching
  ) {
    fetchRewardDistributed()
  }
  return Response.json(cachedRewardDistributed.data, {
    headers: {
      'X-Error': cachedRewardDistributed.error,
      'X-Fetching': cachedRewardDistributed.isFetching ? 'true' : 'false',
      'X-LastUpdated': cachedRewardDistributed.lastUpdated.toString(),
      'X-TimeElapsed': timeElapsed.toString(),
    },
  })
}
