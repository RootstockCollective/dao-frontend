import { fetchNftHoldersOfAddress } from '@/app/user/Balances/actions'
import { NextRequest } from 'next/server'

const cachedNftHolders: Map<string, any> = new Map()

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')
  if (!address) {
    return Response.json({ error: 'Missing address query parameter' })
  }

  if (!cachedNftHolders.has(address)) {
    cachedNftHolders.set(address, {
      lastUpdated: Date.now(),
      data: [],
      isFetching: false,
      error: '',
    })
  }

  const cachedData = cachedNftHolders.get(address)
  const result = handleCachedGetNftHoldersRequest(cachedData, address, fetchNftHoldersOfAddress)
  cachedNftHolders.set(address, result)

  return Response.json(cachedData.data, {
    headers: {
      'X-Error': cachedData.error,
      'X-Fetching': cachedData.isFetching ? 'true' : 'false',
      'X-LastUpdated': cachedData.lastUpdated.toString(),
      'X-TimeElapsed': cachedData.timeElapsed.toString(),
    },
  })
}

const handleCachedGetNftHoldersRequest = (
  cachedData: any,
  address: string,
  functionToBeFetch: (address: string, nextParams: any) => Promise<any>,
  interval = 60,
) => {
  const currentTime = Date.now()
  const timeElapsed = (currentTime - cachedData.lastUpdated) / 1000 // Time elapsed in seconds
  cachedData.timeElapsed = timeElapsed

  if ((cachedData.data.length === 0 || timeElapsed > interval) && !cachedData.isFetching) {
    fetchFunction(cachedData, address, functionToBeFetch)
  }
  return cachedData
}

const fetchFunction = async (
  cachedData: any,
  address: string,
  functionToBeFetch: (address: string, nextParams: any) => Promise<any>,
) => {
  try {
    cachedData.isFetching = true
    let nextPageParams = null
    let allData: any[] = []
    while (true) {
      const data = await functionToBeFetch(address, nextPageParams)
      allData = allData.concat(data.items)
      if (data.next_page_params) {
        nextPageParams = data.next_page_params
      } else {
        break
      }
    }
    const sortedData = allData.sort((a: any, b: any) => a.id - b.id)
    cachedData.data = sortedData
    cachedData.lastUpdated = Date.now()
  } catch (err: any) {
    cachedData.error = err.toString()
  } finally {
    cachedData.isFetching = false
  }
}
