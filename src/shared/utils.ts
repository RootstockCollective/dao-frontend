import type { NextRequest } from 'next/server'
import './utils.css'
import type { AxiosResponse } from 'axios'
import type { EIP1193Provider, WatchAssetParams } from 'viem'
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

export interface CachedData {
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
    .finally(() => {
      cachedData.isFetching = false
    })
}

interface WalletWatchAssetOptions {
  address: string
  symbol: string
  image?: string
  decimals?: number // Required for ERC20
  tokenId?: string // Required for ERC721
}

// Define the specific parameters structure for wallet_watchAsset method
interface WalletWatchAssetRequestParams {
  type: 'ERC20' | 'ERC721'
  options: WalletWatchAssetOptions
}

// Define specific types for ERC-20 and ERC-721 arguments
interface AddERC20ToWalletArgument {
  tokenType: 'ERC20'
  address: string
  symbol: string
  decimals: number
  image?: string
}

interface AddERC721ToWalletArgument {
  tokenType: 'ERC721'
  address: string
  symbol: string
  tokenId: string | number // tokenId is mandatory for ERC721
  image?: string
}

// Union type to allow passing either ERC-20 or ERC-721 arguments
type AddToWalletArgument = AddERC20ToWalletArgument | AddERC721ToWalletArgument

/**
 * Requests the provider (e.g., MetaMask) to add a token (ERC-20 or ERC-721) to the wallet.
 * @param arg - An object containing token details specific to ERC-20 or ERC-721.
 * @returns A Promise that resolves when the request is sent to the provider.
 */
export const requestProviderToAddToken: (arg: AddToWalletArgument) => Promise<unknown> = async arg => {
  // Ensure window.ethereum (MetaMask provider) is available
  if (
    typeof window === 'undefined' ||
    !(window as any).ethereum ||
    typeof (window as any).ethereum.request !== 'function'
  ) {
    console.error('MetaMask (window.ethereum) is not detected.')
    throw new Error('MetaMask is not installed or not available.')
  }

  const { tokenType, address, symbol, image } = arg

  // Declare params with the specific type for wallet_watchAsset
  let params: WalletWatchAssetRequestParams

  // Conditionally build the params object based on tokenType
  if (tokenType === 'ERC20') {
    const { decimals } = arg as AddERC20ToWalletArgument
    params = {
      type: 'ERC20',
      options: {
        address,
        symbol,
        decimals,
        image: image || '', // Provide an empty string if image is undefined for ERC20
      },
    }
  } else if (tokenType === 'ERC721') {
    const { tokenId } = arg as AddERC721ToWalletArgument
    params = {
      type: 'ERC721',
      options: {
        address,
        symbol,
        image: image || '', // Provide an empty string if image is undefined for ERC721
        tokenId: String(tokenId), // Ensure tokenId is always a string as required by MetaMask
      },
    }
  } else {
    // This case should ideally not be reached due to TypeScript union type,
    // but good for runtime safety.
    console.error('Unsupported token type provided:', tokenType)
    throw new Error('Unsupported token type provided.')
  }

  try {
    const provider = window.ethereum as unknown as EIP1193Provider
    const result = await provider.request({
      method: 'wallet_watchAsset',
      params: params as unknown as WatchAssetParams,
    })
    console.log('Token added successfully:', result)
    return result
  } catch (error) {
    console.error('Failed to add token:', error)
    throw error
  }
}
