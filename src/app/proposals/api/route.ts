import { fetchProposalCreated } from '@/app/user/Balances/actions'
import { NextRequest } from 'next/server'

let cachedProposals = {
  lastUpdated: Date.now(),
  data: [],
  isFetching: false,
  error: '',
  lastFromBlock: 0,
}

function fetchProposals() {
  cachedProposals.isFetching = true
  console.log(`13: Fetching proposals with lastFromBlock: ${cachedProposals.lastFromBlock}`)
  fetchProposalCreated(cachedProposals.lastFromBlock)
    .then(({ data }) => {
      console.log(14, 'Finished fetching proposals...')
      if (Array.isArray(data) && data.length > 0) {
        cachedProposals.data = data as []
        cachedProposals.error = ''
        cachedProposals.lastFromBlock = Number(data[data.length - 1].blockNumber) + 1 // Update lastFromBlock based on last proposal
      } else {
        cachedProposals.error = JSON.stringify(data)
      }
      cachedProposals.lastUpdated = Date.now()
    })
    .catch(err => {
      cachedProposals.error = err.toString()
    })
    .finally(() => (cachedProposals.isFetching = false))
}

const SECONDS_INTERVAL = 10

export async function GET(request: NextRequest) {
  const shouldRestartFromBlock = request.nextUrl.searchParams.get('restartBlock')
  if (shouldRestartFromBlock === '1') {
    cachedProposals.lastFromBlock = 0
  }
  const currentTime = Date.now()
  const timeElapsed = (currentTime - cachedProposals.lastUpdated) / 1000 // Time elapsed in seconds

  if ((cachedProposals.data.length === 0 || timeElapsed > SECONDS_INTERVAL) && !cachedProposals.isFetching) {
    fetchProposals()
  }
  return Response.json(cachedProposals.data, {
    headers: {
      'X-Error': cachedProposals.error,
      'X-Fetching': cachedProposals.isFetching ? 'true' : 'false',
      'X-LastUpdated': cachedProposals.lastUpdated.toString(),
      'X-TimeElapsed': timeElapsed.toString(),
    },
  })
}
