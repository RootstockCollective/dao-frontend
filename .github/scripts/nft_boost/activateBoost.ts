import { Address, getAddress } from 'viem'

import * as fs from 'fs'
import { config as envConfig } from 'dotenv'
import axios from 'axios'
import { BackersManagerAbi, BuilderRegistryAbi, GaugeAbi } from '../../../src/lib/abis/v2'
import { boostDataFolder, nftActiveBoostPath, rewardCoinbaseAddress } from './consts'

const [, , ...args] = process.argv

type Args = {
  nftContractAddress: Address
  boostPercentage: number
  campaignId: string
  env: string
}

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

async function getActions() {
  const { publicClient } = await import(`../../../src/lib/viemPublicClient`)
  const builderRegistryAddress = process.env.NEXT_PUBLIC_BUILDER_REGISTRY_ADDRESS
  const backersManagerAddress = process.env.NEXT_PUBLIC_BACKERS_MANAGER_ADDRESS
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
  const rifWalletServicesUrl = process.env.NEXT_PUBLIC_RIF_WALLET_SERVICES

  const getLatestBlockNumber = async (): Promise<bigint> => {
    return await publicClient.getBlockNumber()
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
    const gaugesLength = Number(
      await publicClient.readContract({
        address: builderRegistryAddress,
        abi: BuilderRegistryAbi,
        functionName: 'getGaugesLength',
        args: [],
      }),
    )
    console.info('Gauges length: ', gaugesLength)

    const gaugesIndexes = Array.from({ length: gaugesLength }, (_, i) => i)
    const getGaugesCalls = gaugesIndexes.map(i => ({
      address: builderRegistryAddress,
      abi: BuilderRegistryAbi,
      functionName: 'getGaugeAt',
      args: [BigInt(i)],
    }))

    const response = await publicClient.multicall({ contracts: getGaugesCalls })
    return response.map(data => data.result)
  }

  let rewardTokenAddress: Address
  const getRewardTokenAddress = async (): Promise<Address> => {
    if (rewardTokenAddress) {
      return rewardTokenAddress
    }
    rewardTokenAddress = await publicClient.readContract({
      address: backersManagerAddress,
      abi: BackersManagerAbi,
      functionName: 'rewardToken',
      args: [],
    })
    return rewardTokenAddress
  }

  // Queries Gauges contracts for backer rewards
  interface EstimatedGaugeRewards {
    RBTC: bigint
    RIF: bigint
  }
  const estimatedGaugeRewards = async (backer: Address, gauge: Address): Promise<EstimatedGaugeRewards> => {
    const rewardTokenAddress = await getRewardTokenAddress()
    const rewardTokens: Address[] = [rewardCoinbaseAddress, rewardTokenAddress]
    try {
      const gaugeEstimatedRewards = (
        await publicClient.multicall({
          contracts: rewardTokens.map(rewardToken => ({
            address: gauge,
            abi: GaugeAbi,
            functionName: 'estimatedBackerRewards',
            args: [rewardToken, backer],
          })),
        })
      ).map(data => data.result)
      return {
        RBTC: BigInt(gaugeEstimatedRewards[0].toString()),
        RIF: BigInt(gaugeEstimatedRewards[1].toString()),
      }
    } catch (error) {
      console.error(`Error fetching rewards for ${backer}:`, error)
      throw error
    }
  }

  return {
    getLatestBlockNumber,
    getNftTransferEvents,
    getAllGauges,
    estimatedGaugeRewards,
  }
}

async function main() {
  const { nftContractAddress, boostPercentage, campaignId, env } = args.reduce<Args>((acc, val) => {
    if (val.startsWith('--nft')) {
      acc.nftContractAddress = getAddress(val.split('=')[1])
    }
    if (val.startsWith('--boost')) {
      acc.boostPercentage = parseFloat(val.split('=')[1])
    }
    if (val.startsWith('--campaignId')) {
      acc.campaignId = val.split('=')[1]
    }
    if (val.startsWith('--env')) {
      acc.env = val.split('=')[1]
    }
    return acc
  }, {} as Args)

  if (!env || !nftContractAddress || isNaN(boostPercentage) || !campaignId) {
    throw new Error(
      'Usage: npx tsx .github/scripts/nft_boost/activateBoost.ts \\\
      --campaignId=<campaignId> \\\
      --nft=<nftContractAddress> \\\
      --boost=<boostPercentage> \\\
      --env=<env>',
    )
  }
  console.info('campaignId: ', campaignId)
  console.info('nft: ', nftContractAddress)
  console.info('Boost percentage: ', boostPercentage)
  console.info('env: ', env)
  if (boostPercentage < 0) {
    throw new Error('Boost percentage must be positive')
  }

  envConfig({
    path: `.env.${env}`,
  })

  const { getLatestBlockNumber, getNftTransferEvents, getAllGauges, estimatedGaugeRewards } =
    await getActions()

  const blockNumber = await getLatestBlockNumber()
  console.info(`Latest block: ${blockNumber}`)

  const nftTransferEvents = await getNftTransferEvents(nftContractAddress)
  const holdersData: any = {}

  const gauges = await getAllGauges()

  const normalisationFactor = 100_000 // Scaling factor to handle decimal values in BigInts. A ratio of 1.25 => 125_000
  const boost = BigInt(Math.round(normalisationFactor * (1 + boostPercentage / 100)))

  for (let i = 0; i < nftTransferEvents.length; i++) {
    const event = nftTransferEvents[i]
    const holderAddress = `0x${event.topics[2].slice(-40)}` as Address
    console.info(`Processing ${i + 1} of ${nftTransferEvents.length} events. Nft holder: ${holderAddress}`)
    const tokenId = BigInt(event.topics[3]).toString()
    for (const gauge of gauges) {
      const estimatedRewards = await estimatedGaugeRewards(holderAddress, gauge)

      const boostedRBTCRewards = (estimatedRewards.RBTC * boost) / BigInt(normalisationFactor)
      const boostedRIFRewards = (estimatedRewards.RIF * boost) / BigInt(normalisationFactor)

      holdersData[holderAddress] = {
        estimatedRBTCRewards: estimatedRewards.RBTC.toString(),
        estimatedRIFRewards: estimatedRewards.RIF.toString(),
        boostedRBTCRewards: boostedRBTCRewards.toString(),
        boostedRIFRewards: boostedRIFRewards.toString(),
        tokenId,
      }
    }
  }

  const result = {
    nftContractAddress,
    boostPercentage,
    calculationBlock: blockNumber.toString(),
    holders: holdersData,
  }

  const nftBoostFilename = `${nftContractAddress}-${blockNumber}.json`
  const nftBoostPath = `${boostDataFolder}/${nftBoostFilename}`
  fs.mkdirSync(boostDataFolder, { recursive: true })
  fs.writeFileSync(nftBoostPath, JSON.stringify(result, null, 2))
  console.log(`Nft boost file saved: ${nftBoostPath}`)

  fs.writeFileSync(nftActiveBoostPath, nftBoostFilename)
  console.log(`Active nft boost file saved: ${nftActiveBoostPath}`)
}

main()
