import { Dispatch, SetStateAction } from 'react'
import { AbiFunction, Address } from 'viem'

import { BuilderRegistryAbi } from '@/lib/abis/tok/BuilderRegistryAbi'
import Big from '@/lib/big'
import { RewardTokenKey } from '@/lib/tokens'
import { ProposalState } from '@/shared/types'

import { TokenRewards } from './rewards'

// API Response Types
export interface DailyAllocationItem {
  id: string
  day: number
  totalAllocation: string
}

export interface CycleRewardsItem {
  id: string
  currentCycleStart: string
  currentCycleDuration: string
  distributionDuration: string
  onDistributionPeriod: boolean
  rewardPerToken: Record<string, string>
}

export interface Builder {
  proposal: BuilderProposal
  address: Address
  builderName: string
  stateFlags?: BuilderStateFlags
  gauge?: Address
  backerRewardPct?: BackerRewardPercentage
}

export interface BuilderWithRewardShares extends Required<Builder> {
  rewardShares: bigint
}

export interface BuilderEstimatedRewards extends BuilderWithRewardShares {
  builderEstimatedRewardsPct: bigint
  backerEstimatedRewardsPct: bigint
  builderEstimatedRewards: TokenRewards
  backerEstimatedRewards: TokenRewards
}

export interface BackerEstimatedRewards extends Required<Builder> {
  backerEstimatedRewards: TokenRewards
}

export interface BuilderRewardsSummary extends BuilderEstimatedRewards {
  totalAllocation: bigint
  totalAllocationPercentage: bigint
  lastCycleRewards: TokenRewards
}

type BuilderFunctionOutputs = Extract<
  Extract<(typeof BuilderRegistryAbi)[number], AbiFunction>,
  {
    name: 'builderState'
  }
>['outputs']

export type BuilderStateFlags = {
  [key in Exclude<BuilderFunctionOutputs[number]['name'], 'pausedReason' | 'reserved'>]: boolean
}

interface BuilderProposal {
  id: bigint
  name: string
  description: string
  date: string
}

export interface BackerRewardPercentage {
  current: bigint
  next: bigint
  previous: bigint
  cooldownEndTime: bigint
}

export type ProposalsToState = Record<string, ProposalState>

export type BuilderState = 'active' | 'inProgress'

export type CompleteBuilder = Required<Builder>

export interface StateWithUpdate<T> {
  value: T
  onChange: Dispatch<SetStateAction<T>>
}

export type CycleStatus = 'running' | 'settled'

export interface CycleTokenReward {
  tokenKey: RewardTokenKey
  symbol: string
  /** In the token's smallest unit. */
  value: bigint
  /** At current prices; no price history is kept. */
  fiatValue: Big
}

/**
 * One cycle of the rewards dashboard. Fields a source can't answer are `null`, never zero.
 * `id` is the indexer's row id; `cycleNumber` is derived from the start date, so key on `id`.
 */
export interface CycleHistoryEntry {
  id: string
  cycleNumber: number
  start: Date
  end: Date
  /** stRIF at the cycle's close, in whole tokens. `null` when the cycle predates the loaded snapshots. */
  backing: bigint | null
  rewards: CycleTokenReward[]
  rewardsFiat: Big
  /** Backers' fraction of the distribution, 0..1. `null` until the NotifyReward events load. */
  backersShare: number | null
  backersCount: number | null
  status: CycleStatus
}
