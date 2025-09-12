import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { ProposalState } from '@/shared/types'
import { Dispatch, SetStateAction } from 'react'
import { AbiFunction, Address } from 'viem'
import { TokenRewards } from './rewards'

// API Response Types
export interface DailyAllocationItem {
  id: string
  day: number
  totalAllocation: string
}

export interface CycleRewardsItem {
  id: string
  rewardsERC20: string
  rewardsRBTC: string
  currentCycleStart: string
  currentCycleDuration: string
  previousCycleStart: string
  previousCycleDuration: string
  distributionDuration: string
  onDistributionPeriod: boolean
}

export type Builder = {
  proposal: BuilderProposal
  stateFlags?: BuilderStateFlags
  gauge?: Address
  address: Address
  builderName: string
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

export type StateWithUpdate<T> = {
  value: T
  onChange: Dispatch<SetStateAction<T>>
}

export type BackingPoint = {
  day: Date | number | string
  backing: bigint
  backingWei?: bigint
}

export type RewardsPoint = {
  day: Date | number | string
  rewards: {
    rif: number | bigint
    rbtc: number | bigint
    usd?: number
  }
}

export type CycleWindow = {
  label: string
  start: Date
  end: Date
  cycleDuration: number
  cycleNumber?: number
}

interface ChartDataPoint {
  day: Date
  backing?: bigint
  backingWei?: bigint
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
