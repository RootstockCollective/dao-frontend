import { fetchProposalCreated } from '@/app/user/Balances/actions'

let cachedProposals = {
  lastUpdated: Date.now(),
  data: [],
  isFetching: false,
  error: '',
}

function fetchProposals() {
  cachedProposals.isFetching = true
  console.log(11, 'Fetching proposals...')
  fetchProposalCreated()
    .then(({ data }) => {
      console.log(14, 'Finished fetching proposals...')
      cachedProposals.data = data
      cachedProposals.lastUpdated = Date.now()
      cachedProposals.error = ''
    })
    .catch(err => {
      cachedProposals.error = err.toString()
    })
    .finally(() => (cachedProposals.isFetching = false))
}

const SECONDS_INTERVAL = 10

export async function GET(request: Request) {
  const disableCache = request.url
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
