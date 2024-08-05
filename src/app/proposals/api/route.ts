import { fetchProposalCreated } from '@/app/user/Balances/actions'

let cachedProposals = {
  lastUpdated: Date.now(),
  data: [],
  isFetching: false,
}

function fetchProposals() {
  cachedProposals.isFetching = true
  console.log(11, 'Fetching proposals...')
  fetchProposalCreated()
    .then(({ data }) => {
      console.log(14, 'Finished fetching proposals...')
      cachedProposals.data = data
      cachedProposals.lastUpdated = Date.now()
    })
    .finally(() => (cachedProposals.isFetching = false))
}

const SECONDS_INTERVAL = 10

export async function GET() {
  const currentTime = Date.now()
  const timeElapsed = (currentTime - cachedProposals.lastUpdated) / 1000 // Time elapsed in seconds

  if ((cachedProposals.data.length === 0 || timeElapsed > SECONDS_INTERVAL) && !cachedProposals.isFetching) {
    fetchProposals()
  }
  return Response.json(cachedProposals.data)
}
