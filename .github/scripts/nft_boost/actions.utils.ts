import axios from 'axios'
import { Address, Block, getAddress } from 'viem'
import { getAbi } from '../../../src/lib/abis/v2'
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
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
  const rifWalletServicesUrl = process.env.NEXT_PUBLIC_RIF_WALLET_SERVICES

  const getLatestBlockNumber = (): Promise<bigint> => {
    return publicClient.getBlockNumber()
  }

  const getBlockByNumber = (blockNumber: number): Promise<Block> => {
    return publicClient.getBlock(blockNumber)
  }

  const getNftTransferEvents = async (nftContract: string): Promise<NFTEvent[]> => {
    console.info('NFT contract address: ', nftContract)
    const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    const fromBlock = 5000000 // all the NFT addresses in mainnet and testnet were deployed after block 5000000
    const url = `${rifWalletServicesUrl}/address/${nftContract}/eventsByTopic0?topic0=${transferTopic}&chainId=${chainId}&fromBlock=${fromBlock}`
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching NFT holders:', error)
      throw error
    }
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
      functionName: 'rewardToken',
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
