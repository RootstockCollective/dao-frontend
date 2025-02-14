import { Address, createPublicClient, getAddress, http } from 'viem'
import fs from 'fs'
import axios from 'axios'
import { GaugeAbi, BackersManagerAbi } from '../ABIs'
import { backersManagerAddress, network } from './env'
import { boostDataFolder, nftActiveBoostPath, rewardCoinbaseAddress } from './consts'

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

const client = createPublicClient({
  chain: network,
  transport: http(),
})

async function getLatestBlockNumber(): Promise<bigint> {
  return await client.getBlockNumber()
}

async function getNftTransferEvents(nftContract: string): Promise<NFTEvent[]> {
  console.info('NFT contract address: ', nftContract)
  const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  const url = `https://rws.app.rootstockcollective.xyz/address/${nftContract}/eventsByTopic0?topic0=${transferTopic}&chainId=${network.id}&fromBlock=0`
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching NFT holders:', error)
    return []
  }
}

async function getAllGauges(): Promise<Address[]> {
  const gaugesLength = Number(
    await client.readContract({
      address: backersManagerAddress,
      abi: BackersManagerAbi,
      functionName: 'getGaugesLength',
      args: [],
    }),
  )
  console.info('Gauges length: ', gaugesLength)
  let gauges: Address[] = []
  for (let i = 0; i < gaugesLength; i++) {
    const gaugeAddress = await client.readContract({
      address: backersManagerAddress,
      abi: BackersManagerAbi,
      functionName: 'getGaugeAt',
      args: [BigInt(i)],
    })
    gauges.push(gaugeAddress)
  }
  return gauges
}

async function getRewardTokenAddress(): Promise<Address> {
  return await client.readContract({
    address: backersManagerAddress,
    abi: BackersManagerAbi,
    functionName: 'rewardToken',
    args: [],
  })
}

// Queries Gauges contracts for backer rewards
async function estimatedGaugeRewards(rewardToken: Address, backer: Address, gauge: Address): Promise<bigint> {
  try {
    const gaugeEstimatedRewards = await client.readContract({
      address: gauge,
      abi: GaugeAbi,
      functionName: 'estimatedBackerRewards',
      args: [rewardToken, backer],
    })
    return gaugeEstimatedRewards
  } catch (error) {
    console.error(`Error fetching rewards for ${backer}:`, error)
    return BigInt(0)
  }
}

async function main() {
  const rewardTokenAddress = await getRewardTokenAddress()
  const nftContractAddress = getAddress(process.argv[2])
  const boostPercentage = parseFloat(process.argv[3])
  if (!nftContractAddress || isNaN(boostPercentage)) {
    throw new Error('Usage: bun run nft-boosted-rewards -- <NFT_CONTRACT_ADDRESS> <BOOST_PERCENTAGE>')
  }
  console.info('Boost percentage: ', boostPercentage)
  if (boostPercentage < 0) {
    throw new Error('Boost percentage must be positive')
  }

  const blockNumber = await getLatestBlockNumber()
  console.info(`Latest block: ${blockNumber}`)

  const nftTransferEvents = await getNftTransferEvents(nftContractAddress)
  const holdersData: any = {}

  const gauges = await getAllGauges()

  const noDecimalsFactor = 100000
  const boost = BigInt(noDecimalsFactor * Math.round(1 + boostPercentage / 100))

  for (let i = 0; i < nftTransferEvents.length; i++) {
    const event = nftTransferEvents[i]
    const holderAddress = `0x${event.topics[2].slice(-40)}` as Address
    console.info(`Processing ${i + 1} of ${nftTransferEvents.length} events. Nft holder: ${holderAddress}`)
    const tokenId = BigInt(event.topics[3]).toString()
    for (const gauge of gauges) {
      const estimatedRBTCRewards = await estimatedGaugeRewards(rewardCoinbaseAddress, holderAddress, gauge)
      const estimatedRIFRewards = await estimatedGaugeRewards(rewardTokenAddress, holderAddress, gauge)

      const boostedRBTCRewards = (estimatedRBTCRewards * boost) / BigInt(noDecimalsFactor)
      const boostedRIFRewards = (estimatedRIFRewards * boost) / BigInt(noDecimalsFactor)

      holdersData[holderAddress] = {
        estimatedRBTCRewards: estimatedRBTCRewards.toString(),
        estimatedRIFRewards: estimatedRIFRewards.toString(),
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
  fs.writeFileSync(nftBoostPath, JSON.stringify(result, null, 2))
  console.log(`Nft boost file saved: ${nftBoostPath}`)

  fs.writeFileSync(nftActiveBoostPath, nftBoostFilename)
  console.log(`Active nft boost file saved: ${nftActiveBoostPath}`)
}

main().catch(console.error)
