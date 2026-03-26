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
    console.info('NFT contract address: ', nftContract)
    const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    const initialFromBlock = 5000000 // all the NFT addresses in mainnet and testnet were deployed after block 5000000
    const MAX_PAGES = 200

    const allLogs: NFTEvent[] = []
    const seen = new Set<string>()
    let fromBlock = initialFromBlock

    for (let page = 0; page < MAX_PAGES; page++) {
      const params = new URLSearchParams({
        module: 'logs',
        action: 'getLogs',
        address: nftContract,
        topic0: transferTopic,
        fromBlock: fromBlock.toString(),
        toBlock: 'latest',
      })
      const url = `${blockscoutUrl}/api?${params}`

      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(25_000) })
        if (!response.ok) {
          throw new Error(`Blockscout HTTP error! status: ${response.status}`)
        }
        const json = (await response.json()) as { result: NFTEvent[] }
        const logs: NFTEvent[] = json.result ?? []

        if (logs.length === 0) break

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

        // If we didn't advance, we've exhausted this block's logs
        if (lastBlockNumber === fromBlock) break
        fromBlock = lastBlockNumber
      } catch (error) {
        console.error('Error fetching NFT transfer events:', error)
        throw error
      }
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
