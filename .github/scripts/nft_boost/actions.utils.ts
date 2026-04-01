import { Address, Block, getAddress } from 'viem'

import { getAbi } from '../../../src/lib/abis/tok'
import { COINBASE_ADDRESS } from '../../../src/lib/constants'

interface NFTEvent {
  address: string
  blockNumber: string
  data: string
  gasPrice: string
  gasUsed: string
  logIndex: string
  timeStamp: string
  topics: string[]
  transactionHash: string
  transactionIndex: string
}

interface BlockscoutLogsResponse {
  message: string
  status: string
  result: NFTEvent[] | null
}

export async function getActions() {
  const { publicClient } = await import(`../../../src/lib/viemPublicClient`)
  const builderRegistryAddress = process.env.NEXT_PUBLIC_BUILDER_REGISTRY_ADDRESS
  const backersManagerAddress = process.env.NEXT_PUBLIC_BACKERS_MANAGER_ADDRESS
  const blockscoutUrl = process.env.NEXT_PUBLIC_BLOCKSCOUT_URL

  const getLatestBlockNumber = (): Promise<bigint> => {
    return publicClient.getBlockNumber()
  }

  const getBlockByNumber = (blockNumber: number): Promise<Block> => {
    return publicClient.getBlock(blockNumber)
  }

  const getNftTransferEvents = async (nftContract: string): Promise<NFTEvent[]> => {
    // Extract to constants
    const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    const INITIAL_FROM_BLOCK = 5_000_000 // NFT addresses in mainnet/testnet deployed after block 5,000,000
    const MAX_PAGES = 200
    const REQUEST_TIMEOUT_MS = 25_000
    const BLOCKSCOUT_LOG_LIMIT = 1000 // API max logs per page

    // Normalize and validate nftContract
    let normalizedContract: string
    try {
      normalizedContract = getAddress(nftContract).toLowerCase()
    } catch {
      throw new Error(`Invalid NFT contract address: ${nftContract}`)
    }

    console.info('NFT contract address (normalized):', normalizedContract)

    const allLogs: NFTEvent[] = []
    const seen = new Set<string>()
    let fromBlock = INITIAL_FROM_BLOCK
    let isPotentiallyIncomplete = false
    let pageCount = 0

    for (let page = 0; page < MAX_PAGES; page++) {
      pageCount = page
      const params = new URLSearchParams({
        module: 'logs',
        action: 'getLogs',
        address: normalizedContract,
        topic0: TRANSFER_TOPIC,
        fromBlock: fromBlock.toString(),
        toBlock: 'latest',
      })
      const url = `${blockscoutUrl}/api?${params}`

      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
        if (!response.ok) {
          throw new Error(`Blockscout HTTP error! status: ${response.status}`)
        }

        const json = (await response.json()) as BlockscoutLogsResponse

        // Explicitly handle Blockscout status field
        if (json.status !== '1') {
          throw new Error(`Blockscout error: ${json.message || 'unknown error'} (status: ${json.status})`)
        }

        if (!json.result) {
          throw new Error('Blockscout error: missing result field')
        }

        const logs = json.result
        if (logs.length === 0) break

        // Check for potential truncation: if we got exactly API limit, there might be more
        if (logs.length >= BLOCKSCOUT_LOG_LIMIT) {
          isPotentiallyIncomplete = true
          console.warn(
            `Got ${logs.length} logs (at API limit). History may be incomplete for block ${fromBlock}+`,
          )
        }

        let lastBlockNumber = fromBlock
        for (const log of logs) {
          const key = `${log.transactionHash}-${log.logIndex}`
          if (!seen.has(key)) {
            seen.add(key)
            allLogs.push(log)
          }
          const bn = parseInt(log.blockNumber, 16)
          if (bn > lastBlockNumber) lastBlockNumber = bn
        }

        // If we didn't advance blocks, we've exhausted this block's logs
        if (lastBlockNumber === fromBlock) break
        fromBlock = lastBlockNumber
      } catch (error) {
        console.error('Error fetching NFT transfer events:', error)
        throw error
      }
    }

    // Signal if we hit pagination cap without exhausting history
    if (pageCount === MAX_PAGES - 1) {
      const msg = `Reached pagination cap (${MAX_PAGES} pages). NFT transfer history may be incomplete.`
      console.warn(msg)
      isPotentiallyIncomplete = true
    }

    if (isPotentiallyIncomplete) {
      console.warn(
        `WARNING: NFT transfer history from block ${INITIAL_FROM_BLOCK} may be incomplete. Collected ${allLogs.length} unique transfers.`,
      )
    }

    return allLogs
  }

  const getAllGauges = async (): Promise<Address[]> => {
    const abi = getAbi('BuilderRegistryAbi')

    const gaugesLength = Number(
      await publicClient.readContract({
        address: builderRegistryAddress,
        abi,
        functionName: 'getGaugesLength',
        args: [],
      }),
    )
    console.info('Gauges length: ', gaugesLength)

    const gaugesIndexes = Array.from({ length: gaugesLength }, (_, i) => i)
    console.log('builderRegistryAddress: ', builderRegistryAddress)
    const getGaugesCalls = gaugesIndexes.map(i => ({
      address: builderRegistryAddress,
      abi,
      functionName: 'getGaugeAt',
      args: [BigInt(i)],
    }))

    return publicClient.multicall({ contracts: getGaugesCalls, allowFailure: false })
  }

  let rewardTokenAddress: Address
  const getRewardTokenAddress = async (): Promise<Address> => {
    const abi = getAbi('BackersManagerAbi')
    if (rewardTokenAddress) {
      return rewardTokenAddress
    }
    rewardTokenAddress = await publicClient.readContract({
      address: backersManagerAddress,
      abi,
      functionName: 'rifToken',
      args: [],
    })
    return getAddress(rewardTokenAddress)
  }

  // Queries Gauges contracts for backer rewards
  interface EstimatedGaugeRewards {
    RBTC: bigint
    RIF: bigint
  }
  const estimatedGaugeRewards = async (backer: Address, gauge: Address): Promise<EstimatedGaugeRewards> => {
    const rewardTokenAddress = await getRewardTokenAddress()
    const rewardTokens: Address[] = [COINBASE_ADDRESS, rewardTokenAddress]
    try {
      const gaugeEstimatedRewards = await publicClient.multicall({
        contracts: rewardTokens.map(token => ({
          address: gauge,
          abi: getAbi('GaugeAbi'),
          functionName: 'estimatedBackerRewards',
          args: [token, backer],
        })),
        allowFailure: false,
      })
      return {
        RBTC: BigInt(gaugeEstimatedRewards[0]),
        RIF: BigInt(gaugeEstimatedRewards[1]),
      }
    } catch (error) {
      console.error(`Error fetching rewards for ${backer}:`, error)
      throw error
    }
  }

  return {
    getLatestBlockNumber,
    getNftTransferEvents,
    getBlockByNumber,
    getAllGauges,
    estimatedGaugeRewards,
  }
}
