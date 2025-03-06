import * as fs from 'fs'
import { Address, getAddress, zeroAddress } from 'viem'
import { getActions } from './actions.utils'
import { boostPercentage, nftContractAddress } from './process.utils'

export type HolderData = {
  estimatedRBTCRewards: bigint
  estimatedRIFRewards: bigint
  boostedRBTCRewards: bigint
  boostedRIFRewards: bigint
}

export type Holders = Record<Address, HolderData>

export type NftBoostData = {
  nftContractAddress: Address
  boostPercentage: number
  calculationBlock: number
  timestamp: bigint
  holders: Holders
}

const boostDataFolder = `nft_boost_data`
const nftActiveBoostPath = `${boostDataFolder}/latest`

;(async () => {
  const {
    getLatestBlockNumber,
    getNftTransferEvents,
    getBlockByNumber,
    getAllGauges,
    estimatedGaugeRewards,
  } = await getActions()

  const calculationBlock = Number(await getLatestBlockNumber())
  const { timestamp } = await getBlockByNumber(calculationBlock)
  console.info(`Latest block: ${calculationBlock}`)

  const nftTransferEvents = await getNftTransferEvents(nftContractAddress)

  const gauges = await getAllGauges()

  const normalisationFactor = 100_000 // Scaling factor to handle decimal values in BigInts. A ratio of 1.25 => 125_000
  const boost = BigInt(Math.round(normalisationFactor * (1 + boostPercentage / 100)))

  let holders: Holders = {}
  for (let i = 0; i < nftTransferEvents.length; i++) {
    const event = nftTransferEvents[i]
    /* FIXME: lower case addresses for v1.7
     * getAddress(`0x${event.topics[2].slice(-40)}`).toLowerCase()
     *   on v1.6.0 this will not work, as the address is not lower cased in the consumer
     */
    const holderAddress = getAddress(`0x${event.topics[2].slice(-40)}`)
    if (holderAddress === zeroAddress) continue

    console.info(`Processing ${i + 1} of ${nftTransferEvents.length} events. Nft holder: ${holderAddress}`)

    const { estimatedRBTCRewards, estimatedRIFRewards } = await gauges.reduce<
      Promise<Pick<HolderData, 'estimatedRBTCRewards' | 'estimatedRIFRewards'>>
    >(
      async (acc, gauge) => {
        const { estimatedRBTCRewards, estimatedRIFRewards } = await acc
        const { RBTC, RIF } = await estimatedGaugeRewards(holderAddress, gauge)
        return {
          estimatedRBTCRewards: estimatedRBTCRewards + RBTC,
          estimatedRIFRewards: estimatedRIFRewards + RIF,
        }
      },
      Promise.resolve({
        estimatedRBTCRewards: 0n,
        estimatedRIFRewards: 0n,
      }),
    )

    holders[holderAddress] = {
      estimatedRBTCRewards,
      estimatedRIFRewards,
      boostedRBTCRewards: (estimatedRBTCRewards * boost) / BigInt(normalisationFactor),
      boostedRIFRewards: (estimatedRIFRewards * boost) / BigInt(normalisationFactor),
    }
  }

  const nftBoostData: NftBoostData = {
    nftContractAddress,
    boostPercentage,
    calculationBlock,
    timestamp,
    holders,
  }
  const nftBoostFilename = `${nftContractAddress}-${calculationBlock}.json`
  const nftBoostPath = `${boostDataFolder}/${nftBoostFilename}`
  fs.mkdirSync(boostDataFolder, { recursive: true })
  fs.writeFileSync(
    nftBoostPath,
    JSON.stringify(
      nftBoostData,
      (_: string, value: unknown) => (typeof value === 'bigint' ? value.toString() : value),
      2,
    ),
  )
  console.log(`Nft boost file saved: ${nftBoostPath}`)

  fs.writeFileSync(nftActiveBoostPath, nftBoostFilename)
  console.log(`Active nft boost file saved: ${nftActiveBoostPath}`)
})()
