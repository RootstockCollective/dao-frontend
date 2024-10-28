import { NextRequest } from 'next/server'
import './utils.css'
import { AxiosResponse } from 'axios'
// Had to be done this way because tailwind css is not dynamically rendering the image on build
export const BG_IMG_CLASSES = 'background-logo'

export interface BackendEventByTopic0ResponseValue {
  address: string
  blockNumber: string
  data: string
  gasPrice: string
  gasUsed: string
  logIndex: string
  timeStamp: string
  topics: Array<null | string>
  transactionHash: string
  transactionIndex: string
}

export type CachedData = {
  lastUpdated: number
  data: BackendEventByTopic0ResponseValue[]
  isFetching: boolean
  error: string
  lastFromBlock: number
}

export const handleCachedGetRequest = (
  cachedData: CachedData,
  request: NextRequest,
  functionToBeFetch: (fromBlock: number) => Promise<AxiosResponse>,
  interval = 10,
) => {
  const shouldRestartFromBlock = request.nextUrl.searchParams.get('restartBlock')
  if (shouldRestartFromBlock === '1') {
    cachedData.lastFromBlock = 0
  }
  const currentTime = Date.now()
  const timeElapsed = (currentTime - cachedData.lastUpdated) / 1000 // Time elapsed in seconds

  if ((cachedData.data.length === 0 || timeElapsed > interval) && !cachedData.isFetching) {
    fetchFunction(cachedData, functionToBeFetch)
  }
  return Response.json(cachedData.data, {
    headers: {
      'X-Error': cachedData.error,
      'X-Fetching': cachedData.isFetching ? 'true' : 'false',
      'X-LastUpdated': cachedData.lastUpdated.toString(),
      'X-TimeElapsed': timeElapsed.toString(),
    },
  })
}

const fetchFunction = (
  cachedData: CachedData,
  functionToBeFetch: (fromBlock: number) => Promise<AxiosResponse>,
) => {
  const shouldAddRowToDataArray = (newTransaction: { blockNumber: string }) => {
    const indexFound = cachedData.data.findIndex(i => i.blockNumber === newTransaction.blockNumber)
    return indexFound === -1
  }

  cachedData.isFetching = true
  functionToBeFetch(cachedData.lastFromBlock)
    .then(({ data }) => {
      if (Array.isArray(data) && data.length > 0) {
        const dataToBeAdded = data.filter(shouldAddRowToDataArray)
        if (dataToBeAdded.length > 0) {
          cachedData.data.push(...dataToBeAdded)
        }
        cachedData.error = ''
        cachedData.lastFromBlock = Number(data[data.length - 1].blockNumber) + 1 // Update lastFromBlock based on last cached value
      } else {
        cachedData.error = JSON.stringify(data)
      }
      cachedData.lastUpdated = Date.now()
    })
    .catch(err => {
      cachedData.error = err.toString()
    })
    .finally(() => (cachedData.isFetching = false))
}
