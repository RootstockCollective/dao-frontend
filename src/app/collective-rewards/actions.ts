import { Address } from 'viem'
import { BackersManagerAddress } from '@/lib/contracts'
import {
  fetchBackerRewardsClaimedLogsByAddress,
  fetchBuilderRewardsClaimedLogsByAddress,
  fetchGaugeNotifyRewardLogsByAddress,
  fetchRewardDistributionFinishedLogsByAddress,
  fetchRewardDistributionRewardsLogsByAddress,
} from '@/lib/endpoints'
import { RIF_WALLET_SERVICES_URL } from '@/lib/constants'

const rws = RIF_WALLET_SERVICES_URL ?? ''

/* eslint-disable @typescript-eslint/no-explicit-any -- these endpoints return event logs consumed by viem's parseEventLogs which expects (Log | RpcLog)[] */
async function fetchRws(path: string): Promise<{ data: any }> {
  const res = await fetch(`${rws}${path}`)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  const data = await res.json()
  return { data }
}

export const fetchGaugeNotifyRewardLogs = (gaugeAddress: Address, fromBlock = 0) => {
  return fetchRws(
    fetchGaugeNotifyRewardLogsByAddress
      .replace('{{address}}', gaugeAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchBuilderRewardsClaimed = (gaugeAddress: Address, fromBlock = 0) => {
  return fetchRws(
    fetchBuilderRewardsClaimedLogsByAddress
      .replace('{{address}}', gaugeAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchBackerRewardsClaimed = (gaugeAddress: Address, fromBlock = 0) => {
  return fetchRws(
    fetchBackerRewardsClaimedLogsByAddress
      .replace('{{address}}', gaugeAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchRewardDistributionFinished = (fromBlock = 0) => {
  return fetchRws(
    fetchRewardDistributionFinishedLogsByAddress
      .replace('{{address}}', BackersManagerAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchRewardDistributionRewards = (fromBlock = 0) => {
  return fetchRws(
    fetchRewardDistributionRewardsLogsByAddress
      .replace('{{address}}', BackersManagerAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}
