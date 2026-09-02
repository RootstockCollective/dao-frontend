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

export interface BackingPoint {
  day: Date | number | string
  backing: bigint
  backingWei?: bigint
}

export interface RewardsPoint {
  day: Date | number | string
  rewards: {
    rif: number | bigint
    rbtc: number | bigint
    usd?: number
  }
}

export interface CycleWindow {
  label: string
  start: Date
  end: Date
  cycleDuration: number
  cycleNumber?: number
}

interface ChartDataPoint extends BackingPoint {
  rewardsUSD?: bigint
  rewardsRif?: bigint
  rewardsRbtc?: bigint
  cycle?: number | null
  dayInCycle?: string | null
}

export interface TooltipPayload {
  payload: ChartDataPoint
  value: number
  name: string
  color: string
  dataKey: string
}

export type CycleStatus = 'running' | 'settled'

/** One reward token's contribution to a cycle's distribution. */
export interface CycleTokenReward {
  tokenKey: RewardTokenKey
  /** Display symbol for the current network (`RIF` on mainnet, `tRIF` on testnet). */
  symbol: string
  /** Amount in the token's smallest unit. */
  value: bigint
  /**
   * Value in USD at *current* prices. We keep no price history, so a settled cycle is
   * re-valued every time the market moves — the dashboard says so next to the figures.
   */
  fiatValue: Big
}

/** A single cycle as shown in the dashboard's history table and detail panel. */
export interface CycleHistoryEntry {
  cycleNumber: number
  start: Date
  end: Date
  /** Total stRIF backing at the cycle's close, in whole tokens. */
  backing: bigint
  rewards: CycleTokenReward[]
  /** Combined USD value of `rewards`, at current prices. */
  rewardsFiat: Big
  /**
   * Fraction of the distribution that went to Backers, 0..1. `null` when the NotifyReward
   * events for the cycle haven't loaded, which is different from a genuine 0% share.
   */
  backersShare: number | null
  /** Distinct Backers holding a positive allocation at the cycle's close. `null` when unknown. */
  backersCount: number | null
  status: CycleStatus
}
