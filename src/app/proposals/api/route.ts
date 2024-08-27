import { fetchProposalCreated } from '@/app/user/Balances/actions'

const cachedProposals = {
  lastUpdated: Date.now(),
  data: [],
  error: '',
}

const fetchProposals = async () => {
  console.log(11, 'Fetching proposals...')
  try {
    const { data } = await fetchProposalCreated()
    console.log(14, 'Finished fetching proposals...')
    if (Array.isArray(data) && data.length > 0) {
      cachedProposals.data = data as []
      cachedProposals.error = ''
    } else {
      cachedProposals.error = JSON.stringify(data)
    }
    cachedProposals.lastUpdated = Date.now()
  } catch (err: any) {
    cachedProposals.error = err.toString()
  }
}

const SECONDS_INTERVAL = 10

export async function GET() {
  const currentTime = Date.now()
  const timeElapsed = (currentTime - cachedProposals.lastUpdated) / 1000 // Time elapsed in seconds

  if (cachedProposals.data.length === 0 || timeElapsed > SECONDS_INTERVAL) {
    await fetchProposals()
  }
  return Response.json(cachedProposals.data, {
    headers: {
      'X-Error': cachedProposals.error,
      'X-LastUpdated': cachedProposals.lastUpdated.toString(),
      'X-TimeElapsed': timeElapsed.toString(),
    },
  })
}
