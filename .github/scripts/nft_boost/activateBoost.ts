import * as fs from 'fs'
import { getAddress, zeroAddress } from 'viem'
import { getActions } from './actions.utils'
import { boostPercentage, nftContractAddress } from './process.utils'

const boostDataFolder = `nft_boost_data`
const nftActiveBoostPath = `${boostDataFolder}/latest`

;(async () => {
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
    const holderAddress = getAddress(`0x${event.topics[2].slice(-40)}`)
    if (holderAddress === zeroAddress) continue

    console.info(`Processing ${i + 1} of ${nftTransferEvents.length} events. Nft holder: ${holderAddress}`)
    const tokenId = BigInt(event.topics[3]).toString()

    let backerEstimatedRBTCRewards = 0n
    let backerEstimatedRIFRewards = 0n
    let backerBoostedRBTCRewards = 0n
    let backerBoostedRIFRewards = 0n
    for (const gauge of gauges) {
      const estimatedRewards = await estimatedGaugeRewards(holderAddress, gauge)

      const boostedRBTCRewards = (estimatedRewards.RBTC * boost) / BigInt(normalisationFactor)
      const boostedRIFRewards = (estimatedRewards.RIF * boost) / BigInt(normalisationFactor)

      backerEstimatedRBTCRewards += estimatedRewards.RBTC
      backerEstimatedRIFRewards += estimatedRewards.RIF
      backerBoostedRBTCRewards += boostedRBTCRewards
      backerBoostedRIFRewards += boostedRIFRewards
    }
    holdersData[holderAddress] = {
      estimatedRBTCRewards: backerEstimatedRBTCRewards.toString(),
      estimatedRIFRewards: backerEstimatedRIFRewards.toString(),
      boostedRBTCRewards: backerBoostedRBTCRewards.toString(),
      boostedRIFRewards: backerBoostedRIFRewards.toString(),
      tokenId,
    }
  }

  const result = {
    nftContractAddress,
    boostPercentage,
    calculationBlock: blockNumber.toString(),
    holders: holdersData,
  }

  const nftBoostFilename = `${nftContractAddress}-${blockNumber}.json`
  const nftBoostPath = `${boostDataFolder}/${nftBoostFilename}.txt`
  fs.mkdirSync(boostDataFolder, { recursive: true })
  fs.writeFileSync(nftBoostPath, JSON.stringify(result, null, 2))
  console.log(`Nft boost file saved: ${nftBoostPath}`)

  fs.writeFileSync(nftActiveBoostPath, nftBoostFilename)
  console.log(`Active nft boost file saved: ${nftActiveBoostPath}`)
})()
